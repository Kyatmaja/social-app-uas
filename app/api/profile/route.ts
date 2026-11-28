import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

// GET /api/profile?username=kyatmaja
export async function GET(request: NextRequest) {
  try {
    const username = request.nextUrl.searchParams.get("username");
    if (!username) {
      return NextResponse.json(
        { success: false, error: "username wajib diisi" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true, name: true, username: true, bio: true, createdAt: true },
    });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Pengguna tidak ditemukan" },
        { status: 404 }
      );
    }

    const posts = await prisma.post.findMany({
      where: { authorId: user.id },
      select: {
        id: true,
        caption: true,
        imageUrl: true,
        createdAt: true,
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalLikes = posts.reduce((sum, p) => sum + p._count.likes, 0);

    return NextResponse.json({
      success: true,
      user,
      posts,
      stats: { posts: posts.length, likes: totalLikes },
    });
  } catch (error) {
    console.error("PROFILE ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat profil" },
      { status: 500 }
    );
  }
}