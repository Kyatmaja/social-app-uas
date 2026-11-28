"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "../../lib/useCurrentUser";
import "../feed.css";

export default function CreatePostPage() {
  const { user, ready } = useCurrentUser();
  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption, imageUrl, userId: user.id }),
      });
      const data = await res.json();

      if (res.ok) {
        router.push("/home");
        router.refresh();
      } else {
        alert(data.error || "Gagal membuat postingan");
      }
    } catch {
      alert("Tidak dapat terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  if (ready && !user) {
    return (
      <div className="container py-4">
        <div className="alert alert-warning">
          Kamu belum login. <Link href="/">Login dulu</Link> untuk membuat postingan.
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="card">
            <div className="card-body p-4">
              <h3 className="fc-title mb-1">✍️ Buat Postingan</h3>
              <p className="text-muted mb-4">Bagikan foto dan caption ke feed.</p>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">URL Foto (Opsional)</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://example.com/gambar.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>

                {imageUrl && (
                  <div className="mb-3 text-center">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="img-fluid rounded"
                      style={{ maxHeight: 200 }}
                    />
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">Caption</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    maxLength={500}
                    placeholder="Tulis caption..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    required
                  />
                  <div className="form-text">{caption.length}/500</div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? "Membagikan..." : "Share"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}