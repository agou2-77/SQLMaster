"use client";

import Link from "next/link";
import type { ModuleCluster } from "@/data/clusters";
import { getProblemById } from "@/lib/problems/registry";
import { PATHS } from "@/data/paths";

/**
 * Milestone callout shown on the journey overview when every module in a cluster
 * has been mastered. Points the learner at the comprehensive tests the cluster
 * prepares them for. Soft guidance only — everything linked is always
 * accessible. Resolves problem/path ids the same way as ReadinessCallout.
 */
export function ClusterCallout({ cluster }: { cluster: ModuleCluster }) {
  const problems = (cluster.problemIds ?? [])
    .map((id) => getProblemById(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const paths = (cluster.pathIds ?? [])
    .map((id) => PATHS.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="rounded-lg border border-green-300 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/40">
      <div className="flex items-center gap-2">
        <span aria-hidden>🏅</span>
        <h3 className="text-sm font-semibold text-green-800 dark:text-green-300">
          {cluster.title} — cluster mastered
        </h3>
      </div>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
        {cluster.blurb}
      </p>
      {(problems.length > 0 || paths.length > 0) && (
        <>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-green-700 dark:text-green-400">
            Put it to work
          </p>
          <ul className="mt-1.5 space-y-1.5 text-sm">
            {paths.map((p) => (
              <li key={`path-${p.id}`}>
                <Link href="/paths" className="text-emerald-600 hover:underline">
                  Path: {p.title}
                </Link>
              </li>
            ))}
            {problems.map((p) => (
              <li key={`problem-${p.id}`}>
                <Link
                  href={`/problems/${p.id}?from=problems`}
                  className="text-emerald-600 hover:underline"
                >
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
