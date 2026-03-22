import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ethereal — Curated Luxury Fashion",
  description: "Experience the weightless beauty of our latest Artisan Collection.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
