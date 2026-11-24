"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/") return null;

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm mb-4">
      <div className="container">
        <Link href="/home" className="navbar-brand fw-bold">
          SocialApp
        </Link>

        <ul className="navbar-nav me-auto flex-row gap-3">
          <li className="nav-item"><Link href="/home" className="nav-link">Dashboard</Link></li>
          <li className="nav-item"><Link href="/users" className="nav-link">User Directory</Link></li>
          <li className="nav-item"><Link href="/friends" className="nav-link">Friends</Link></li>
          <li className="nav-item"><Link href="/friend-requests" className="nav-link">Requests</Link></li>
          <li className="nav-item"><Link href="/notifications" className="nav-link">Notifications</Link></li>
          <li className="nav-item"><Link href="/messages" className="nav-link">Messages</Link></li>
          <li className="nav-item"><Link href="/search" className="nav-link">Search</Link></li>
          <li className="nav-item"><Link href="/create" className="nav-link">Create</Link></li>
          <li className="nav-item"><Link href="/profile" className="nav-link">Profile</Link></li>
        </ul>

        <button onClick={handleLogout} className="btn btn-danger btn-sm">
          Logout
        </button>
      </div>
    </nav>
  );
}