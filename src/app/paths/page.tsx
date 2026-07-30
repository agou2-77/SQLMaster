"use client";

import { useMemo } from "react";
import Link from "next/link";
import { PATHS } from "@/data/paths";
import { mergeProblems } from "@/lib/problems/registry";
import { useAllProgress, useCustomProblems } from "@/lib/db/hooks";
import { StatusPill } from "@/components/problems/StatusPill";
import { DifficultyBadge } from "@/components/problems/DifficultyBadge";

export default function PathsPage() {
  const custom = useCustomProblems();
  const progress = useAllProgress();
  const byId = useMemo(() => {
    const map = new Map(mergeProblems(custom ?? []).map((p) => [p.id, p]));
    return map;
  }, [custom]);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <Link href="/problems" className="text-sm text-emerald-600 hover:underline">
        ← All problems
      </Link>
      <h1 className="mt-3 text-2xl font-bold">Learning paths</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Ordered sequences that build up a topic from the ground up.
      </p>

      <div className="mt-6 space-y-6">
        {PATHS.map((path) => {
          const problems = path.problemIds.map((id) => byId.get(id)).filter(Boolean);
          const solved = problems.filter(
            (p) => p && progress?.get(p.id)?.status === "solved",
          ).length;
          return (
            <section
              key={path.id}
              className="rounded-lg border border-neutral-200 dark:border-neutral-800"
            >
              <div className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">{path.title}</h2>
                  <span className="text-xs text-neutral-500">
                    {solved} / {problems.length} solved
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-neutral-500">{path.description}</p>
              </div>
              <ol className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {problems.map(
                  (p) =>
                    p && (
                      <li key={p.id}>
                        <Link
                          href={`/problems/${p.id}?from=paths&p=${path.id}`}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                        >
                          <StatusPill status={progress?.get(p.id)?.status} />
                          <span className="flex-1 text-sm">{p.title}</span>
                          <DifficultyBadge difficulty={p.difficulty} />
                        </Link>
                      </li>
                    ),
                )}
              </ol>
            </section>
          );
        })}
      </div>
    </main>
  );
}
