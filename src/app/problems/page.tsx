"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { mergeProblems } from "@/lib/problems/registry";
import { useAllProgress, useCustomProblems } from "@/lib/db/hooks";
import { DifficultyBadge } from "@/components/problems/DifficultyBadge";
import { StatusPill } from "@/components/problems/StatusPill";
import { FilterBar, DEFAULT_FILTERS, type Filters } from "@/components/problems/FilterBar";

export default function ProblemsPage() {
  const custom = useCustomProblems();
  const progress = useAllProgress();
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const problems = useMemo(() => mergeProblems(custom ?? []), [custom]);

  const visible = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return problems.filter((p) => {
      if (q && !p.title.toLowerCase().includes(q)) return false;
      if (filters.difficulty !== "all" && p.difficulty !== filters.difficulty) return false;
      if (filters.topic !== "all" && !p.topics.includes(filters.topic)) return false;
      if (filters.status !== "all") {
        const status = progress?.get(p.id)?.status ?? "todo";
        if (status !== filters.status) return false;
      }
      return true;
    });
  }, [problems, filters, progress]);

  const solvedCount = useMemo(
    () => problems.filter((p) => progress?.get(p.id)?.status === "solved").length,
    [problems, progress],
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">SQL practice problems</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {solvedCount} / {problems.length} solved · runs against a real Postgres in your browser.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link
            href="/paths"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            Learning paths
          </Link>
          <Link
            href="/problems/new"
            className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            + New
          </Link>
        </div>
      </div>

      <div className="mt-5">
        <FilterBar filters={filters} onChange={setFilters} />
      </div>

      <ul className="mt-4 divide-y divide-neutral-200 rounded-lg border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
        {visible.map((p) => (
          <li key={p.id}>
            <Link
              href={`/problems/${p.id}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
            >
              <StatusPill status={progress?.get(p.id)?.status} />
              <span className="flex-1 font-medium">
                {p.title}
                {p.isCustom && (
                  <span className="ml-2 rounded bg-purple-100 px-1.5 py-0.5 text-xs text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                    custom
                  </span>
                )}
              </span>
              <span className="hidden gap-1 sm:flex">
                {p.topics.map((t) => (
                  <span
                    key={t}
                    className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                  >
                    {t}
                  </span>
                ))}
              </span>
              <DifficultyBadge difficulty={p.difficulty} />
            </Link>
          </li>
        ))}
        {visible.length === 0 && (
          <li className="px-4 py-8 text-center text-sm text-neutral-500">
            No problems match these filters.
          </li>
        )}
      </ul>
    </main>
  );
}
