"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCurrentUser } from "../../../lib/useCurrentUser";
import "../../feed.css";

type ProfileUser = {
  id: number;
  name: string;
  username: string;
  bio: string | null;
  createdAt: string;
};

type ProfilePost = {
  id: string;
  caption: string;
  imageUrl: string | null;
  createdAt: string;
  _count: { likes: number; comments: number };
};

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user: me } = useCurrentUser();
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [posts, setPosts] = useState<ProfilePost[]>([]);
  const [stats, setStats] = useState({ posts: 0, likes: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/profile?username=${encodeURIComponent(username)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProfile(data.user);
          setPosts(data.posts);
          setStats(data.stats);
        } else {
          setError(data.error || "Profil tidak ditemukan");
        }
      })
      .catch(() => setError("Tidak dapat terhubung ke server"))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div className="container py-4">
        <p className="text-muted">Memuat profil...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">{error || "Profil tidak ditemukan"}</div>
      </div>
    );
  }

  const isMe = me?.id === profile.id;

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card p-4 mb-4">
            <div className="d-flex flex-wrap align-items-center gap-4">
              <div className="fc-avatar fc-avatar-lg">{profile.name.charAt(0)}</div>
              <div className="flex-grow-1">
                <h3 className="fw-bold mb-0">{profile.name}</h3>
                <div className="text-muted mb-2">@{profile.username}</div>
                <p className="mb-2">{profile.bio || "Belum ada bio."}</p>
                <small className="text-muted">
                  Bergabung sejak{" "}
                  {new Date(profile.createdAt).toLocaleDateString("id-ID", {
                    month: "long",
                    year: "numeric",
                  })}
                </small>
              </div>
              {isMe && (
                <Link href="/settings" className="btn btn-outline-primary">
                  ⚙️ Edit Profil
                </Link>
              )}
            </div>

            <div className="row text-center mt-4 pt-3 border-top">
              <div className="col-6">
                <div className="fs-4 fw-bold">{stats.posts}</div>
                <div className="text-muted small">Postingan</div>
              </div>
              <div className="col-6">
                <div className="fs-4 fw-bold">{stats.likes}</div>
                <div className="text-muted small">Suka diterima</div>
              </div>
            </div>
          </div>

          <h5 className="mb-3">Postingan</h5>

          {posts.length === 0 && (
            <div className="card p-4 text-center text-muted">Belum ada postingan.</div>
          )}

          {posts.map((p) => (
            <div key={p.id} className="card mb-3 overflow-hidden">
              {p.imageUrl && (
                <img
                  src={p.imageUrl}
                  alt="Post"
                  style={{ maxHeight: 280, objectFit: "cover", width: "100%" }}
                />
              )}
              <div className="card-body">
                <p className="mb-2">{p.caption}</p>
                <div className="d-flex gap-3 align-items-center">
                  <small>❤️ {p._count.likes}</small>
                  <Link href={`/comments/${p.id}`} className="small">
                    💬 {p._count.comments} komentar
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