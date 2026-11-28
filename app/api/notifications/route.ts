import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getCurrentUserId } from "../../../lib/auth";

export const dynamic = "force-dynamic";

// GET: Mengambil semua notifikasi pengguna
export async function GET() {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Silakan login kembali",
        },
        { status: 401 }
      );
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const unreadCount = notifications.filter(
      (item) => !item.isRead
    ).length;

    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil notifikasi",
      },
      { status: 500 }
    );
  }
}

// PATCH: Menandai notifikasi sudah dibaca
export async function PATCH(request: Request) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Silakan login kembali",
        },
        { status: 401 }
      );
    }

    const { id, markAll } = await request.json();

    // Menandai semua notifikasi sudah dibaca
    if (markAll === true) {
      await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Semua notifikasi sudah dibaca",
      });
    }

    // Menandai satu notifikasi
    if (typeof id !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "ID tidak valid",
        },
        { status: 400 }
      );
    }

    const updated = await prisma.notification.updateMany({
      where: {
        id,
        userId,
      },
      data: {
        isRead: true,
      },
    });

    if (!updated.count) {
      return NextResponse.json(
        {
          success: false,
          message: "Notifikasi tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notifikasi sudah dibaca",
    });
  } catch (error) {
    console.error("UPDATE NOTIFICATION ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal memperbarui notifikasi",
      },
      { status: 500 }
    );
  }
}

// DELETE: Menghapus notifikasi
export async function DELETE(request: Request) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Silakan login kembali",
        },
        { status: 401 }
      );
    }

    const { id } = await request.json();

    if (typeof id !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "ID tidak valid",
        },
        { status: 400 }
      );
    }

    const deleted = await prisma.notification.deleteMany({
      where: {
        id,
        userId,
      },
    });

    if (!deleted.count) {
      return NextResponse.json(
        {
          success: false,
          message: "Notifikasi tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notifikasi berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE NOTIFICATION ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghapus notifikasi",
      },
      { status: 500 }
    );
  }
}