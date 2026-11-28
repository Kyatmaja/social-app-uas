import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getCurrentUserId } from "../../../lib/auth";

export const dynamic = "force-dynamic";

// GET: Mengambil permintaan pertemanan
export async function GET() {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Silakan login kembali" },
        { status: 401 }
      );
    }

    const requests = await prisma.friendRequest.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      userId,
      data: requests,
    });
  } catch (error) {
    console.error("GET FRIEND REQUEST ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Gagal mengambil permintaan" },
      { status: 500 }
    );
  }
}

// POST: Mengirim permintaan pertemanan
export async function POST(request: Request) {
  try {
    const senderId = await getCurrentUserId();

    if (!senderId) {
      return NextResponse.json(
        { success: false, message: "Silakan login kembali" },
        { status: 401 }
      );
    }

    const { receiverId } = await request.json();

    if (
      !Number.isSafeInteger(receiverId) ||
      receiverId <= 0 ||
      senderId === receiverId
    ) {
      return NextResponse.json(
        { success: false, message: "Pengguna tidak valid" },
        { status: 400 }
      );
    }

    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { id: true },
    });

    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { name: true },
    });

    if (!receiver || !sender) {
      return NextResponse.json(
        { success: false, message: "Pengguna tidak ditemukan" },
        { status: 404 }
      );
    }

    const result = await prisma.$transaction(
      async (tx) => {
        const existing = await tx.friendRequest.findFirst({
          where: {
            OR: [
              { senderId, receiverId },
              {
                senderId: receiverId,
                receiverId: senderId,
              },
            ],
            status: {
              in: ["PENDING", "ACCEPTED"],
            },
          },
        });

        if (existing) return null;

        // Membuat friend request
        const friendRequest = await tx.friendRequest.create({
          data: {
            senderId,
            receiverId,
            status: "PENDING",
          },
        });

        // Membuat notifikasi untuk penerima
        await tx.notification.create({
          data: {
            userId: receiverId,
            content: `${sender.name} sent you a friend request.`,
            isRead: false,
          },
        });

        return friendRequest;
      },
      { isolationLevel: "Serializable" }
    );

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          message: "Permintaan atau pertemanan sudah ada",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Friend request berhasil dikirim",
      data: result,
    });
  } catch (error) {
    console.error("SEND FRIEND REQUEST ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Gagal mengirim permintaan" },
      { status: 500 }
    );
  }
}

// PATCH: Accept dan Decline
export async function PATCH(request: Request) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Silakan login kembali" },
        { status: 401 }
      );
    }

    const { id, status } = await request.json();

    if (
      typeof id !== "string" ||
      !["ACCEPTED", "DECLINED"].includes(status)
    ) {
      return NextResponse.json(
        { success: false, message: "Data tidak valid" },
        { status: 400 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const friendRequest = await tx.friendRequest.findFirst({
        where: {
          id,
          receiverId: userId,
          status: "PENDING",
        },
        include: {
          receiver: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!friendRequest) return false;

      const result = await tx.friendRequest.updateMany({
        where: {
          id,
          receiverId: userId,
          status: "PENDING",
        },
        data: { status },
      });

      if (!result.count) return false;

      // Membuat notifikasi jika request diterima
      if (status === "ACCEPTED") {
        await tx.notification.create({
          data: {
            userId: friendRequest.senderId,
            content: `${friendRequest.receiver.name} accepted your friend request.`,
            isRead: false,
          },
        });
      }

      return true;
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Permintaan tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Status berhasil diperbarui",
    });
  } catch (error) {
    console.error("UPDATE FRIEND REQUEST ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Gagal memperbarui permintaan" },
      { status: 500 }
    );
  }
}

// DELETE: Membatalkan permintaan
export async function DELETE(request: Request) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Silakan login kembali" },
        { status: 401 }
      );
    }

    const { id } = await request.json();

    if (typeof id !== "string") {
      return NextResponse.json(
        { success: false, message: "ID tidak valid" },
        { status: 400 }
      );
    }

    const deleted = await prisma.friendRequest.deleteMany({
      where: {
        id,
        senderId: userId,
        status: "PENDING",
      },
    });

    if (!deleted.count) {
      return NextResponse.json(
        { success: false, message: "Permintaan tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Permintaan dibatalkan",
    });
  } catch (error) {
    console.error("CANCEL FRIEND REQUEST ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Gagal membatalkan permintaan" },
      { status: 500 }
    );
  }
}