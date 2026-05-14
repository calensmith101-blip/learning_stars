import "./globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Family Learning Stars",
  description: "Offline-friendly Australian curriculum inspired family learning app.",
  manifest: "/manifest.webmanifest"
};

export const viewport: Viewport = {
  themeColor: "#2d1b69"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-AU">
      <body>{children}</body>
    </html>
  );
}
