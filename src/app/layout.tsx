import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "unoduo · The iPhone Duo app leaderboard",
  description:
    "Apps built for iPhone Duo, ranked by how much their makers paid to be here. List yours free, then boost it to the top.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <header className="border-b border-border">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              <span aria-hidden className="flex gap-0.5">
                <span className="h-5 w-3 rounded-[4px] bg-accent" />
                <span className="h-5 w-3 rounded-[4px] bg-accent-2" />
              </span>
              unoduo
            </Link>
            <Link
              href="/submit"
              className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-85"
            >
              List your app
            </Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">{children}</main>
        <footer className="border-t border-border">
          <div className="mx-auto max-w-3xl px-4 py-6 text-xs text-muted">
            Rankings are paid placements. Total boosts decide the order; ties go to whoever got
            there first. Not affiliated with Apple.
          </div>
        </footer>
      </body>
    </html>
  );
}
