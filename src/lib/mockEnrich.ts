import type {
  Email,
  EnrichedEmail,
  Priority,
  Sentiment,
  Channel,
  CustomerProfile,
  AiInsight,
  InboxStats,
} from "@/types/email";

function simpleHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

const PRIORITIES: Priority[] = ["urgent", "high", "normal", "low"];
export function derivePriority(email: Email): Priority {
  return PRIORITIES[simpleHash(email.id + "pri") % PRIORITIES.length];
}

const SENTIMENTS: Sentiment[] = ["positive", "neutral", "negative", "frustrated"];
export function deriveSentiment(email: Email): Sentiment {
  return SENTIMENTS[simpleHash(email.id + "sent") % SENTIMENTS.length];
}

const CHANNELS: Channel[] = ["email", "chat", "phone", "sms"];
export function deriveChannel(email: Email): Channel {
  return CHANNELS[simpleHash(email.id + "ch") % CHANNELS.length];
}

export function deriveSlaMinutesRemaining(email: Email): number {
  const h = simpleHash(email.id + "sla");
  return (h % 480) - 60;
}

const TAG_POOL = [
  "billing",
  "refund",
  "onboarding",
  "bug-report",
  "feature-request",
  "account",
  "integration",
  "shipping",
  "cancellation",
  "upgrade",
];

export function deriveTags(email: Email): string[] {
  const h = simpleHash(email.id + "tags");
  const count = (h % 3) + 1;
  const tags: string[] = [];
  for (let i = 0; i < count; i++) {
    tags.push(TAG_POOL[(h + i * 7) % TAG_POOL.length]);
  }
  return [...new Set(tags)];
}

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-indigo-500",
  "bg-pink-500",
];

export function deriveCustomerProfile(email: Email): CustomerProfile {
  const h = simpleHash(email.id + "cust");
  const displayName = email.fromName || email.fromAddress.split("@")[0].replace(/[._]/g, " ");
  const initials = displayName
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const domain = email.fromAddress.split("@")[1] || "";

  return {
    name: displayName,
    email: email.fromAddress,
    avatarInitials: initials || "??",
    avatarColor: AVATAR_COLORS[h % AVATAR_COLORS.length],
    ticketCount: 1,
    firstSeen: email.receivedAt || email.createdAt,
    source: (email as unknown as Record<string, unknown>).channel as string || domain,
  };
}

const ACTIONS = [
  "Offer a 20% discount on renewal",
  "Escalate to engineering team",
  "Send knowledge base article #412",
  "Schedule a call with account manager",
  "Process refund and send confirmation",
  "Provide step-by-step setup guide",
  "Transfer to billing department",
  "Apply credit to account",
];
const TONES = ["empathetic", "professional", "friendly", "apologetic", "direct"];

export function deriveAiInsight(email: Email): AiInsight {
  const h = simpleHash(email.id + "ai");
  const bodyWords = email.bodyPlain.split(/\s+/).slice(0, 20).join(" ");
  const summaryText = bodyWords.length > 80 ? bodyWords.slice(0, 80) + "..." : bodyWords;

  return {
    summary: `Customer is inquiring about: ${summaryText || email.subject || "general inquiry"}`,
    confidence: 70 + (h % 30),
    suggestedAction: ACTIONS[h % ACTIONS.length],
    keyPoints: [
      `Issue relates to ${deriveTags(email)[0] || "general inquiry"}`,
      `${deriveCustomerProfile(email).ticketCount} previous tickets`,
      `${deriveSentiment(email)} sentiment detected`,
    ],
    recommendedTone: TONES[h % TONES.length],
  };
}

export function enrichEmail(email: Email): EnrichedEmail {
  return {
    ...email,
    priority: derivePriority(email),
    sentiment: deriveSentiment(email),
    channel: deriveChannel(email),
    slaMinutesRemaining: deriveSlaMinutesRemaining(email),
    tags: deriveTags(email),
    customerProfile: deriveCustomerProfile(email),
    aiInsight: deriveAiInsight(email),
  };
}

export function computeStats(emails: EnrichedEmail[]): InboxStats {
  const total = emails.length;
  const open = emails.filter((e) => e.status === "pending").length;
  const sent = emails.filter((e) => e.status === "sent").length;
  const urgent = emails.filter((e) => e.priority === "urgent").length;
  const withDrafts = emails.filter((e) => e.drafts && e.drafts.length > 0).length;
  const aiRate = total > 0 ? Math.round((withDrafts / total) * 100) : 0;

  return {
    openTickets: open,
    avgResponseMinutes: 0,
    autoResolvedPercent: aiRate,
    csat: total > 0 ? Math.round((sent / total) * 100) : 0,
    urgentCount: urgent,
  };
}
