"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type User = {
  id: number;
  name: string;
  username: string;
  bio: string | null;
  createdAt: string;
};

type FriendRequest = {
  id: string;
  senderId: number;
  receiverId: number;
  status: string;
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
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Mengambil data pengguna dan permintaan
  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      try {
        const [usersRes, requestsRes] = await Promise.all([
          fetch("/api/users", {
            cache: "no-store",
            signal: controller.signal,
          }),
          fetch("/api/friend-requests", {
            cache: "no-store",
            signal: controller.signal,
          }),
        ]);

        const usersData = await usersRes.json();
        const requestsData = await requestsRes.json();

        if (!usersRes.ok || !usersData.success) {
          throw new Error(
            usersData.message || "Gagal mengambil pengguna"
          );
        }

        if (!requestsRes.ok || !requestsData.success) {
          throw new Error(
            requestsData.message || "Silakan login kembali"
          );
        }

        if (!controller.signal.aborted) {
          setUsers(usersData.data);
          setRequests(requestsData.data);
          setCurrentUserId(requestsData.userId);
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

    loadData();

    return () => controller.abort();
  }, []);

  // Mengambil ulang status pertemanan
  const refreshRequests = async () => {
    const res = await fetch("/api/friend-requests", {
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || "Gagal mengambil status");
    }

    setRequests(data.data);
  };

  // Mengirim Friend Request
  const sendRequest = async (receiverId: number) => {
    setBusy(receiverId);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/friend-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ receiverId }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message);
      }

      await refreshRequests();

      setMessage("Friend request successfully sent!");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengirim permintaan"
      );
    } finally {
      setBusy(null);
    }
  };

  // Membatalkan Friend Request
  const cancelRequest = async (
    requestId: string,
    receiverId: number
  ) => {
    setBusy(receiverId);
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
        throw new Error(data.message);
      }

      await refreshRequests();

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

  // Menyembunyikan akun sendiri
  const otherUsers = users.filter(
    (user) => user.id !== currentUserId
  );

  // Pencarian pengguna
  const filteredUsers = otherUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.username.toLowerCase().includes(search.toLowerCase())
  );

  // Menghitung permintaan yang dikirim
  const pendingCount = requests.filter(
    (request) =>
      request.senderId === currentUserId &&
      request.status === "PENDING"
  ).length;

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
        <h1 className="fw-bold">🌐 User Directory</h1>

        <p className="mb-0">
          Discover people and make new friends.
        </p>
      </div>

      {/* Statistics */}
      <div className="row g-3 mb-4">
        <div className="col-6">
          <div className="card border-0 shadow-sm p-3 text-center">
            <h2 className="fw-bold text-primary">
              {otherUsers.length}
            </h2>
            <small>Total Users</small>
          </div>
        </div>

        <div className="col-6">
          <div className="card border-0 shadow-sm p-3 text-center">
            <h2 className="fw-bold text-warning">
              {pendingCount}
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

      {/* Success Message */}
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

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger">
          {error}

          <button
            className="btn-close float-end"
            aria-label="Close"
            onClick={() => setError("")}
          />
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />

          <p className="mt-3 text-muted">
            Loading users...
          </p>
        </div>
      ) : (
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

              // Memeriksa hubungan pertemanan
              const relationship = requests.find(
                (request) =>
                  (
                    (
                      request.senderId === currentUserId &&
                      request.receiverId === user.id
                    ) ||
                    (
                      request.receiverId === currentUserId &&
                      request.senderId === user.id
                    )
                  ) &&
                  ["PENDING", "ACCEPTED"].includes(
                    request.status
                  )
              );

              const isFriend =
                relationship?.status === "ACCEPTED";

              const isPending =
                relationship?.status === "PENDING" &&
                relationship.senderId === currentUserId;

              const incomingRequest =
                relationship?.status === "PENDING" &&
                relationship.receiverId === currentUserId;

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

                    <h5 className="fw-bold mb-1">
                      {user.name}
                    </h5>

                    <p className="text-muted mb-2">
                      @{user.username}
                    </p>

                    <p className="text-muted mb-3">
                      {user.bio || "No bio yet."}
                    </p>

                    <small className="text-muted mb-4">
                      Joined{" "}
                      {new Date(
                        user.createdAt
                      ).toLocaleDateString("en-GB")}
                    </small>

                    {/* Friend Status */}
                    {isFriend ? (
                      <button
                        className="btn btn-success w-100 mt-auto"
                        disabled
                      >
                        ✓ Friends
                      </button>

                    ) : isPending && relationship ? (
                      <button
                        className="btn btn-outline-secondary w-100 mt-auto"
                        disabled={busy !== null}
                        onClick={() =>
                          cancelRequest(
                            relationship.id,
                            user.id
                          )
                        }
                      >
                        {busy === user.id
                          ? "Processing..."
                          : "⏳ Pending — Cancel"}
                      </button>

                    ) : incomingRequest ? (
                      <Link
                        href="/friend-requests"
                        className="btn btn-warning w-100 mt-auto"
                      >
                        💌 Respond to Request
                      </Link>

                    ) : (
                      <button
                        className="btn text-white w-100 mt-auto"
                        disabled={
                          busy !== null ||
                          currentUserId === null
                        }
                        style={{
                          background:
                            "linear-gradient(135deg, #9333ea, #ec4899)",
                          border: "none",
                        }}
                        onClick={() =>
                          sendRequest(user.id)
                        }
                      >
                        {busy === user.id
                          ? "Sending..."
                          : "+ Add Friend"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredUsers.length === 0 && (
            <div className="card border-0 shadow-sm p-5 text-center">
              <div style={{ fontSize: 55 }}>🔍</div>

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