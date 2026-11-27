"use client";

import { useState, useEffect } from "react";

type User = {
  id: number;
  name: string;
  username: string;
  bio: string | null;
  createdAt: string;
};

const colors = [
  "#8b5cf6",
  "#ec4899",
  "#3b82f6",
  "#14b8a6",
  "#f59e0b",
  "#ef4444",
];

export default function UserDirectoryPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [pending, setPending] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/users", {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load users"
          );
        }

        return data.data as User[];
      })
      .then((data) => {
        if (!controller.signal.aborted) {
          setUsers(data);
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.username.toLowerCase().includes(search.toLowerCase())
  );

  const toggleRequest = (id: number) => {
    setPending((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div
      className="container py-4"
      style={{ maxWidth: 1100 }}
    >
      {/* Banner */}
      <div
        className="rounded-4 p-4 p-md-5 text-white mb-4"
        style={{
          background:
            "linear-gradient(135deg, #9333ea, #ec4899)",
        }}
      >
        <h1 className="fw-bold">
          🌐 User Directory
        </h1>

        <p className="mb-0">
          Discover people on SocialConnect.
        </p>
      </div>

      {/* Statistics */}
      <div className="row g-3 mb-4">
        <div className="col-6">
          <div className="card border-0 shadow-sm p-3 text-center">
            <h2 className="fw-bold text-primary">
              {users.length}
            </h2>

            <small>Total Users</small>
          </div>
        </div>

        <div className="col-6">
          <div className="card border-0 shadow-sm p-3 text-center">
            <h2 className="fw-bold text-warning">
              {pending.length}
            </h2>

            <small>Pending Requests</small>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card border-0 shadow-sm p-3 mb-4">
        <input
          type="search"
          className="form-control form-control-lg"
          placeholder="🔍 Search name or username..."
          aria-label="Search users"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-5">
          <div
            className="spinner-border text-primary"
            role="status"
          />

          <p className="mt-3 text-muted">
            Loading users...
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="alert alert-danger">
          {error}

          <button
            className="btn btn-outline-danger ms-3"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-bold mb-0">
              Discover People
            </h4>

            <span className="text-muted">
              {filteredUsers.length} Users
            </span>
          </div>

          <div className="row g-3">
            {filteredUsers.map((user) => {
              const isPending = pending.includes(user.id);

              return (
                <div
                  key={user.id}
                  className="col-12 col-sm-6 col-lg-4"
                >
                  <div className="card border-0 shadow-sm h-100 p-4 text-center">
                    {/* Avatar */}
                    <div
                      className="rounded-circle mx-auto d-flex align-items-center justify-content-center text-white fw-bold mb-3"
                      style={{
                        width: 85,
                        height: 85,
                        fontSize: 32,
                        background:
                          colors[user.id % colors.length],
                      }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Name */}
                    <h5 className="fw-bold mb-1">
                      {user.name}
                    </h5>

                    {/* Username */}
                    <p className="text-muted mb-2">
                      @{user.username}
                    </p>

                    {/* Bio */}
                    <p className="text-muted mb-3">
                      {user.bio || "No bio yet."}
                    </p>

                    {/* Join Date */}
                    <small className="text-muted mb-4">
                      Joined{" "}
                      {new Date(
                        user.createdAt
                      ).toLocaleDateString("en-GB")}
                    </small>

                    {/* Add Friend */}
                    <button
                      className={`btn w-100 mt-auto ${
                        isPending
                          ? "btn-outline-secondary"
                          : "text-white"
                      }`}
                      style={
                        isPending
                          ? {}
                          : {
                              background:
                                "linear-gradient(135deg, #9333ea, #ec4899)",
                              border: "none",
                            }
                      }
                      onClick={() =>
                        toggleRequest(user.id)
                      }
                    >
                      {isPending
                        ? "⏳ Pending — Cancel"
                        : "＋ Add Friend"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty */}
          {filteredUsers.length === 0 && (
            <div className="card border-0 shadow-sm p-5 text-center">
              <div style={{ fontSize: 55 }}>
                🔍
              </div>

              <h4>No Users Found</h4>

              <p className="text-muted">
                No matching users available.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}