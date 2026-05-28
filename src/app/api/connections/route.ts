import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export async function GET() {
  const connections = await prisma.connection.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { emails: true } },
    },
  });

  return NextResponse.json(connections);
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, slug } = body as { name?: string; slug?: string };

  if (!name || !slug) {
    return NextResponse.json({ error: "name and slug are required" }, { status: 400 });
  }

  const slugRegex = /^[a-z0-9-]+$/;
  if (!slugRegex.test(slug)) {
    return NextResponse.json(
      { error: "slug must be lowercase alphanumeric with dashes" },
      { status: 400 }
    );
  }

  const existing = await prisma.connection.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "slug already exists" }, { status: 409 });
  }

  const apiKey = crypto.randomUUID();

  const connection = await prisma.connection.create({
    data: { name, slug, apiKey },
  });

  return NextResponse.json(
    { ...connection, apiKey },
    { status: 201 }
  );
}
