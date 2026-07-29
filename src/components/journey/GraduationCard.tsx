"use client";

import Link from "next/link";
import { PATHS } from "@/data/paths";

/**
 * Shown on the journey overview once every authored module is mastered — the
 * "you've finished the guided path" moment. Celebrates the achievement and hands
 * the learner off to the comprehensive tests (interview prep + the full problem
 * set). Still soft guidance: the journey stays fully browsable afterward.
 */
export function GraduationCard({ masteredCount }: { masteredCount: number }) {
  const interviewPrep = PATHS.find((p) => p.id === "interview-prep");

  return (
    <div className="mt-6 rounded-lg border border-green-300 bg-green-50 p-6 dark:border-green-900 dark:bg-green-950/40">
      <p className="text-xs font-semibold uppercase tracking-wide text-green-700 dark:text-green-400">
        Journey complete 🎓
      </p>
      <h2 className="mt-1 text-xl font-bold">
        You&rsquo;ve mastered all {masteredCount} modules.
      </h2>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
        Every concept in the guided path is behind you. Time to put it all
        together on the comprehensive tests — the same questions that show up in
        real interviews.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {interviewPrep && (
          <Link
            href="/paths"
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            Start Interview Prep →
          </Link>
        )}
        <Link
          href="/problems"
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          Browse all problems
        </Link>
      </div>
    </div>
  );
}
