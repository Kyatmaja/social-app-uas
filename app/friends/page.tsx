"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type User = {
  id: number;
  name: string;
  username: string;
};

type FriendRequest = {
  id: string;
  senderId: number;
  receiverId: number;
  status: string;
  sender: User;
  receiver: User;
};

const colors = [
  "#9333ea",
  "#ec4899",
  "#3b82f6",
  "#14b8a6",
  "#f59e0b",
];

export default function FriendsPage() {
  const [friends, setFriends] = useState<FriendRequest[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadFriends() {
      try {
        const res = await fetch("/api/friend-requests", {
          cache: "no-store",
          signal: controller.signal,
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(
            data.message || "Gagal mengambil daftar teman"
          );
        }

        if (!controller.signal.aborted) {
          setCurrentUserId(data.userId);

          setFriends(
            data.data.filter(
              (item: FriendRequest) =>
                item.status === "ACCEPTED" &&
                (item.senderId === data.userId ||
                  item.receiverId === data.userId)
            )
          );
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : "Terjadi kesalahan server"
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadFriends();

    return () => controller.abort();
  }, []);

  const removeFriend = async (
    requestId: string,
    name: string
  ) => {
    if (!window.confirm(`Remove ${name} from your friends?`)) {
      return;
    }

    setBusy(requestId);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/friend-requests", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: requestId,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.message || "Gagal menghapus teman"
        );
      }

      setFriends((prev) =>
        prev.filter((item) => item.id !== requestId)
      );

      setMessage(`${name} removed from your friends.`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan"
      );
    } finally {
      setBusy(null);
    }
  };

  const friendList = friends.map((request) => ({
    requestId: request.id,
    user:
      request.senderId === currentUserId
        ? request.receiver
        : request.sender,
  }));

  const filteredFriends = friendList.filter(
    ({ user }) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container py-4" style={{ maxWidth: 1100 }}>

      {/* Banner */}
      <div
        className="rounded-4 p-4 p-md-5 text-white mb-4"
        style={{
          background:
            "linear-gradient(135deg, #9333ea, #ec4899)",
        }}
      >
        <h1 className="fw-bold">👥 Friends List</h1>
        <p className="mb-0">
          Stay connected with your friends.
        </p>
      </div>

      {/* Total Friends */}
      <div className="card border-0 shadow-sm p-4 mb-4 text-center">
        <h1 className="fw-bold text-primary">
          {friendList.length}
        </h1>
        <span className="text-muted">Total Friends</span>
      </div>

      {/* Search */}
      <div className="card border-0 shadow-sm p-3 mb-4">
        <input
          type="search"
          className="form-control form-control-lg"
          placeholder="🔍 Search your friends..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {message && (
        <div className="alert alert-success">
          {message}
        </div>
      )}

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

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
          <p className="mt-3 text-muted">
            Loading friends...
          </p>
        </div>
      ) : !error && filteredFriends.length === 0 ? (
        <div className="card border-0 shadow-sm p-5 text-center">
          <div style={{ fontSize: 60 }}>👥</div>

          <h4 className="fw-bold">
            {search ? "No Matching Friends" : "No Friends Yet"}
          </h4>

          <p className="text-muted">
            Discover new people and start connecting.
          </p>

          <Link
            href="/users"
            className="btn btn-primary mx-auto"
          >
            Discover People
          </Link>
        </div>
      ) : (
        <div className="row g-3">
          {filteredFriends.map(({ requestId, user }) => (
            <div
              className="col-12 col-md-6 col-lg-4"
              key={requestId}
            >
              <div className="card border-0 shadow-sm p-4 h-100 text-center">

                {/* Avatar */}
                <div
                  className="rounded-circle mx-auto d-flex align-items-center justify-content-center text-white fw-bold mb-3"
                  style={{
                    width: 85,
                    height: 85,
                    fontSize: 32,
                    background: colors[user.id % colors.length],
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>

                <h5 className="fw-bold">
                  {user.name}
                </h5>

                <p className="text-muted">
                  @{user.username}
                </p>

                <div className="text-success mb-4">
                  ✓ Friends
                </div>

                <button
                  className="btn btn-outline-danger w-100 mt-auto"
                  disabled={busy !== null}
                  onClick={() =>
                    removeFriend(requestId, user.name)
                  }
                >
                  {busy === requestId
                    ? "Removing..."
                    : "Remove Friend"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}