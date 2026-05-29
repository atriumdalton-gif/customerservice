import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const [emails, articles] = await Promise.all([
    prisma.email.findMany({ include: { drafts: true }, orderBy: { receivedAt: "desc" } }),
    prisma.article.count(),
  ]);

  const total = emails.length;
  const pending = emails.filter((e) => e.status === "pending").length;
  const sent = emails.filter((e) => e.status === "sent").length;
  const rejected = emails.filter((e) => e.status === "rejected").length;

  // Drafts that were sent without edits
  const draftsAccepted = emails.filter(
    (e) => e.status === "sent" && e.drafts.some((d) => d.sentAt && !d.wasEdited)
  ).length;
  const draftsEdited = emails.filter(
    (e) => e.status === "sent" && e.drafts.some((d) => d.sentAt && d.wasEdited)
  ).length;
  const acceptanceRate = sent > 0 ? Math.round((draftsAccepted / sent) * 100) : 0;

  // Priority breakdown
  const priorities: Record<string, number> = { urgent: 0, high: 0, normal: 0, low: 0 };
  for (const e of emails) {
    const p = e.priority || "normal";
    if (p in priorities) priorities[p]++;
  }

  // Sentiment breakdown
  const sentiments: Record<string, number> = { positive: 0, neutral: 0, negative: 0, frustrated: 0 };
  for (const e of emails) {
    const s = e.sentiment || "neutral";
    if (s in sentiments) sentiments[s]++;
  }

  // Channel breakdown
  const channels: Record<string, number> = {};
  for (const e of emails) {
    const ch = e.channel || "email";
    channels[ch] = (channels[ch] || 0) + 1;
  }

  // Tag frequency
  const tagCounts: Record<string, number> = {};
  for (const e of emails) {
    for (const t of e.tags) {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    }
  }
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([tag, count]) => ({ tag, count }));

  // Volume by day (last 7 days)
  const now = Date.now();
  const dailyVolume: { label: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(now - i * 86400000);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart.getTime() + 86400000);
    const count = emails.filter((e) => {
      const t = new Date(e.receivedAt).getTime();
      return t >= dayStart.getTime() && t < dayEnd.getTime();
    }).length;
    dailyVolume.push({
      label: dayStart.toLocaleDateString(undefined, { weekday: "short" }),
      count,
    });
  }

  // Response time (mock based on received -> draft created)
  const avgResponseMin = total > 0
    ? Math.round(
        emails.reduce((sum, e) => {
          if (e.drafts.length > 0) {
            const diff = new Date(e.drafts[0].createdAt).getTime() - new Date(e.receivedAt).getTime();
            return sum + Math.max(0, diff / 60000);
          }
          return sum;
        }, 0) / total
      )
    : 0;

  return NextResponse.json({
    total,
    pending,
    sent,
    rejected,
    acceptanceRate,
    draftsAccepted,
    draftsEdited,
    avgResponseMin,
    priorities,
    sentiments,
    channels,
    topTags,
    dailyVolume,
    articleCount: articles,
  });
}
