"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useCurrentUser } from "../../lib/useCurrentUser";

type Contact = { id: number; name: string; username: string };
type Msg = {
  id: string;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt: string;
};

export default function MessagesPage() {
  const { user, ready } = useCurrentUser();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [filter, setFilter] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/messages?userId=${user.id}`);
      const data = await res.json();
      if (data.success) {
        setContacts(data.contacts);
        setMessages(data.messages);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  }, [user]);

  // Muat pesan, lalu perbarui otomatis tiap 5 detik
  useEffect(() => {
    load();
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, [load]);

  // Pesan terakhir per kontak
  const lastByContact = useMemo(() => {
    const map = new Map<number, Msg>();
    if (!user) return map;
    for (const m of messages) {
      const partner = m.senderId === user.id ? m.receiverId : m.senderId;
      map.set(partner, m); // pesan sudah urut naik, jadi yang terakhir menimpa
    }
    return map;
  }, [messages, user]);

  // Kontak yang sudah pernah chat tampil di atas
  const sortedContacts = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return contacts
      .filter(
        (c) =>
          !q ||
          c.name.toLowerCase().includes(q) ||
          c.username.toLowerCase().includes(q)
      )
      .sort((a, b) => {
        const la = lastByContact.get(a.id);
        const lb = lastByContact.get(b.id);
        if (la && lb)
          return new Date(lb.createdAt).getTime() - new Date(la.createdAt).getTime();
        if (la) return -1;
        if (lb) return 1;
        return a.name.localeCompare(b.name);
      });
  }, [contacts, filter, lastByContact]);

  const activeContact = contacts.find((c) => c.id === activeId) || null;

  const conversation = useMemo(
    () =>
      messages.filter(
        (m) => m.senderId === activeId || m.receiverId === activeId
      ),
    [messages, activeId]
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.length, activeId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeId || !text.trim()) return;

    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: user.id,
          receiverId: activeId,
          content: text.trim(),
        }),
      });
      if (res.ok) {
        setText("");
        await load();
      } else {
        alert("Gagal mengirim pesan");
      }
    } finally {
      setSending(false);
    }
  };

  if (ready && !user) {
    return (
      <div className="container py-4">
        <div className="alert alert-warning">
          Kamu belum login. <Link href="/">Login dulu</Link> untuk memakai pesan.
        </div>
      </div>
    );
  }

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="container py-4">
      <h2 className="page-title mb-3">💬 Messages</h2>

      <div className={`card chat-shell ${activeId ? "has-chat" : ""}`}>
        {/* Daftar kontak */}
        <aside className="chat-sidebar">
          <div className="p-3 border-bottom">
            <input
              className="form-control"
              placeholder="Cari kontak..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <div className="chat-list">
            {sortedContacts.length === 0 && (
              <p className="text-muted p-3 mb-0">Tidak ada kontak.</p>
            )}
            {sortedContacts.map((c) => {
              const last = lastByContact.get(c.id);
              return (
                <button
                  key={c.id}
                  className={`contact ${activeId === c.id ? "active" : ""}`}
                  onClick={() => setActiveId(c.id)}
                >
                  <div className="avatar">{c.name.charAt(0)}</div>
                  <div className="meta">
                    <div className="fw-bold">{c.name}</div>
                    <div className="preview">
                      {last
                        ? `${last.senderId === user?.id ? "Kamu: " : ""}${last.content}`
                        : `@${c.username}`}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Percakapan */}
        <section className="chat-main">
          {!activeContact ? (
            <div className="d-flex flex-grow-1 align-items-center justify-content-center text-muted">
              Pilih kontak untuk mulai chat 💌
            </div>
          ) : (
            <>
              <div className="chat-header">
                <button
                  className="btn btn-sm btn-outline-primary chat-back"
                  onClick={() => setActiveId(null)}
                >
                  ←
                </button>
                <div className="avatar">{activeContact.name.charAt(0)}</div>
                <div>
                  <div className="fw-bold">{activeContact.name}</div>
                  <div className="text-muted small">@{activeContact.username}</div>
                </div>
              </div>

              <div className="chat-body">
                {conversation.length === 0 && (
                  <p className="text-muted text-center my-auto">
                    Belum ada pesan. Sapa {activeContact.name} 👋
                  </p>
                )}
                {conversation.map((m) => (
                  <div
                    key={m.id}
                    className={`bubble ${m.senderId === user?.id ? "me" : "them"}`}
                  >
                    {m.content}
                    <small>{formatTime(m.createdAt)}</small>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              <form className="chat-form" onSubmit={handleSend}>
                <input
                  className="form-control"
                  placeholder="Tulis pesan..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  required
                />
                <button className="btn btn-primary" type="submit" disabled={sending}>
                  {sending ? "..." : "Kirim"}
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}