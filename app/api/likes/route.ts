import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

// GET /api/likes?userId=1 -> postingan yang disukai user
export async function GET(request: NextRequest) {
  try {
    const userId = Number(request.nextUrl.searchParams.get("userId"));
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId wajib diisi" },
        { status: 400 }
      );
    }

    const likes = await prisma.like.findMany({
      where: { userId },
      include: {
        post: {
          select: {
            id: true,
            caption: true,
            imageUrl: true,
            createdAt: true,
            author: { select: { name: true, username: true } },
            _count: { select: { likes: true, comments: true } },
          },
        },
      },
    });

    const posts = likes
      .map((l) => l.post)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return NextResponse.json({ success: true, posts });
  } catch (error) {
    console.error("LIKES GET ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat daftar suka" },
      { status: 500 }
    );
  }
}

// POST /api/likes { postId, userId } -> suka / batal suka (toggle)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const postId = String(body.postId ?? "");
    const userId = Number(body.userId);

    if (!postId || !userId) {
      return NextResponse.json(
        { success: false, error: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });
    if (!post) {
      return NextResponse.json(
        { success: false, error: "Postingan tidak ditemukan" },
        { status: 404 }
      );
    }

    const existing = await prisma.like.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    let liked: boolean;
    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      liked = false;
    } else {
      await prisma.like.create({ data: { postId, userId } });
      liked = true;

      if (post.authorId !== userId) {
        const liker = await prisma.user.findUnique({
          where: { id: userId },
          select: { username: true },
        });
        await prisma.notification.create({
          data: {
            userId: post.authorId,
            content: `@${liker?.username ?? "seseorang"} menyukai postinganmu`,
          },
        });
      }
    }

    const count = await prisma.like.count({ where: { postId } });
    return NextResponse.json({ success: true, liked, count });
  } catch (error) {
    console.error("LIKES POST ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memproses suka" },
      { status: 500 }
    );
  }
}