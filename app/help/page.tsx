"use client";

import { useState } from "react";

type Faq = { category: string; q: string; a: string };

const faqs: Faq[] = [
  { category: "Akun", q: "Bagaimana cara mendaftar?", a: "Di halaman awal, klik tombol Register, isi nama lengkap, username, email, dan password (minimal 6 karakter), lalu klik Register. Setelah berhasil, silakan login." },
  { category: "Akun", q: "Bagaimana cara mengubah profil?", a: "Buka menu Settings, tab Profil. Ubah nama, username, atau bio, lalu klik Simpan Perubahan." },
  { category: "Akun", q: "Bagaimana cara mengganti password?", a: "Buka Settings, tab Akun, isi password lama dan password baru, lalu klik Ganti Password." },
  { category: "Akun", q: "Bagaimana cara logout?", a: "Klik tombol Logout di pojok kanan atas navbar." },
  { category: "Postingan", q: "Bagaimana cara membuat postingan?", a: "Klik tombol + Create di navbar, masukkan URL gambar (opsional) dan caption, lalu klik Share." },
  { category: "Postingan", q: "Kenapa gambar saya tidak muncul?", a: "Pastikan URL gambar valid dan bisa dibuka langsung di browser, biasanya berakhiran .jpg, .png, atau .webp." },
  { category: "Pencarian", q: "Bagaimana cara mencari teman atau postingan?", a: "Buka menu Search lalu ketik kata kunci. Hasil muncul otomatis. Gunakan tab Pengguna atau Postingan untuk menyaring hasil." },
  { category: "Pesan", q: "Bagaimana cara mengirim pesan?", a: "Buka menu Messages, pilih kontak di sebelah kiri, tulis pesan, lalu klik Kirim. Pesan baru muncul otomatis setiap beberapa detik." },
  { category: "Pesan", q: "Apakah pesan saya tersimpan?", a: "Ya. Pesan disimpan di database sehingga tetap ada saat kamu login lagi." },
  { category: "Masalah", q: "Saya tidak bisa login, apa yang harus dilakukan?", a: "Periksa kembali email dan password. Jika tetap gagal, pastikan kamu sudah mendaftar dan koneksi internet stabil." },
];

const categories = ["Semua", ...Array.from(new Set(faqs.map((f) => f.category)))];

export default function HelpPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const q = query.trim().toLowerCase();
  const filtered = faqs.filter(
    (f) =>
      (category === "Semua" || f.category === category) &&
      (!q || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q))
  );

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <h2 className="page-title mb-1">❓ Help & FAQ</h2>
          <p className="text-muted mb-3">
            Panduan singkat menggunakan SocialConnect.
          </p>

          <input
            className="form-control form-control-lg mb-3"
            placeholder="Cari pertanyaan..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpenIndex(null);
            }}
          />

          <div className="pill-tabs mb-4">
            {categories.map((c) => (
              <button
                key={c}
                className={`pill-tab ${category === c ? "active" : ""}`}
                onClick={() => {
                  setCategory(c);
                  setOpenIndex(null);
                }}
              >
                {c}
              </button>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="card p-4 text-center text-muted">
              😕 Pertanyaan tidak ditemukan.
            </div>
          )}

          {filtered.map((f, i) => (
            <div className="faq-item" key={f.q}>
              <button
                className="faq-q"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                aria-expanded={openIndex === i}
              >
                <span>{f.q}</span>
                <span>{openIndex === i ? "−" : "+"}</span>
              </button>
              {openIndex === i && <div className="faq-a">{f.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}