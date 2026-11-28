"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type Notification = {
  id: string;
  userId: number;
  content: string;
  isRead: boolean;
  createdAt: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [now, setNow] = useState<number>(0);

  // Mengambil notifikasi dari database
  const loadNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.message || "Gagal mengambil notifikasi"
        );
      }

      setNotifications(data.data);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan server"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh otomatis setiap 10 detik
  // Perbaikan ESLint set-state-in-effect
  useEffect(() => {
    const timeout = setTimeout(() => {
      void loadNotifications();
    }, 0);

    const interval = setInterval(() => {
      void loadNotifications();
    }, 10000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [loadNotifications]);

  // Menandai satu notifikasi sudah dibaca
  const markAsRead = async (id: string) => {
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.message || "Gagal memperbarui notifikasi"
        );
      }

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, isRead: true }
            : item
        )
      );

      setMessage("Notification marked as read.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memperbarui notifikasi"
      );
    } finally {
      setBusy(false);
    }
  };

  // Menandai semua notifikasi sudah dibaca
  const markAllAsRead = async () => {
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          markAll: true,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.message || "Gagal memperbarui notifikasi"
        );
      }

      await loadNotifications();

      setMessage("All notifications marked as read.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memperbarui notifikasi"
      );
    } finally {
      setBusy(false);
    }
  };

  // Menghapus notifikasi
  const deleteNotification = async (id: string) => {
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/notifications", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.message || "Gagal menghapus notifikasi"
        );
      }

      setNotifications((prev) =>
        prev.filter((item) => item.id !== id)
      );

      setMessage("Notification deleted.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal menghapus notifikasi"
      );
    } finally {
      setBusy(false);
    }
  };

  // Format waktu notifikasi
  const formatTime = (date: string) => {
    const seconds = Math.max(
      0,
      Math.floor(
        (now - new Date(date).getTime()) / 1000
      )
    );

    if (seconds < 60) return "Just now";

    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) {
      return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    }

    const days = Math.floor(hours / 24);

    if (days < 7) {
      return `${days} day${days === 1 ? "" : "s"} ago`;
    }

    return new Date(date).toLocaleDateString("en-GB");
  };

  // Menghitung notifikasi
  const unreadCount = notifications.filter(
    (item) => !item.isRead
  ).length;

  const readCount = notifications.filter(
    (item) => item.isRead
  ).length;

  // Filter notifikasi
  const filteredNotifications = notifications.filter(
    (item) => {
      if (filter === "unread") return !item.isRead;
      if (filter === "read") return item.isRead;
      return true;
    }
  );

  return (
    <div
      className="container py-4"
      style={{ maxWidth: 1000 }}
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
          🔔 Notifications
        </h1>

        <p className="mb-0">
          Stay updated with your latest activities.
        </p>
      </div>

      {/* Statistics */}
      <div className="row g-3 mb-4">
        {[
          {
            label: "Total Notifications",
            value: notifications.length,
            color: "text-primary",
          },
          {
            label: "Unread",
            value: unreadCount,
            color: "text-danger",
          },
          {
            label: "Read",
            value: readCount,
            color: "text-success",
          },
        ].map((item) => (
          <div className="col-4" key={item.label}>
            <div className="card border-0 shadow-sm p-3 text-center">
              <h2 className={`fw-bold ${item.color}`}>
                {item.value}
              </h2>

              <small>{item.label}</small>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="card border-0 shadow-sm p-3 mb-4">
        <div className="d-flex flex-wrap gap-2">
          {[
            ["all", "All"],
            ["unread", "Unread"],
            ["read", "Read"],
          ].map(([value, label]) => (
            <button
              key={value}
              className={`btn ${
                filter === value
                  ? "text-white"
                  : "btn-light"
              }`}
              style={
                filter === value
                  ? {
                      background:
                        "linear-gradient(135deg, #9333ea, #ec4899)",
                      border: "none",
                    }
                  : {}
              }
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}

          <button
            className="btn btn-outline-primary ms-auto"
            disabled={busy || unreadCount === 0}
            onClick={markAllAsRead}
          >
            ✓ Mark All as Read
          </button>
        </div>
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
            className="btn btn-outline-danger ms-3"
            onClick={loadNotifications}
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="text-center py-5">
          <div
            className="spinner-border text-primary"
            role="status"
          />

          <p className="text-muted mt-3">
            Loading notifications...
          </p>
        </div>
      ) : !error && filteredNotifications.length === 0 ? (
        /* Empty Notifications */
        <div className="card border-0 shadow-sm text-center p-5">
          <div style={{ fontSize: 65 }}>
            🔕
          </div>

          <h4 className="fw-bold">
            No Notifications
          </h4>

          <p className="text-muted">
            You&apos;re all caught up!
          </p>

          <Link
            href="/users"
            className="btn btn-primary mx-auto"
          >
            Discover People
          </Link>
        </div>
      ) : (
        /* Notification List */
        <div className="d-flex flex-column gap-3">
          {filteredNotifications.map((item) => {
            const isAccepted = item.content.includes(
              "accepted your friend request."
            );

            return (
              <div
                key={item.id}
                className="card border-0 shadow-sm p-4"
                style={{
                  background: item.isRead
                    ? "#ffffff"
                    : "#f3e8ff",
                }}
              >
                <div className="d-flex align-items-center gap-3">
                  {/* Notification Icon */}
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-white"
                    style={{
                      width: 55,
                      height: 55,
                      fontSize: 25,
                      flexShrink: 0,
                      background: isAccepted
                        ? "#16a34a"
                        : "#9333ea",
                    }}
                  >
                    {isAccepted ? "✓" : "👤"}
                  </div>

                  {/* Notification Content */}
                  <div className="flex-grow-1">
                    <p
                      className={`mb-1 ${
                        !item.isRead ? "fw-bold" : ""
                      }`}
                    >
                      {item.content}
                    </p>

                    <small className="text-muted">
                      {formatTime(item.createdAt)}
                    </small>
                  </div>

                  {/* Unread Indicator */}
                  {!item.isRead && (
                    <div
                      className="rounded-circle"
                      style={{
                        width: 10,
                        height: 10,
                        background: "#9333ea",
                        flexShrink: 0,
                      }}
                    />
                  )}
                </div>

                {/* Action Buttons */}
                <div className="d-flex flex-wrap justify-content-end gap-2 mt-3">
                  <Link
                    href={
                      isAccepted
                        ? "/friends"
                        : "/friend-requests"
                    }
                    className="btn btn-sm btn-outline-primary"
                  >
                    View
                  </Link>

                  {!item.isRead && (
                    <button
                      className="btn btn-sm btn-outline-success"
                      disabled={busy}
                      onClick={() => markAsRead(item.id)}
                    >
                      ✓ Mark as Read
                    </button>
                  )}

                  <button
                    className="btn btn-sm btn-outline-danger"
                    disabled={busy}
                    onClick={() =>
                      deleteNotification(item.id)
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}