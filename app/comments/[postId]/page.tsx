"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCurrentUser } from "../../../lib/useCurrentUser";
import "../../feed.css";

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  author: { id: number; name: string; username: string };
};

type Post = {
  id: string;
  caption: string;
  imageUrl: string | null;
  createdAt: string;
  author: { name: string; username: string };
};

export default function CommentsPage() {
  const { postId } = useParams<{ postId: string }>();
  const { user } = useCurrentUser();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?postId=${postId}`);
      const data = await res.json();
      if (data.success) {
        setPost(data.post);
        setComments(data.comments);
        setError("");
      } else {
        setError(data.error || "Gagal memuat komentar");
      }
    } catch {
      setError("Tidak dapat terhubung ke server");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !text.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, userId: user.id, content: text.trim() }),
      });
      if (res.ok) {
        setText("");
        await load();
      } else {
        const data = await res.json();
        alert(data.error || "Gagal mengirim komentar");
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-7">
          <Link href="/home" className="btn btn-sm btn-outline-primary mb-3">
            ← Kembali ke Home
          </Link>
          <h2 className="fc-title mb-3">💬 Komentar</h2>

          {loading && <p className="text-muted">Memuat...</p>}
          {error && <div className="alert alert-danger">{error}</div>}

          {post && (
            <div className="card mb-4 overflow-hidden">
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt="Post"
                  style={{ maxHeight: 320, objectFit: "cover", width: "100%" }}
                />
              )}
              <div className="card-body">
                <div className="fw-bold">
                  @{post.author.username}{" "}
                  <span className="text-muted fw-normal">({post.author.name})</span>
                </div>
                <p className="mb-1 mt-2">{post.caption}</p>
                <small className="text-muted">
                  {new Date(post.createdAt).toLocaleDateString("id-ID")}
                </small>
              </div>
            </div>
          )}

          <h5 className="mb-3">Semua Komentar ({comments.length})</h5>

          {!loading && !error && comments.length === 0 && (
            <div className="card p-3 text-center text-muted mb-3">
              Belum ada komentar. Jadilah yang pertama!
            </div>
          )}

          {comments.map((c) => (
            <div key={c.id} className="card p-3 mb-2 flex-row gap-3">
              <div className="fc-avatar">{c.author.name.charAt(0)}</div>
              <div>
                <Link href={`/profile/${c.author.username}`} className="fw-bold text-dark">
                  {c.author.name}
                </Link>{" "}
                <span className="text-muted small">
                  @{c.author.username} ·{" "}
                  {new Date(c.createdAt).toLocaleString("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
                <div>{c.content}</div>
              </div>
            </div>
          ))}

          {user ? (
            <form onSubmit={handleSend} className="card p-3 mt-3">
              <div className="input-group">
                <input
                  className="form-control"
                  placeholder="Tulis komentar..."
                  value={text}
                  maxLength={500}
                  onChange={(e) => setText(e.target.value)}
                  required
                />
                <button className="btn btn-primary" type="submit" disabled={sending}>
                  {sending ? "..." : "Kirim"}
                </button>
              </div>
            </form>
          ) : (
            <div className="alert alert-warning mt-3">
              <Link href="/">Login dulu</Link> untuk menulis komentar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}