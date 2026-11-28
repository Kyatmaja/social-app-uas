import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

// GET /api/comments?postId=...
export async function GET(request: NextRequest) {
  try {
    const postId = request.nextUrl.searchParams.get("postId");
    if (!postId) {
      return NextResponse.json(
        { success: false, error: "postId wajib diisi" },
        { status: 400 }
      );
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        caption: true,
        imageUrl: true,
        createdAt: true,
        author: { select: { name: true, username: true } },
      },
    });
    if (!post) {
      return NextResponse.json(
        { success: false, error: "Postingan tidak ditemukan" },
        { status: 404 }
      );
    }

    const comments = await prisma.comment.findMany({
      where: { postId },
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: { select: { id: true, name: true, username: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ success: true, post, comments });
  } catch (error) {
    console.error("COMMENTS GET ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat komentar" },
      { status: 500 }
    );
  }
}

// POST /api/comments { postId, userId, content }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const postId = String(body.postId ?? "");
    const userId = Number(body.userId);
    const content = String(body.content ?? "").trim();

    if (!postId || !userId || !content) {
      return NextResponse.json(
        { success: false, error: "Komentar tidak boleh kosong" },
        { status: 400 }
      );
    }
    if (content.length > 500) {
      return NextResponse.json(
        { success: false, error: "Komentar maksimal 500 karakter" },
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

    const comment = await prisma.comment.create({
      data: { postId, authorId: userId, content },
    });

    if (post.authorId !== userId) {
      const commenter = await prisma.user.findUnique({
        where: { id: userId },
        select: { username: true },
      });
      await prisma.notification.create({
        data: {
          userId: post.authorId,
          content: `@${commenter?.username ?? "seseorang"} mengomentari postinganmu`,
        },
      });
    }

    return NextResponse.json({ success: true, data: comment }, { status: 201 });
  } catch (error) {
    console.error("COMMENTS POST ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengirim komentar" },
      { status: 500 }
    );
  }
}