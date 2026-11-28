import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const q = (request.nextUrl.searchParams.get("q") || "").trim();

    const users = await prisma.user.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { username: { contains: q, mode: "insensitive" } },
            ],
          }
        : {},
      select: { id: true, name: true, username: true, bio: true },
      orderBy: { name: "asc" },
      take: 20,
    });

    const posts = await prisma.post.findMany({
      where: q
        ? {
            OR: [
              { caption: { contains: q, mode: "insensitive" } },
              { author: { username: { contains: q, mode: "insensitive" } } },
              { author: { name: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {},
      select: {
        id: true,
        caption: true,
        imageUrl: true,
        createdAt: true,
        author: { select: { name: true, username: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ success: true, users, posts });
  } catch (error) {
    console.error("SEARCH ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Gagal melakukan pencarian" },
      { status: 500 }
    );
  }
}