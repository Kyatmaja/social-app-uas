"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "../../lib/useCurrentUser";

export default function MyProfileRedirect() {
  const { user, ready } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (ready && user) router.replace(`/profile/${user.username}`);
  }, [ready, user, router]);

  if (ready && !user) {
    return (
      <div className="container py-4">
        <div className="alert alert-warning">
          Kamu belum login. <Link href="/">Login dulu</Link> untuk melihat profilmu.
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <p className="text-muted">Memuat profil...</p>
    </div>
  );
}