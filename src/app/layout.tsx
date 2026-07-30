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
  title: "SQL Master — practice SQL like LeetCode",
  description:
    "Practice SQL queries against a real in-browser Postgres, with an AI tutor.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-neutral-200 dark:border-neutral-800">
          <div className="mx-auto flex max-w-6xl items-center gap-5 px-6 py-3">
            <Link href="/" className="text-lg font-bold">
              SQL<span className="text-emerald-600">Master</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link
                href="/journey"
                className="text-neutral-600 hover:text-emerald-600 dark:text-neutral-300 dark:hover:text-emerald-400"
              >
                Journey
              </Link>
              <Link
                href="/problems"
                className="text-neutral-600 hover:text-emerald-600 dark:text-neutral-300 dark:hover:text-emerald-400"
              >
                Problems
              </Link>
              <Link
                href="/paths"
                className="text-neutral-600 hover:text-emerald-600 dark:text-neutral-300 dark:hover:text-emerald-400"
              >
                Paths
              </Link>
              <Link
                href="/cheatsheet"
                className="text-neutral-600 hover:text-emerald-600 dark:text-neutral-300 dark:hover:text-emerald-400"
              >
                Cheatsheet
              </Link>
            </nav>
            <span className="ml-auto hidden text-sm text-neutral-400 sm:inline">
              practice SQL like LeetCode
            </span>
          </div>
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
