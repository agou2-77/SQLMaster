"use client";

import type { CompareResult } from "@/lib/validation/compareResults";

export function ValidationBanner({ result }: { result: CompareResult | null }) {
  if (!result) return null;

  return (
    <div
      role="status"
      className={`rounded-md border px-4 py-3 text-sm font-medium ${
        result.pass
          ? "border-green-300 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300"
          : "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
      }`}
    >
      <span className="mr-2">{result.pass ? "✓" : "✗"}</span>
      {result.reason}
    </div>
  );
}
