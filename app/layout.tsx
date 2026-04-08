import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Client Progress Tracker",
  description: "Share project progress with clients in real time.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="brand-shell">
          <div className="brand-inner">
            <Link href="/" className="brand-logo-link" aria-label="Go to home">
              <Image
                src="/cc_icon_wordmark_slogan.png"
                alt="Codex Creativa"
                width={310}
                height={76}
                className="brand-logo"
                priority
              />
            </Link>
          </div>
        </header>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
