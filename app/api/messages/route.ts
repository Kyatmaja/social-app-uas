import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const messages = await prisma.message.findMany({
      include: {
        sender: { select: { name: true, username: true } },
        receiver: { select: { name: true, username: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal memuat pesan' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { senderUsername, receiverUsername, content } = await request.json();

    const sender = await prisma.user.findUnique({ where: { username: senderUsername } });
    const receiver = await prisma.user.findUnique({ where: { username: receiverUsername } });

    if (!sender || !receiver) {
      return NextResponse.json({ success: false, error: 'User tidak ditemukan' }, { status: 404 });
    }

    const message = await prisma.message.create({
      data: {
        senderId: sender.id,
        receiverId: receiver.id,
        content,
      },
    });

    return NextResponse.json({ success: true, data: message }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal mengirim pesan' }, { status: 500 });
  }
}