"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCurrentUser } from "../../lib/useCurrentUser";
import "../feed.css";

type LikedPost = {
  id: string;
  caption: string;
  imageUrl: string | null;
  createdAt: string;
  author: { name: string; username: string };
  _count: { likes: number; comments: number };
};

export default function LikesPage() {
  const { user, ready } = useCurrentUser();
  const [posts, setPosts] = useState<LikedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/likes?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setPosts(data.posts);
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, [user]);

  const unlike = async (postId: string) => {
    if (!user) return;
    const res = await fetch("/api/likes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, userId: user.id }),
    });
    const data = await res.json();
    if (data.success && !data.liked) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    }
  };

  if (ready && !user) {
    return (
      <div className="container py-4">
        <div className="alert alert-warning">
          Kamu belum login. <Link href="/">Login dulu</Link> untuk melihat postingan yang kamu sukai.
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-7">
          <h2 className="fc-title mb-1">❤️ Postingan yang Kamu Sukai</h2>
          <p className="text-muted mb-4">{posts.length} postingan</p>

          {loading && <p className="text-muted">Memuat...</p>}

          {!loading && posts.length === 0 && (
            <div className="card p-4 text-center text-muted">
              Belum ada postingan yang kamu sukai. Tekan 🤍 di{" "}
              <Link href="/home">Home</Link> untuk menyukai postingan.
            </div>
          )}

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
                  <Link href={`/profile/${p.author.username}`} className="text-dark">
                    @{p.author.username}
                  </Link>{" "}
                  <span className="text-muted fw-normal">({p.author.name})</span>
                </div>
                <p className="mb-2">{p.caption}</p>
                <div className="d-flex gap-2 align-items-center">
                  <button className="btn btn-sm btn-danger" onClick={() => unlike(p.id)}>
                    ❤️ {p._count.likes} · Batal suka
                  </button>
                  <Link
                    href={`/comments/${p.id}`}
                    className="btn btn-sm btn-outline-primary"
                  >
                    💬 {p._count.comments}
                  </Link>
                  <small className="text-muted ms-auto">
                    {new Date(p.createdAt).toLocaleDateString("id-ID")}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}