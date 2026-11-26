import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import Navbar from "./components/Navbar";

export const metadata: Metadata = {
  title: "SocialConnect",
  description: "Connect, share, and discover new friends.",
  applicationName: "SocialConnect",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          backgroundColor: "#f6f5fa",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <Navbar />

        {children}
      </body>
    </html>
  );
}