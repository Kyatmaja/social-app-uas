"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type NavUser = { name: string; username: string };

const menus = [
  { icon: "🏠", name: "Home", href: "/home" },
  { icon: "🌐", name: "Directory", href: "/users" },
  { icon: "👥", name: "Friends", href: "/friends" },
  { icon: "💌", name: "Requests", href: "/friend-requests" },
  { icon: "🔔", name: "Notifications", href: "/notifications" },
  { icon: "💬", name: "Messages", href: "/messages" },
  { icon: "🔎", name: "Search", href: "/search" },
  { icon: "❤️", name: "Likes", href: "/likes" },
  { icon: "👤", name: "Profile", href: "/profile" },
];

const moreMenus = [
  { icon: "⚙️", name: "Settings", href: "/settings" },
  { icon: "❓", name: "Help", href: "/help" },
  { icon: "ℹ️", name: "About", href: "/about" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [user, setUser] = useState<NavUser | null>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  // Baca user setiap pindah halaman (navbar tidak dibuat ulang setelah login)
  // dan tutup semua menu yang terbuka.
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      setUser(raw ? JSON.parse(raw) : null);
    } catch {
      setUser(null);
    }
    setMenuOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  // Klik di luar dropdown atau tekan Esc -> tutup dropdown
  useEffect(() => {
    if (!moreOpen) return;

    const onClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoreOpen(false);
    };

    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);

  if (pathname === "/") return null;

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const handleLogout = () => {
    localStorage.removeItem("user");
    setMenuOpen(false);
    setMoreOpen(false);
    router.push("/");
  };

  const initial = user?.name?.charAt(0) || "?";

  return (
    <header className="social-navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link href="/home" className="brand">
          <div className="brand-icon">S</div>
          <span>SocialConnect</span>
        </Link>

        {/* Mobile Toggle */}
        <button
          className="mobile-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        {/* Navigation */}
        <nav className={`navigation ${menuOpen ? "open" : ""}`}>
          {menus.map((menu) => (
            <Link
              key={menu.href}
              href={menu.href}
              title={menu.name}
              aria-label={menu.name}
              className={`menu-item ${isActive(menu.href) ? "active" : ""}`}
            >
              <span className="menu-icon">{menu.icon}</span>
              <span className="menu-label">{menu.name}</span>
            </Link>
          ))}

          <div className="nav-actions">
            <Link href="/create" className="create-button">
              + Create
            </Link>

            {/* Menu avatar (laptop / desktop) */}
            <div className="user-menu" ref={moreRef}>
              <button
                className="user-button"
                onClick={() => setMoreOpen(!moreOpen)}
                aria-haspopup="menu"
                aria-expanded={moreOpen}
                aria-label="Menu akun"
              >
                <span className="user-avatar">{initial}</span>
                <span className="user-caret">▾</span>
              </button>

              {moreOpen && (
                <div className="dropdown" role="menu">
                  <div className="dropdown-header">
                    <strong>{user?.name ?? "Pengguna"}</strong>
                    {user && <small>@{user.username}</small>}
                  </div>

                  {moreMenus.map((menu) => (
                    <Link
                      key={menu.href}
                      href={menu.href}
                      role="menuitem"
                      className={`dropdown-item ${isActive(menu.href) ? "active" : ""}`}
                    >
                      <span>{menu.icon}</span>
                      <span>{menu.name}</span>
                    </Link>
                  ))}

                  <button
                    className="dropdown-item danger"
                    role="menuitem"
                    onClick={handleLogout}
                  >
                    <span>🚪</span>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Daftar tambahan (khusus HP / tablet kecil) */}
          <div className="mobile-extra">
            {moreMenus.map((menu) => (
              <Link
                key={menu.href}
                href={menu.href}
                className={`menu-item ${isActive(menu.href) ? "active" : ""}`}
              >
                <span className="menu-icon">{menu.icon}</span>
                <span>{menu.name}</span>
              </Link>
            ))}
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </nav>
      </div>

      <style>{`
        .social-navbar {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: #ffffff;
          border-bottom: 1px solid #eeeaf4;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
        }

        .navbar-container {
          max-width: 1600px;
          margin: auto;
          padding: 14px 24px;
          display: flex;
          align-items: center;
          gap: 25px;
        }

        .navbar-container .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: #9333ea;
          font-size: 22px;
          font-weight: 800;
          white-space: nowrap;
        }

        .brand-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #9333ea, #ec4899);
          color: white;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 23px;
          box-shadow: 0 4px 12px #9333ea30;
        }

        .navigation {
          display: flex;
          align-items: center;
          gap: 4px;
          flex: 1;
        }

        .navigation .menu-item {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 11px;
          border-radius: 10px;
          color: #64748b;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .navigation .menu-item:hover {
          background: #faf5ff;
          color: #9333ea;
        }

        .navigation .menu-item.active {
          background: #f3e8ff;
          color: #9333ea;
          font-weight: 700;
        }

        .menu-icon {
          font-size: 17px;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-left: auto;
        }

        .nav-actions .create-button {
          background: linear-gradient(120deg, #9333ea, #ec4899);
          color: white;
          padding: 11px 17px;
          border-radius: 11px;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          white-space: nowrap;
          transition: 0.2s;
        }

        .nav-actions .create-button:hover {
          opacity: 0.85;
          transform: translateY(-2px);
        }

        /* ===== Menu avatar ===== */
        .user-menu {
          position: relative;
        }

        .user-button {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #faf5ff;
          border: 1px solid #f0e4fb;
          border-radius: 999px;
          padding: 4px 10px 4px 4px;
          cursor: pointer;
          transition: 0.2s;
        }

        .user-button:hover {
          background: #f3e8ff;
        }

        .user-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, #9333ea, #ec4899);
          color: white;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          text-transform: uppercase;
        }

        .user-caret {
          color: #9333ea;
          font-size: 12px;
        }

        .dropdown {
          position: absolute;
          right: 0;
          top: calc(100% + 10px);
          min-width: 220px;
          background: #fff;
          border: 1px solid #eeeaf4;
          border-radius: 16px;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
          padding: 8px;
          z-index: 1100;
        }

        .dropdown-header {
          display: flex;
          flex-direction: column;
          padding: 10px 12px 12px;
          border-bottom: 1px solid #f1edf7;
          margin-bottom: 6px;
        }

        .dropdown-header small {
          color: #94a3b8;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px 12px;
          border: none;
          background: transparent;
          border-radius: 10px;
          color: #475569;
          font-size: 14px;
          font-weight: 600;
          text-align: left;
          text-decoration: none;
          cursor: pointer;
        }

        .dropdown-item:hover {
          background: #faf5ff;
          color: #9333ea;
        }

        .dropdown-item.active {
          background: #f3e8ff;
          color: #9333ea;
        }

        .dropdown-item.danger {
          color: #e11d48;
          margin-top: 6px;
          border-top: 1px solid #f1edf7;
          border-radius: 0 0 10px 10px;
        }

        .dropdown-item.danger:hover {
          background: #fff1f2;
          color: #e11d48;
        }

        .logout-button {
          background: #fff1f2;
          color: #e11d48;
          border: 1px solid #ffe4e6;
          border-radius: 11px;
          padding: 10px 16px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s;
        }

        .logout-button:hover {
          background: #e11d48;
          color: white;
        }

        .mobile-toggle {
          display: none;
          background: #f3e8ff;
          color: #9333ea;
          border: none;
          border-radius: 10px;
          width: 42px;
          height: 42px;
          font-size: 22px;
          cursor: pointer;
        }

        .mobile-extra {
          display: none;
        }

        /* ===== Laptop: ikon saja (nama muncul saat kursor diarahkan) ===== */
        @media (min-width: 901px) and (max-width: 1400px) {
          .navigation .menu-label {
            display: none;
          }

          .navigation .menu-item {
            padding: 10px 12px;
          }

          .menu-icon {
            font-size: 20px;
          }
        }

        /* ===== HP / tablet kecil: hamburger ===== */
        @media (max-width: 900px) {
          .navbar-container {
            justify-content: space-between;
            flex-wrap: wrap;
          }

          .mobile-toggle {
            display: block;
          }

          .navigation {
            display: none;
            width: 100%;
            flex: 0 0 100%;
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }

          .navigation.open {
            display: flex;
          }

          .navigation .menu-item {
            justify-content: flex-start;
            padding: 13px;
            font-size: 14px;
          }

          .user-menu {
            display: none;
          }

          .nav-actions {
            margin-left: 0;
            margin-top: 6px;
          }

          .nav-actions .create-button {
            flex: 1;
            text-align: center;
          }

          .mobile-extra {
            display: flex;
            flex-direction: column;
            gap: 8px;
            border-top: 1px solid #f1edf7;
            padding-top: 8px;
          }

          .mobile-extra .logout-button {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .navbar-container {
            padding: 12px 16px;
          }

          .navbar-container .brand {
            font-size: 19px;
          }
        }
      `}</style>
    </header>
  );
}