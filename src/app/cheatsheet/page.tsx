import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { CheatsheetView } from "@/components/cheatsheet/CheatsheetView";

export const metadata: Metadata = {
  title: "SQL Cheatsheet — SQL Master",
  description:
    "A comprehensive, example-driven SQL reference: when to use which syntax and function.",
};

export default function CheatsheetPage() {
  const content = fs.readFileSync(
    path.join(process.cwd(), "src/content/cheatsheet.md"),
    "utf8",
  );

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-8">
      <CheatsheetView content={content} />
    </main>
  );
}
