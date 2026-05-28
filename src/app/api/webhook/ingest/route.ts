import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { classify } from "@/lib/classify";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing API key" }, { status: 401 });
  }

  const apiKey = authHeader.slice(7);

  const connection = await prisma.connection.findUnique({
    where: { apiKey },
  });

  if (!connection) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  if (!connection.isActive) {
    return NextResponse.json({ error: "Connection is inactive" }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { fromAddress, fromName, subject, bodyPlain, channel, receivedAt } = body as {
    fromAddress?: string;
    fromName?: string;
    subject?: string;
    bodyPlain?: string;
    channel?: string;
    receivedAt?: string;
  };

  if (!fromAddress || !bodyPlain) {
    return NextResponse.json(
      { error: "fromAddress and bodyPlain are required" },
      { status: 400 }
    );
  }

  const classification = classify(subject || "", bodyPlain);

  const email = await prisma.email.create({
    data: {
      fromAddress,
      fromName: fromName || null,
      subject: subject || null,
      bodyPlain,
      channel: channel || "email",
      receivedAt: receivedAt ? new Date(receivedAt) : new Date(),
      connectionId: connection.id,
      source: connection.slug,
      priority: classification.priority,
      sentiment: classification.sentiment,
      tags: classification.tags,
    },
  });

  await prisma.connection.update({
    where: { id: connection.id },
    data: { lastEventAt: new Date() },
  });

  return NextResponse.json(
    {
      id: email.id,
      priority: classification.priority,
      sentiment: classification.sentiment,
      tags: classification.tags,
    },
    { status: 201 }
  );
}
