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
  createdAt: string;
  sender: User;
  receiver: User;
};

const colors = [
  "#8b5cf6",
  "#ec4899",
  "#3b82f6",
  "#14b8a6",
  "#f59e0b",
];

export default function FriendRequestsPage() {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState("incoming");

  // Mengambil permintaan dari database
  useEffect(() => {
    const controller = new AbortController();

    async function loadRequests() {
      try {
        const res = await fetch("/api/friend-requests", {
          cache: "no-store",
          signal: controller.signal,
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(
            data.message || "Gagal mengambil permintaan"
          );
        }

        if (!controller.signal.aborted) {
          setRequests(data.data);
          setCurrentUserId(data.userId);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : "Terjadi kesalahan"
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadRequests();

    return () => controller.abort();
  }, []);

  // Accept dan Decline
  const respondRequest = async (
    request: FriendRequest,
    status: "ACCEPTED" | "DECLINED"
  ) => {
    setBusy(request.id);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/friend-requests", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: request.id,
          status,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message);
      }

      setRequests((prev) =>
        prev.map((item) =>
          item.id === request.id
            ? { ...item, status }
            : item
        )
      );

      setMessage(
        status === "ACCEPTED"
          ? `You are now friends with ${request.sender.name}!`
          : `Request from ${request.sender.name} declined.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memperbarui permintaan"
      );
    } finally {
      setBusy(null);
    }
  };

  // Membatalkan permintaan keluar
  const cancelRequest = async (id: string) => {
    setBusy(id);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/friend-requests", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message);
      }

      setRequests((prev) =>
        prev.filter((item) => item.id !== id)
      );

      setMessage("Friend request cancelled.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal membatalkan permintaan"
      );
    } finally {
      setBusy(null);
    }
  };

  // Permintaan masuk
  const incoming = requests.filter(
    (item) =>
      item.receiverId === currentUserId &&
      item.status === "PENDING"
  );

  // Permintaan keluar
  const outgoing = requests.filter(
    (item) =>
      item.senderId === currentUserId &&
      item.status === "PENDING"
  );

  // Permintaan diterima
  const accepted = requests.filter(
    (item) => item.status === "ACCEPTED"
  );

  // Permintaan ditolak
  const declined = requests.filter(
    (item) =>
      item.receiverId === currentUserId &&
      item.status === "DECLINED"
  );

  const displayedRequests =
    tab === "incoming" ? incoming : outgoing;

  return (
    <div className="container py-4" style={{ maxWidth: 1000 }}>

      {/* Banner */}
      <div
        className="rounded-4 p-4 p-md-5 text-white mb-4"
        style={{
          background:
            "linear-gradient(135deg, #9333ea, #ec4899)",
        }}
      >
        <h1 className="fw-bold">💌 Friend Requests</h1>

        <p className="mb-0">
          Manage your friend requests and connections.
        </p>
      </div>

      {/* Statistics */}
      <div className="row g-3 mb-4">
        {[
          {
            label: "Incoming",
            value: incoming.length,
            color: "text-primary",
          },
          {
            label: "Outgoing",
            value: outgoing.length,
            color: "text-warning",
          },
          {
            label: "Accepted",
            value: accepted.length,
            color: "text-success",
          },
          {
            label: "Declined",
            value: declined.length,
            color: "text-danger",
          },
        ].map((item) => (
          <div
            className="col-6 col-md-3"
            key={item.label}
          >
            <div className="card border-0 shadow-sm text-center p-3">
              <h2 className={`fw-bold ${item.color}`}>
                {item.value}
              </h2>

              <small>{item.label}</small>
            </div>
          </div>
        ))}
      </div>

      {/* Success */}
      {message && (
        <div className="alert alert-success">
          {message}

          <button
            className="btn-close float-end"
            aria-label="Close"
            onClick={() => setMessage("")}
          />
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

      {/* Tabs */}
      <div className="card border-0 shadow-sm p-3 mb-4">
        <div className="d-flex gap-2">
          <button
            className={`btn flex-fill ${
              tab === "incoming"
                ? "text-white"
                : "btn-light"
            }`}
            style={
              tab === "incoming"
                ? {
                    background:
                      "linear-gradient(135deg, #9333ea, #ec4899)",
                    border: "none",
                  }
                : {}
            }
            onClick={() => setTab("incoming")}
          >
            📥 Incoming ({incoming.length})
          </button>

          <button
            className={`btn flex-fill ${
              tab === "outgoing"
                ? "text-white"
                : "btn-light"
            }`}
            style={
              tab === "outgoing"
                ? {
                    background:
                      "linear-gradient(135deg, #9333ea, #ec4899)",
                    border: "none",
                  }
                : {}
            }
            onClick={() => setTab("outgoing")}
          >
            📤 Outgoing ({outgoing.length})
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />

          <p className="text-muted mt-3">
            Loading requests...
          </p>
        </div>
      ) : !error && displayedRequests.length === 0 ? (
        <div className="card border-0 shadow-sm text-center p-5">
          <div style={{ fontSize: 60 }}>📭</div>

          <h4 className="fw-bold">
            No Friend Requests
          </h4>

          <p className="text-muted">
            {tab === "incoming"
              ? "You have no incoming friend requests."
              : "You have no outgoing friend requests."}
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
          {displayedRequests.map((request) => {
            const user =
              tab === "incoming"
                ? request.sender
                : request.receiver;

            return (
              <div
                className="col-12 col-md-6"
                key={request.id}
              >
                <div className="card border-0 shadow-sm h-100 p-4">

                  {/* User Information */}
                  <div className="d-flex align-items-center gap-3 mb-4">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                      style={{
                        width: 70,
                        height: 70,
                        fontSize: 28,
                        flexShrink: 0,
                        background:
                          colors[user.id % colors.length],
                      }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <h5 className="fw-bold mb-1">
                        {user.name}
                      </h5>

                      <div className="text-muted">
                        @{user.username}
                      </div>

                      <small className="text-muted">
                        {new Date(
                          request.createdAt
                        ).toLocaleDateString("en-GB")}
                      </small>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {tab === "incoming" ? (
                    <div className="d-flex gap-2">
                      <button
                        className="btn text-white flex-fill"
                        disabled={busy !== null}
                        style={{
                          background:
                            "linear-gradient(135deg, #9333ea, #ec4899)",
                          border: "none",
                        }}
                        onClick={() =>
                          respondRequest(request, "ACCEPTED")
                        }
                      >
                        {busy === request.id
                          ? "Processing..."
                          : "✓ Accept"}
                      </button>

                      <button
                        className="btn btn-outline-secondary flex-fill"
                        disabled={busy !== null}
                        onClick={() =>
                          respondRequest(request, "DECLINED")
                        }
                      >
                        ✕ Decline
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn btn-outline-secondary w-100"
                      disabled={busy !== null}
                      onClick={() =>
                        cancelRequest(request.id)
                      }
                    >
                      {busy === request.id
                        ? "Processing..."
                        : "⏳ Pending — Cancel Request"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}