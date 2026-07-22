"use client";

import type { RunResult } from "@/lib/problems/types";

function formatCell(v: unknown): { text: string; isNull: boolean } {
  if (v === null || v === undefined) return { text: "NULL", isNull: true };
  if (typeof v === "boolean") return { text: v ? "true" : "false", isNull: false };
  if (typeof v === "object") return { text: JSON.stringify(v), isNull: false };
  return { text: String(v), isNull: false };
}

export function ResultsGrid({ result }: { result: RunResult | null }) {
  if (!result) {
    return (
      <p className="text-sm text-neutral-500 p-4">
        Run a query to see its output here.
      </p>
    );
  }

  if (result.error) {
    return (
      <pre className="m-3 whitespace-pre-wrap rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
        {result.error}
      </pre>
    );
  }

  if (result.columns.length === 0) {
    return <p className="text-sm text-neutral-500 p-4">Query ran but returned no columns.</p>;
  }

  return (
    <div className="overflow-auto">
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 bg-neutral-100 dark:bg-neutral-800">
          <tr>
            {result.columns.map((c, i) => (
              <th
                key={i}
                className="border-b border-neutral-300 px-3 py-2 text-left font-semibold dark:border-neutral-700"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.rows.length === 0 ? (
            <tr>
              <td
                colSpan={result.columns.length}
                className="px-3 py-4 text-center text-neutral-500"
              >
                (0 rows)
              </td>
            </tr>
          ) : (
            result.rows.map((row, ri) => (
              <tr key={ri} className="odd:bg-neutral-50 dark:odd:bg-neutral-900/40">
                {row.map((cell, ci) => {
                  const { text, isNull } = formatCell(cell);
                  return (
                    <td
                      key={ci}
                      className={`border-b border-neutral-200 px-3 py-1.5 font-mono dark:border-neutral-800 ${
                        isNull ? "italic text-neutral-400" : ""
                      }`}
                    >
                      {text}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
      <p className="px-3 py-2 text-xs text-neutral-500">{result.rows.length} row(s)</p>
    </div>
  );
}
