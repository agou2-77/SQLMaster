"use client";

import type { SchemaTable } from "@/lib/pglite/usePglite";

export function SchemaViewer({ schema }: { schema: SchemaTable[] }) {
  if (schema.length === 0) {
    return <p className="text-sm text-neutral-500">Loading schema…</p>;
  }
  return (
    <div className="space-y-3">
      {schema.map((t) => (
        <div key={t.name} className="rounded-md border border-neutral-200 dark:border-neutral-800">
          <div className="border-b border-neutral-200 bg-neutral-50 px-3 py-1.5 font-mono text-sm font-semibold dark:border-neutral-800 dark:bg-neutral-900/60">
            {t.name}
          </div>
          <ul className="px-3 py-2 text-xs">
            {t.columns.map((c) => (
              <li key={c.name} className="flex justify-between gap-4 py-0.5 font-mono">
                <span>{c.name}</span>
                <span className="text-neutral-500">{c.type}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
