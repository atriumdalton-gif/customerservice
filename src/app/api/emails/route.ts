import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where = status && status !== "all" ? { status } : {};

  const emails = await prisma.email.findMany({
    where,
    include: { drafts: true },
    orderBy: { receivedAt: "desc" },
  });

  return NextResponse.json(emails);
}
