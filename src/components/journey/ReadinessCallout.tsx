"use client";

import Link from "next/link";
import type { Module } from "@/lib/modules/types";
import { getProblemById } from "@/lib/problems/registry";
import { PATHS } from "@/data/paths";

/**
 * Points a learner from a module toward the existing "comprehensive tests" it
 * prepares them for. Soft guidance only — everything linked is always
 * accessible regardless of mastery.
 */
export function ReadinessCallout({
  module,
  mastered,
}: {
  module: Module;
  mastered: boolean;
}) {
  const problems = module.comprehensiveProblemIds
    .map((id) => getProblemById(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const paths = (module.comprehensivePathIds ?? [])
    .map((id) => PATHS.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  if (problems.length === 0 && paths.length === 0) return null;

  return (
    <div
      className={`rounded-lg border p-4 ${
        mastered
          ? "border-green-300 bg-green-50 dark:border-green-900 dark:bg-green-950/40"
          : "border-neutral-200 dark:border-neutral-800"
      }`}
    >
      <h3 className="text-sm font-semibold">
        {mastered
          ? "You're ready for the comprehensive test 🎉"
          : "Where this leads"}
      </h3>
      <p className="mt-1 text-sm text-neutral-500">
        {mastered
          ? "Put it to work on the full problems this module prepares you for:"
          : "Once you've mastered this module, tackle these full problems:"}
      </p>
      <ul className="mt-3 space-y-1.5 text-sm">
        {problems.map((p) => (
          <li key={p.id}>
            <Link
              href={`/problems/${p.id}?from=problems`}
              className="text-emerald-600 hover:underline"
            >
              {p.title}
            </Link>
          </li>
        ))}
        {paths.map((p) => (
          <li key={p.id}>
            <Link href="/paths" className="text-emerald-600 hover:underline">
              Path: {p.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
