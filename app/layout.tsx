import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SocialConnect",
  description: "Social Media Application"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}