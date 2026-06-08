import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateDraft } from "@/lib/ai";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const email = await prisma.email.findUnique({ where: { id } });
  if (!email) {
    return NextResponse.json({ error: "Email not found" }, { status: 404 });
  }

  const result = await generateDraft({
    fromName: email.fromName,
    fromAddress: email.fromAddress,
    subject: email.subject,
    bodyPlain: email.bodyPlain,
    priority: email.priority,
    sentiment: email.sentiment,
    tags: email.tags,
  });

  const draft = await prisma.draft.create({
    data: {
      emailId: email.id,
      originalDraft: result.draft,
    },
  });

  return NextResponse.json({
    id: draft.id,
    originalDraft: draft.originalDraft,
    summary: result.summary,
    suggestedAction: result.suggestedAction,
    keyPoints: result.keyPoints,
    recommendedTone: result.recommendedTone,
    confidence: result.confidence,
  });
}
