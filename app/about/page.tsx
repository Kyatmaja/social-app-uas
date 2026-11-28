const features = [
  { icon: "📝", title: "Postingan", text: "Bagikan foto dan caption ke feed bersama." },
  { icon: "🔎", title: "Pencarian", text: "Cari pengguna dan postingan dengan hasil instan." },
  { icon: "💬", title: "Pesan", text: "Kirim pesan antar pengguna yang tersimpan di database." },
  { icon: "👥", title: "Pertemanan", text: "Kirim dan terima permintaan pertemanan." },
  { icon: "🔔", title: "Notifikasi", text: "Dapatkan pemberitahuan aktivitas terbaru." },
  { icon: "⚙️", title: "Pengaturan", text: "Atur profil, privasi, dan keamanan akun." },
];

const tech = [
  "Next.js (App Router)",
  "React",
  "TypeScript",
  "Bootstrap 5",
  "Tailwind CSS",
  "Prisma ORM",
  "PostgreSQL (Neon)",
  "Vercel",
];

const team = [
  { name: "Kyatmaja Lookman", role: "Pencarian, Pesan, Pengaturan, Help & About" },
  // Tambahkan anggota tim lain di sini:
  // { name: "Nama Teman", role: "Bagian yang dikerjakan" },
];

export default function AboutPage() {
  return (
    <div className="container py-4">
      <div className="hero-box mb-5">
        <h1 className="fw-bold mb-2">SocialConnect</h1>
        <p className="mb-0 fs-5">
          Aplikasi media sosial simulasi untuk tugas UAS Front-End Programming.
        </p>
      </div>

      <h3 className="fw-bold mb-3">Fitur Utama</h3>
      <div className="row g-3 mb-5">
        {features.map((f) => (
          <div className="col-md-6 col-lg-4" key={f.title}>
            <div className="card feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h5 className="fw-bold">{f.title}</h5>
              <p className="text-muted mb-0">{f.text}</p>
            </div>
          </div>
        ))}
      </div>

      <h3 className="fw-bold mb-3">Teknologi</h3>
      <div className="card p-4 mb-5">
        {tech.map((t) => (
          <span className="tech-badge" key={t}>
            {t}
          </span>
        ))}
      </div>

      <h3 className="fw-bold mb-3">Tim Pengembang</h3>
      <div className="row g-3">
        {team.map((m) => (
          <div className="col-md-6 col-lg-4" key={m.name}>
            <div className="card p-3 flex-row align-items-center gap-3">
              <div className="avatar">{m.name.charAt(0)}</div>
              <div>
                <div className="fw-bold">{m.name}</div>
                <div className="text-muted small">{m.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}