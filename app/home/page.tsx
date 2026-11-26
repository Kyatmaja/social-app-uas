"use client";

import Link from "next/link";
import { useState } from "react";

export default function HomePage() {
  const [content, setContent] = useState("");

  const [posts, setPosts] = useState<
    {
      id: number;
      name: string;
      time: string;
      content: string;
      likes: number;
      liked: boolean;
    }[]
  >([]);

  const createPost = () => {
    if (!content.trim()) return;

    setPosts((prev) => [
      {
        id: Date.now(),
        name: "You",
        time: "Baru saja",
        content: content.trim(),
        likes: 0,
        liked: false,
      },
      ...prev,
    ]);

    setContent("");
  };

  const toggleLike = (id: number) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === id
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked
                ? post.likes - 1
                : post.likes + 1,
            }
          : post
      )
    );
  };

  const deletePost = (id: number) => {
    setPosts((prev) =>
      prev.filter((post) => post.id !== id)
    );
  };

  const menus = [
    { icon: "🔎", name: "User Directory", href: "/users" },
    { icon: "👥", name: "Friends List", href: "/friends" },
    { icon: "💌", name: "Friend Requests",  href: "/friend-requests" },
    { icon: "🔔", name: "Notifications", href: "/notifications" },
    { icon: "💬", name: "Messages", href: "/messages" },
    { icon: "👤", name: "Profile", href: "/profile" },
  ];

  return (
    <div className="home-page">
      <div className="home-container">

        {/* Welcome Banner */}
        <div className="welcome-banner">
          <div>
            <span className="welcome-label">
              YOUR SOCIAL SPACE
            </span>

            <h1>Welcome to SocialConnect! 👋</h1>

            <p>
              Terhubung, berbagi cerita, dan temukan teman baru.
            </p>
          </div>

          <div className="banner-icon">💬</div>
        </div>

        <div className="home-grid">

          {/* Main Feed */}
          <main>

            <div className="section-heading">
              <h2>Home Feed</h2>
              <span>Latest activity</span>
            </div>

            {/* Create Post */}
            <div className="social-card">
              <div className="create-post">
                <div className="avatar">Y</div>

                <textarea
                  placeholder="Apa yang kamu pikirkan?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="post-actions">
                <span className="post-label">
                  ✨ Share your story
                </span>

                <button
                  className="primary-button"
                  onClick={createPost}
                  disabled={!content.trim()}
                >
                  Publish Post
                </button>
              </div>
            </div>

            {/* Empty Feed */}
            {posts.length === 0 && (
              <div className="social-card empty-feed">
                <div className="empty-icon">📸</div>

                <h3>Belum Ada Postingan</h3>

                <p>
                  Jadilah yang pertama membagikan cerita
                  hari ini!
                </p>
              </div>
            )}

            {/* Posts */}
            {posts.map((post) => (
              <div className="social-card" key={post.id}>

                <div className="post-header">
                  <div className="avatar">
                    {post.name.charAt(0)}
                  </div>

                  <div className="post-user">
                    <strong>{post.name}</strong>
                    <small>{post.time}</small>
                  </div>

                  <button
                    className="delete-button"
                    onClick={() => deletePost(post.id)}
                  >
                    Delete
                  </button>
                </div>

                <p className="post-content">
                  {post.content}
                </p>

                <div className="post-footer">
                  <button
                    className={post.liked ? "liked" : ""}
                    onClick={() => toggleLike(post.id)}
                  >
                    {post.liked ? "❤️" : "🤍"} {post.likes} Likes
                  </button>
                </div>

              </div>
            ))}
          </main>

          {/* Quick Menu */}
          <aside>
            <div className="social-card quick-menu">
              <h3>Quick Menu</h3>

              <p>Explore SocialConnect</p>

              {menus.map((menu) => (
                <Link
                  key={menu.href}
                  href={menu.href}
                  className="menu-link"
                >
                  <span className="menu-icon">
                    {menu.icon}
                  </span>

                  <span>{menu.name}</span>

                  <span className="menu-arrow">›</span>
                </Link>
              ))}
            </div>

            <div className="social-card community-card">
              <div className="community-icon">🌎</div>

              <h3>Grow Your Community</h3>

              <p>
                Temukan teman baru dan mulai percakapan
                bersama mereka.
              </p>

              <Link href="/users" className="primary-button">
                Find Friends
              </Link>
            </div>

            <div className="copyright">
              © SocialConnect
            </div>
          </aside>

        </div>
      </div>

      <style>{`
        .home-page {
          min-height: 100vh;
          background: #f6f5fa;
          color: #202033;
          padding: 32px 20px;
          font-family: Arial, sans-serif;
        }

        .home-container {
          max-width: 1150px;
          margin: auto;
        }

        .welcome-banner {
          background: linear-gradient(
            120deg,
            #7c3aed,
            #c026d3,
            #ec4899
          );
          color: white;
          border-radius: 24px;
          padding: 38px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
          box-shadow: 0 10px 30px #9333ea25;
        }

        .welcome-label {
          font-size: 11px;
          font-weight: bold;
          letter-spacing: 3px;
          opacity: 0.85;
        }

        .welcome-banner h1 {
          font-size: 30px;
          font-weight: 800;
          margin: 14px 0;
        }

        .welcome-banner p {
          margin: 0;
          opacity: 0.9;
        }

        .banner-icon {
          font-size: 75px;
          padding-left: 20px;
        }

        .home-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 310px;
          gap: 25px;
          align-items: start;
        }

        .section-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .section-heading h2 {
          font-size: 24px;
          font-weight: 800;
          margin: 0;
        }

        .section-heading span {
          color: #999;
          font-size: 13px;
        }

        .social-card {
          background: white;
          border: 1px solid #eeeaf4;
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 20px;
          box-shadow: 0 4px 20px #00000005;
        }

        .create-post {
          display: flex;
          gap: 15px;
          align-items: flex-start;
        }

        .avatar {
          width: 48px;
          height: 48px;
          min-width: 48px;
          border-radius: 50%;
          background: linear-gradient(
            135deg,
            #9333ea,
            #ec4899
          );
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: bold;
        }

        textarea {
          width: 100%;
          background: #f7f7fb;
          border: 1px solid #eeeaf4;
          border-radius: 15px;
          padding: 15px;
          outline: none;
          resize: vertical;
          font-size: 14px;
        }

        textarea:focus {
          border-color: #9333ea;
        }

        .post-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 18px;
          gap: 10px;
        }

        .post-label {
          font-size: 13px;
          color: #777;
        }

        .primary-button {
          display: inline-block;
          background: linear-gradient(
            120deg,
            #9333ea,
            #ec4899
          );
          border: none;
          border-radius: 12px;
          padding: 12px 20px;
          color: white !important;
          text-decoration: none !important;
          font-weight: bold;
          font-size: 14px;
          cursor: pointer;
          transition: 0.2s;
        }

        .primary-button:hover {
          opacity: 0.85;
          transform: translateY(-2px);
        }

        .primary-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .empty-feed {
          min-height: 280px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .empty-icon {
          width: 85px;
          height: 85px;
          border-radius: 50%;
          background: #f3e8ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 38px;
          margin-bottom: 20px;
        }

        .empty-feed h3 {
          font-size: 20px;
          font-weight: bold;
        }

        .empty-feed p {
          color: #888;
          font-size: 14px;
        }

        .quick-menu h3,
        .community-card h3 {
          font-size: 19px;
          font-weight: bold;
        }

        .quick-menu p,
        .community-card p {
          color: #888;
          font-size: 13px;
          line-height: 1.7;
        }

        .quick-menu .menu-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 8px;
          border-radius: 12px;
          color: #444;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: 0.2s;
        }

        .quick-menu .menu-link:hover {
          background: #f3e8ff;
          color: #9333ea;
        }

        .menu-icon {
          width: 35px;
          height: 35px;
          background: #f7efff;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 17px;
        }

        .menu-arrow {
          margin-left: auto;
          font-size: 22px;
          color: #aaa;
        }

        .community-card {
          text-align: center;
        }

        .community-icon {
          font-size: 40px;
          margin-bottom: 15px;
        }

        .community-card .primary-button {
          display: block;
          background: linear-gradient(120deg, #9333ea, #ec4899);
          color: white;
          border-radius: 12px;
          padding: 12px 20px;
          text-decoration: none;
          font-weight: bold;
          font-size: 14px;
        }

        .copyright {
          text-align: center;
          color: #aaa;
          font-size: 12px;
        }

        .post-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .post-user {
          flex: 1;
        }

        .post-user small {
          display: block;
          color: #999;
          margin-top: 4px;
        }

        .post-content {
          padding: 20px 0;
          line-height: 1.7;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        .post-footer {
          border-top: 1px solid #eee;
          padding-top: 15px;
        }

        .post-footer button,
        .delete-button {
          border: none;
          background: transparent;
          color: #777;
          cursor: pointer;
          font-size: 14px;
        }

        .post-footer .liked {
          color: #ec4899;
        }

        .delete-button:hover {
          color: red;
        }

        @media (max-width: 768px) {
          .home-grid {
            grid-template-columns: 1fr;
          }

          .welcome-banner {
            padding: 25px;
          }

          .welcome-banner h1 {
            font-size: 23px;
          }

          .banner-icon {
            display: none;
          }

          .home-page {
            padding: 20px 12px;
          }

          .social-card {
            padding: 18px;
          }
        }
      `}</style>
    </div>
  );
}