import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

// GET /api/messages?userId=1  -> semua pesan milik user + daftar kontak
export async function GET(request: NextRequest) {
  try {
    const userId = Number(request.nextUrl.searchParams.get("userId"));
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId wajib diisi" },
        { status: 400 }
      );
    }

    const [messages, contacts] = await Promise.all([
      prisma.message.findMany({
        where: { OR: [{ senderId: userId }, { receiverId: userId }] },
        select: {
          id: true,
          senderId: true,
          receiverId: true,
          content: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.user.findMany({
        where: { id: { not: userId } },
        select: { id: true, name: true, username: true },
        orderBy: { name: "asc" },
        take: 100,
      }),
    ]);

    return NextResponse.json({ success: true, messages, contacts });
  } catch (error) {
    console.error("MESSAGES GET ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat pesan" },
      { status: 500 }
    );
  }
}

// POST /api/messages  { senderId, receiverId, content }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const senderId = Number(body.senderId);
    const receiverId = Number(body.receiverId);
    const content = String(body.content ?? "").trim();

    if (!senderId || !receiverId || !content) {
      return NextResponse.json(
        { success: false, error: "Data pesan tidak lengkap" },
        { status: 400 }
      );
    }
    if (senderId === receiverId) {
      return NextResponse.json(
        { success: false, error: "Tidak bisa mengirim pesan ke diri sendiri" },
        { status: 400 }
      );
    }

    const [sender, receiver] = await Promise.all([
      prisma.user.findUnique({ where: { id: senderId } }),
      prisma.user.findUnique({ where: { id: receiverId } }),
    ]);
    if (!sender || !receiver) {
      return NextResponse.json(
        { success: false, error: "Pengguna tidak ditemukan" },
        { status: 404 }
      );
    }

    const message = await prisma.message.create({
      data: { senderId, receiverId, content },
    });

    // Notifikasi untuk penerima (memakai model Notification milik tim)
    await prisma.notification.create({
      data: {
        userId: receiverId,
        content: `Pesan baru dari @${sender.username}`,
      },
    });

    return NextResponse.json({ success: true, data: message }, { status: 201 });
  } catch (error) {
    console.error("MESSAGES POST ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengirim pesan" },
      { status: 500 }
    );
  }
}