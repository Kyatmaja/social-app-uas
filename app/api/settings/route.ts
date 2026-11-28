import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/prisma";

const userSelect = {
  id: true,
  name: true,
  username: true,
  email: true,
  bio: true,
};

// GET /api/settings?userId=1
export async function GET(request: NextRequest) {
  const userId = Number(request.nextUrl.searchParams.get("userId"));
  if (!userId) {
    return NextResponse.json({ message: "userId wajib diisi" }, { status: 400 });
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userSelect,
  });
  if (!user) {
    return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
  }
  return NextResponse.json({ user });
}

// PATCH /api/settings  { action: "profile" | "password", userId, ... }
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = Number(body.userId);
    if (!userId) {
      return NextResponse.json({ message: "userId wajib diisi" }, { status: 400 });
    }

    // ----- Ganti password -----
    if (body.action === "password") {
      const { currentPassword, newPassword } = body;
      if (!currentPassword || !newPassword || String(newPassword).length < 6) {
        return NextResponse.json(
          { message: "Password baru minimal 6 karakter" },
          { status: 400 }
        );
      }
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
      }
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) {
        return NextResponse.json({ message: "Password lama salah" }, { status: 401 });
      }
      await prisma.user.update({
        where: { id: userId },
        data: { password: await bcrypt.hash(newPassword, 10) },
      });
      return NextResponse.json({ message: "Password berhasil diganti" });
    }

    // ----- Edit profil -----
    const name = String(body.name ?? "").trim();
    const username = String(body.username ?? "").trim();
    const bio = String(body.bio ?? "").trim();

    if (!name || !username) {
      return NextResponse.json(
        { message: "Nama dan username wajib diisi" },
        { status: 400 }
      );
    }
    if (!/^[a-zA-Z0-9_.]{3,20}$/.test(username)) {
      return NextResponse.json(
        { message: "Username 3-20 karakter: huruf, angka, titik, atau underscore" },
        { status: 400 }
      );
    }

    const taken = await prisma.user.findFirst({
      where: { username, NOT: { id: userId } },
    });
    if (taken) {
      return NextResponse.json({ message: "Username sudah dipakai" }, { status: 409 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, username, bio },
      select: userSelect,
    });
    return NextResponse.json({ message: "Profil berhasil disimpan", user });
  } catch (error) {
    console.error("SETTINGS ERROR:", error);
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}