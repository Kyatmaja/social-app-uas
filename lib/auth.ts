import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function getCurrentUserId(): Promise<number | null> {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get("session")?.value;

    const secret = process.env.JWT_SECRET;

    if (!token || !secret) {
      return null;
    }

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
      { algorithms: ["HS256"] }
    );

    if (
      typeof payload.userId !== "number" ||
      !Number.isSafeInteger(payload.userId) ||
      payload.userId <= 0
    ) {
      return null;
    }

    return payload.userId;

  } catch {
    return null;
  }
}