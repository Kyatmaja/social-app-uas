'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatePostPage() {
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caption,
        imageUrl,
        username: 'kyatmaja',
      }),
    });

    if (res.ok) {
      router.push('/');
      router.refresh();
    } else {
      alert('Gagal membuat postingan');
    }
    setLoading(false);
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card shadow-sm">
          <div className="card-body p-4">
            <h3 className="card-title mb-1">Buat Postingan</h3>
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
                  <img src={imageUrl} alt="Preview" className="img-fluid rounded" style={{ maxHeight: '200px' }} />
                </div>
              )}

              <div className="mb-3">
                <label className="form-label">Caption</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Tulis caption..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? 'Membagikan...' : 'Share'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}