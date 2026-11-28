"use client";

import { useEffect, useState } from "react";

type UserResult = {
  id: number;
  name: string;
  username: string;
  bio: string | null;
};

type PostResult = {
  id: string;
  caption: string;
  imageUrl: string | null;
  createdAt: string;
  author: { name: string; username: string };
  _count: { likes: number; comments: number };
};

type Tab = "all" | "users" | "posts";

function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${safe})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === q.toLowerCase() ? (
          <mark key={i}>{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [users, setUsers] = useState<UserResult[]>([]);
  const [posts, setPosts] = useState<PostResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Pencarian otomatis (debounce 300 ms) setiap kali mengetik
  useEffect(() => {
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (data.success) {
          setUsers(data.users);
          setPosts(data.posts);
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") console.error(error);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const showUsers = tab === "all" || tab === "users";
  const showPosts = tab === "all" || tab === "posts";
  const empty =
    !loading &&
    ((showUsers ? users.length : 0) + (showPosts ? posts.length : 0) === 0);

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <h2 className="page-title mb-1">🔎 Pencarian</h2>
          <p className="text-muted mb-3">
            Temukan teman dan postingan. Hasil muncul otomatis saat kamu mengetik.
          </p>

          <input
            type="text"
            className="form-control form-control-lg mb-3"
            placeholder="Cari nama, username, atau caption..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />

          <div className="pill-tabs mb-4">
            <button
              className={`pill-tab ${tab === "all" ? "active" : ""}`}
              onClick={() => setTab("all")}
            >
              Semua
            </button>
            <button
              className={`pill-tab ${tab === "users" ? "active" : ""}`}
              onClick={() => setTab("users")}
            >
              Pengguna ({users.length})
            </button>
            <button
              className={`pill-tab ${tab === "posts" ? "active" : ""}`}
              onClick={() => setTab("posts")}
            >
              Postingan ({posts.length})
            </button>
          </div>

          {loading && <p className="text-muted">Mencari...</p>}

          {empty && (
            <div className="card p-4 text-center text-muted">
              😕 Tidak ada hasil untuk &ldquo;{query}&rdquo;
            </div>
          )}

          {showUsers && users.length > 0 && (
            <>
              <h5 className="mb-3">Pengguna</h5>
              <div className="mb-4">
                {users.map((u) => (
                  <div key={u.id} className="card p-3 mb-2 flex-row align-items-center gap-3">
                    <div className="avatar">{u.name.charAt(0)}</div>
                    <div className="flex-grow-1">
                      <div className="fw-bold">
                        <Highlight text={u.name} query={query} />
                      </div>
                      <div className="text-muted small">
                        @<Highlight text={u.username} query={query} />
                      </div>
                      {u.bio && <div className="small mt-1">{u.bio}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {showPosts && posts.length > 0 && (
            <>
              <h5 className="mb-3">Postingan</h5>
              {posts.map((p) => (
                <div key={p.id} className="card mb-3 overflow-hidden">
                  {p.imageUrl && (
                    <img
                      src={p.imageUrl}
                      alt="Post"
                      style={{ maxHeight: 260, objectFit: "cover", width: "100%" }}
                    />
                  )}
                  <div className="card-body">
                    <div className="fw-bold mb-1">
                      @<Highlight text={p.author.username} query={query} />
                      <span className="text-muted fw-normal"> ({p.author.name})</span>
                    </div>
                    <p className="mb-2">
                      <Highlight text={p.caption} query={query} />
                    </p>
                    <small className="text-muted">
                      ❤️ {p._count.likes} · 💬 {p._count.comments} ·{" "}
                      {new Date(p.createdAt).toLocaleDateString("id-ID")}
                    </small>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}