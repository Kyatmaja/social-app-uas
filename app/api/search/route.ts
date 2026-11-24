import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: { select: { name: true, username: true } },
        comments: true,
        likes: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: posts });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal memuat postingan' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { caption, imageUrl, username } = body;

    // Cari atau buat user dummy sementara jika belum login
    let user = await prisma.user.findUnique({ where: { username: username || 'kyatmaja' } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: 'Kyatmaja Lookman',
          username: 'kyatmaja',
          email: 'kyatmaja@example.com',
          password: 'password123',
        },
      });
    }

    const newPost = await prisma.post.create({
      data: {
        caption,
        imageUrl,
        authorId: user.id,
      },
    });

    return NextResponse.json({ success: true, data: newPost }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal membuat postingan' }, { status: 500 });
  }
}