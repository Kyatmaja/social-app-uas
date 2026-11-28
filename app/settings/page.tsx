"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCurrentUser } from "../../lib/useCurrentUser";

type Tab = "profile" | "privacy" | "account";
type Privacy = {
  privateAccount: boolean;
  showEmail: boolean;
  allowMessages: boolean;
};
type Status = { type: "success" | "danger"; text: string } | null;

const defaultPrivacy: Privacy = {
  privateAccount: false,
  showEmail: false,
  allowMessages: true,
};

export default function SettingsPage() {
  const { user, setUser, ready } = useCurrentUser();
  const [tab, setTab] = useState<Tab>("profile");
  const [status, setStatus] = useState<Status>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");

  const [privacy, setPrivacy] = useState<Privacy>(defaultPrivacy);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Muat data profil dari database + privasi dari localStorage
  useEffect(() => {
    if (!user) return;

    fetch(`/api/settings?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setName(data.user.name);
          setUsername(data.user.username);
          setEmail(data.user.email);
          setBio(data.user.bio ?? "");
        }
      })
      .catch((error) => console.error(error));

    try {
      const raw = localStorage.getItem(`privacy:${user.id}`);
      if (raw) setPrivacy({ ...defaultPrivacy, ...JSON.parse(raw) });
    } catch {
      /* abaikan */
    }
  }, [user]);

  const switchTab = (t: Tab) => {
    setTab(t);
    setStatus(null);
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setStatus(null);

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "profile", userId: user.id, name, username, bio }),
      });
      const data = await res.json();

      if (res.ok) {
        const updated = { ...user, name: data.user.name, username: data.user.username };
        localStorage.setItem("user", JSON.stringify(updated));
        setUser(updated);
        setStatus({ type: "success", text: data.message });
      } else {
        setStatus({ type: "danger", text: data.message });
      }
    } catch {
      setStatus({ type: "danger", text: "Tidak dapat terhubung ke server" });
    } finally {
      setSaving(false);
    }
  };

  const togglePrivacy = (key: keyof Privacy) => {
    if (!user) return;
    const next = { ...privacy, [key]: !privacy[key] };
    setPrivacy(next);
    localStorage.setItem(`privacy:${user.id}`, JSON.stringify(next));
    setStatus({ type: "success", text: "Pengaturan privasi disimpan" });
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (newPassword.length < 6) {
      setStatus({ type: "danger", text: "Password baru minimal 6 karakter" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus({ type: "danger", text: "Konfirmasi password tidak sama" });
      return;
    }

    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "password",
          userId: user.id,
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      setStatus({ type: res.ok ? "success" : "danger", text: data.message });
      if (res.ok) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setStatus({ type: "danger", text: "Tidak dapat terhubung ke server" });
    } finally {
      setSaving(false);
    }
  };

  if (ready && !user) {
    return (
      <div className="container py-4">
        <div className="alert alert-warning">
          Kamu belum login. <Link href="/">Login dulu</Link> untuk membuka pengaturan.
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-7">
          <h2 className="page-title mb-3">⚙️ Pengaturan</h2>

          <div className="pill-tabs mb-4">
            <button
              className={`pill-tab ${tab === "profile" ? "active" : ""}`}
              onClick={() => switchTab("profile")}
            >
              Profil
            </button>
            <button
              className={`pill-tab ${tab === "privacy" ? "active" : ""}`}
              onClick={() => switchTab("privacy")}
            >
              Privasi
            </button>
            <button
              className={`pill-tab ${tab === "account" ? "active" : ""}`}
              onClick={() => switchTab("account")}
            >
              Akun
            </button>
          </div>

          {status && (
            <div className={`alert alert-${status.type}`}>{status.text}</div>
          )}

          {/* PROFIL */}
          {tab === "profile" && (
            <form className="card p-4" onSubmit={saveProfile}>
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="avatar lg">{(name || "?").charAt(0)}</div>
                <div>
                  <div className="fw-bold fs-5">{name || "—"}</div>
                  <div className="text-muted">@{username}</div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Nama Lengkap</label>
                <input
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Username</label>
                <input
                  className="form-control"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input className="form-control" value={email} disabled />
                <div className="form-text">Email tidak dapat diubah.</div>
              </div>
              <div className="mb-3">
                <label className="form-label">Bio</label>
                <textarea
                  className="form-control"
                  rows={3}
                  maxLength={160}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
                <div className="form-text">{bio.length}/160</div>
              </div>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </form>
          )}

          {/* PRIVASI */}
          {tab === "privacy" && (
            <div className="card p-4">
              {(
                [
                  ["privateAccount", "Akun privat", "Hanya teman yang bisa melihat postinganmu."],
                  ["showEmail", "Tampilkan email di profil", "Pengguna lain bisa melihat emailmu."],
                  ["allowMessages", "Izinkan pesan dari siapa saja", "Matikan untuk hanya menerima pesan dari teman."],
                ] as [keyof Privacy, string, string][]
              ).map(([key, title, desc]) => (
                <div className="switch-row" key={key}>
                  <div>
                    <div className="fw-bold">{title}</div>
                    <div className="text-muted small">{desc}</div>
                  </div>
                  <div className="form-check form-switch m-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      checked={privacy[key]}
                      onChange={() => togglePrivacy(key)}
                      style={{ width: "2.8em", height: "1.4em" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* AKUN */}
          {tab === "account" && (
            <form className="card p-4" onSubmit={changePassword}>
              <h5 className="mb-3">Ganti Password</h5>
              <div className="mb-3">
                <label className="form-label">Password Lama</label>
                <input
                  type="password"
                  className="form-control"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Password Baru</label>
                <input
                  type="password"
                  className="form-control"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Konfirmasi Password Baru</label>
                <input
                  type="password"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? "Menyimpan..." : "Ganti Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}