"use client";

import { useState } from "react";

export default function FriendsPage() {
  const [friends, setFriends] = useState([
    { id: 1, name: "Andi Pratama", username: "andi", online: true },
    { id: 2, name: "Budi Santoso", username: "budi", online: false },
    { id: 3, name: "Citra Amelia", username: "citra", online: true },
    { id: 4, name: "Dinda Putri", username: "dinda", online: false },
    { id: 5, name: "Kevin Wijaya", username: "kevin", online: true },
  ]);

  const removeFriend = (id: number) => {
    setFriends((prev) =>
      prev.filter((friend) => friend.id !== id)
    );
  };

  return (
    <div className="container py-5">
      <h2 className="fw-bold">👥 Friends List</h2>

      <p className="text-muted mb-4">
        Total teman: {friends.length}
      </p>

      {friends.map((friend) => (
        <div
          key={friend.id}
          className="card shadow-sm border-0 mb-3"
        >
          <div className="card-body d-flex align-items-center gap-3">

            <div
              className="rounded-circle text-white d-flex align-items-center justify-content-center"
              style={{
                width: "55px",
                height: "55px",
                background: "linear-gradient(135deg, #9333ea, #ec4899)",
                fontSize: "24px",
              }}
            >
              {friend.name.charAt(0)}
            </div>

            <div className="flex-grow-1">
              <h5 className="mb-1">{friend.name}</h5>

              <small className="text-muted">
                @{friend.username}
              </small>

              <div
                className={
                  friend.online
                    ? "text-success"
                    : "text-secondary"
                }
              >
                ● {friend.online ? "Online" : "Offline"}
              </div>
            </div>

            <button
              className="btn btn-outline-danger btn-sm"
              onClick={() => removeFriend(friend.id)}
            >
              Remove
            </button>

          </div>
        </div>
      ))}

      {friends.length === 0 && (
        <p className="text-center text-muted">
          Belum ada teman.
        </p>
      )}
    </div>
  );
}