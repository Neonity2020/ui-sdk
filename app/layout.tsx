import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UI SDK Demo & Showcase — Vercel Labs Behaviors",
  description: "Interactive showcase for Vercel Labs @ui-sdk/core and @ui-sdk/react. Behaviors, not finished components. Made for AI Agents & Developers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="antialiased selection:bg-neutral-800 selection:text-white font-sans">
        {children}
      </body>
    </html>
  );
}
