import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

// GET /api/posts -> semua postingan (terbaru di atas)
export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: { select: { id: true, name: true, username: true } },
        likes: { select: { userId: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: posts });
  } catch (error) {
    console.error("POSTS GET ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat postingan" },
      { status: 500 }
    );
  }
}

// POST /api/posts { caption, imageUrl?, userId }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = Number(body.userId);
    const caption = String(body.caption ?? "").trim();
    const imageUrl = String(body.imageUrl ?? "").trim();

    if (!userId || !caption) {
      return NextResponse.json(
        { success: false, error: "Caption dan user wajib diisi" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User tidak ditemukan, silakan login ulang" },
        { status: 404 }
      );
    }

    const post = await prisma.post.create({
      data: { caption, imageUrl: imageUrl || null, authorId: userId },
    });

    return NextResponse.json({ success: true, data: post }, { status: 201 });
  } catch (error) {
    console.error("POSTS POST ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Gagal membuat postingan" },
      { status: 500 }
    );
  }
}

// DELETE /api/posts?id=...&userId=1 -> hanya penulis yang boleh menghapus
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    const userId = Number(request.nextUrl.searchParams.get("userId"));
    if (!id || !userId) {
      return NextResponse.json(
        { success: false, error: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    const post = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true },
    });
    if (!post) {
      return NextResponse.json(
        { success: false, error: "Postingan tidak ditemukan" },
        { status: 404 }
      );
    }
    if (post.authorId !== userId) {
      return NextResponse.json(
        { success: false, error: "Hanya penulis yang bisa menghapus" },
        { status: 403 }
      );
    }

    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POSTS DELETE ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus postingan" },
      { status: 500 }
    );
  }
}