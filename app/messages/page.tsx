'use client';

import { useState, useEffect } from 'react';

export default function MessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [receiver, setReceiver] = useState('');
  const [content, setContent] = useState('');

  const loadMessages = async () => {
    const res = await fetch('/api/messages');
    const data = await res.json();
    if (data.success) setMessages(data.data);
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderUsername: 'kyatmaja',
        receiverUsername: receiver,
        content,
      }),
    });
    if (res.ok) {
      setContent('');
      loadMessages();
    } else {
      alert('Pastikan username penerima terdaftar di database.');
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <h2 className="mb-3">Messages</h2>

        <div className="card mb-4">
          <div className="card-body" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {messages.length === 0 ? (
              <p className="text-muted">Belum ada percakapan.</p>
            ) : (
              messages.map((m) => (
                <div key={m.id} className="border-bottom pb-2 mb-2">
                  <strong>@{m.sender.username}</strong> ke <strong>@{m.receiver.username}</strong>:
                  <p className="mb-0">{m.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <form onSubmit={handleSend} className="card p-3">
          <div className="mb-2">
            <input
              type="text"
              className="form-control"
              placeholder="Username penerima (contoh: Breynth)"
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Tulis pesan..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
            <button className="btn btn-primary" type="submit">Kirim</button>
          </div>
        </form>
      </div>
    </div>
  );
}