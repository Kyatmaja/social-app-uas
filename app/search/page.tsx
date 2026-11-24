'use client';

import { useState } from 'react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ users: any[]; posts: any[] }>({ users: [], posts: [] });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    if (data.success) {
      setResults({ users: data.users, posts: data.posts });
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <h2 className="mb-3">Pencarian Pengguna & Postingan</h2>
        <form onSubmit={handleSearch} className="input-group mb-4">
          <input
            type="text"
            className="form-control"
            placeholder="Cari nama, username, atau caption..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="btn btn-primary" type="submit">Cari</button>
        </form>

        <h5>Pengguna Ditemukan ({results.users.length})</h5>
        <ul className="list-group mb-4">
          {results.users.map((u) => (
            <li key={u.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <strong>{u.name}</strong> <span className="text-muted">@{u.username}</span>
              </div>
              <span className="badge bg-secondary">User</span>
            </li>
          ))}
        </ul>

        <h5>Postingan Ditemukan ({results.posts.length})</h5>
        {results.posts.map((p) => (
          <div key={p.id} className="card mb-2">
            <div className="card-body">
              <strong>@{p.author?.username}:</strong> {p.caption}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}