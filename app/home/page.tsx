"use client";

import Link from "next/link";

export default function HomePage() {
  const menus = [
    { icon: "🏠", name: "Home", href: "/home" },
    { icon: "🔎", name: "User Directory", href: "/users" },
    { icon: "👥", name: "Friends List", href: "/friends" },
    { icon: "💌", name: "Friend Requests", href: "/requests" },
    { icon: "🔔", name: "Notifications", href: "/notifications" },
    { icon: "👤", name: "Profile", href: "/profile" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-72 bg-white border-r border-gray-200 flex-col p-6">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-10">
          SocialConnect
        </h1>

        <nav className="flex flex-col gap-3">
          {menus.map((menu) => (
            <Link
              key={menu.href}
              href={menu.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition hover:bg-purple-50 ${
                menu.href === "/home"
                  ? "bg-purple-100 text-purple-700 font-bold"
                  : "text-gray-700"
              }`}
            >
              <span className="text-xl">{menu.icon}</span>
              <span>{menu.name}</span>
            </Link>
          ))}
        </nav>

        <Link
          href="/"
          className="mt-auto text-red-500 font-semibold px-4 py-3 hover:bg-red-50 rounded-xl"
        >
          🚪 Back to Login
        </Link>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 px-4 py-8 pb-24 md:pb-8">
        <div className="max-w-2xl mx-auto">
          <div className="md:hidden mb-8">
            <h1 className="text-2xl font-bold text-purple-600">
              SocialConnect
            </h1>
          </div>

          <h2 className="text-2xl font-bold mb-6">
            Home
          </h2>

          {/* Empty Feed */}
          <div className="bg-white border border-gray-200 rounded-2xl p-10 min-h-96 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="text-6xl mb-5">📷</div>

            <h3 className="text-xl font-bold mb-2">
              Belum Ada Postingan
            </h3>

            <p className="text-gray-500 max-w-sm">
              Postingan dari pengguna akan muncul di sini.
            </p>
          </div>
        </div>
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-4 text-2xl">
        <Link href="/home">🏠</Link>
        <Link href="/users">🔎</Link>
        <Link href="/friends">👥</Link>
        <Link href="/notifications">🔔</Link>
      </nav>
    </div>
  );
}