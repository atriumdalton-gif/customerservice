import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const emails = await prisma.email.findMany({
    include: { drafts: true },
    orderBy: { receivedAt: "desc" },
  });

  // Aggregate by fromAddress
  const map = new Map<
    string,
    {
      email: string;
      name: string | null;
      ticketCount: number;
      lastContact: string;
      firstContact: string;
      statuses: string[];
      subjects: string[];
    }
  >();

  for (const e of emails) {
    const existing = map.get(e.fromAddress);
    if (existing) {
      existing.ticketCount++;
      existing.statuses.push(e.status);
      if (e.subject) existing.subjects.push(e.subject);
      if (e.fromName && !existing.name) existing.name = e.fromName;
      if (new Date(e.receivedAt) > new Date(existing.lastContact)) {
        existing.lastContact = e.receivedAt.toISOString();
      }
      if (new Date(e.receivedAt) < new Date(existing.firstContact)) {
        existing.firstContact = e.receivedAt.toISOString();
      }
    } else {
      map.set(e.fromAddress, {
        email: e.fromAddress,
        name: e.fromName,
        ticketCount: 1,
        lastContact: e.receivedAt.toISOString(),
        firstContact: e.receivedAt.toISOString(),
        statuses: [e.status],
        subjects: e.subject ? [e.subject] : [],
      });
    }
  }

  const customers = Array.from(map.values()).map((c) => ({
    ...c,
    openTickets: c.statuses.filter((s) => s === "pending").length,
    resolvedTickets: c.statuses.filter((s) => s === "sent" || s === "rejected").length,
  }));

  return NextResponse.json(customers);
}
