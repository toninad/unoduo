import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "unoduo · The iPhone Duo app leaderboard",
  description:
    "Apps built for iPhone Duo, ranked by how much their makers paid to be here. List yours free, then boost it to the top.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <header className="mx-auto flex w-full max-w-2xl items-baseline justify-between px-5 pt-8 pb-4">
          <Link href="/" className="text-[17px] font-semibold tracking-tight">
            unoduo
          </Link>
          <Link href="/submit" className="text-[15px] text-muted hover:text-foreground">
            List your app
          </Link>
        </header>
        <main className="mx-auto w-full max-w-2xl flex-1 px-5 pb-16">{children}</main>
        <footer className="mx-auto w-full max-w-2xl px-5 pb-10 text-[13px] leading-relaxed text-muted">
          Every position on this page is paid for. Apps are ranked by the total paid; ties go to
          whoever got there first. Not affiliated with Apple.
        </footer>
      </body>
    </html>
  );
}
