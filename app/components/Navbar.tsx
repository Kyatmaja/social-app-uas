"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  if (pathname === "/") return null;

  const menus = [
    { icon: "🏠", name: "Home", href: "/home" },
    { icon: "🌐", name: "Directory", href: "/users" },
    { icon: "👥", name: "Friends", href: "/friends" },
    { icon: "💌", name: "Requests", href: "/friend-requests" },
    { icon: "🔔", name: "Notifications", href: "/notifications" },
    { icon: "💬", name: "Messages", href: "/messages" },
    { icon: "🔎", name: "Search", href: "/search" },
    { icon: "👤", name: "Profile", href: "/profile" },
    { icon: "⚙️", name: "Settings", href: "/settings" },
    { icon: "❓", name: "Help", href: "/help" },
    { icon: "ℹ️", name: "About", href: "/about" },  
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    setMenuOpen(false);
    router.push("/");
  };

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
              onClick={() => setMenuOpen(false)}
              className={`menu-item ${
                pathname === menu.href ? "active" : ""
              }`}
            >
              <span className="menu-icon">
                {menu.icon}
              </span>

              <span>{menu.name}</span>
            </Link>
          ))}

          <div className="nav-actions">

            <Link
              href="/create"
              className="create-button"
              onClick={() => setMenuOpen(false)}
            >
              + Create
            </Link>

            <button
              className="logout-button"
              onClick={handleLogout}
            >
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
          padding: 16px 24px;
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
          background: linear-gradient(
            135deg,
            #9333ea,
            #ec4899
          );
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
          gap: 5px;
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
          background: linear-gradient(
            120deg,
            #9333ea,
            #ec4899
          );
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

        @media (max-width: 1700px) {
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

          .nav-actions {
            margin-left: 0;
            margin-top: 10px;
          }

          .nav-actions .create-button {
            flex: 1;
            text-align: center;
          }

          .logout-button {
            flex: 1;
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