import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const articles = await prisma.article.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(articles);
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { title, body: articleBody, category, status } = body as {
    title?: string;
    body?: string;
    category?: string;
    status?: string;
  };

  if (!title || !articleBody) {
    return NextResponse.json({ error: "title and body are required" }, { status: 400 });
  }

  const article = await prisma.article.create({
    data: {
      title,
      body: articleBody,
      category: category || "general",
      status: status || "published",
    },
  });

  return NextResponse.json(article, { status: 201 });
}
