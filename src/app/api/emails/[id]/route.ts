import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const email = await prisma.email.findUnique({
    where: { id },
    include: { drafts: true },
  });

  if (!email) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(email);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { status, finalSentText, draftId, wasEdited } = body;

  if (!status || !["sent", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const email = await prisma.email.update({
    where: { id },
    data: { status },
  });

  // If sending, update the draft with final text
  if (status === "sent" && draftId && finalSentText) {
    await prisma.draft.update({
      where: { id: draftId },
      data: {
        finalSentText,
        wasEdited: wasEdited === "true",
        sentAt: new Date(),
      },
    });
  }

  return NextResponse.json(email);
}
