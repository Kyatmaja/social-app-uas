import { prisma } from "../../../lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { name, username, email, password } =
      await request.json();

    if (!name || !username || !email || !password) {
      return NextResponse.json(
        { message: "Semua kolom wajib diisi" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password minimal 6 karakter" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username }
        ]
      }
    });

    if (existing) {
      return NextResponse.json(
        { message: "Email atau username sudah digunakan" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        username,
        email: email.toLowerCase(),
        password: hashedPassword
      }
    });

    return NextResponse.json(
      { message: "Registrasi berhasil" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}