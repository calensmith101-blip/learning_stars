import "./globals.css";
import type { Metadata, Viewport } from "next";


export const metadata: Metadata = {
  title: "Family Learning Stars",
  description: "Offline-friendly Australian curriculum inspired family learning app.",
  manifest: "/manifest.webmanifest"
};

export const viewport: Viewport = {
  themeColor: "#7c3aed"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-AU">
      <body>{children}</body>
    </html>
  );
}
