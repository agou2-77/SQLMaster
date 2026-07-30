"use client";

import Link from "next/link";
import { MODULES } from "@/data/modules";
import { PATHS } from "@/data/paths";
import { SEED_PROBLEMS } from "@/lib/problems/seed";
import { useAllProgress, useAllModuleProgress } from "@/lib/db/hooks";
import { masteredModuleCount } from "@/lib/modules/progress";
import { ProgressMeter } from "@/components/journey/ProgressMeter";
import { FeatureCard } from "@/components/landing/FeatureCard";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { WhyDifferent } from "@/components/landing/WhyDifferent";

// Reused verbatim from the in-app pages so the CTAs match the rest of the app.
const PRIMARY_CTA =
  "rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500";
const SECONDARY_CTA =
  "rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800";

// Counts derived from the actual content so the copy can't drift (the README's
// hardcoded numbers already went stale). Computed once at module load — pure
// over static data, so server and client agree.
const AUTHORED_MODULES = MODULES.filter((m) => m.status === "authored");
const MODULE_COUNT = AUTHORED_MODULES.length;
const PROBLEM_COUNT = SEED_PROBLEMS.length;
const PATH_COUNT = PATHS.length;
// Top-level "## " sections in src/content/cheatsheet.md. The cheatsheet is read
// from disk at build time (server component), so it can't be imported here;
// this mirrors that file and is covered by the manual E2E check.
const CHEATSHEET_SECTIONS = 24;
const DIFFICULTY = {
  easy: SEED_PROBLEMS.filter((p) => p.difficulty === "easy").length,
  medium: SEED_PROBLEMS.filter((p) => p.difficulty === "medium").length,
  hard: SEED_PROBLEMS.filter((p) => p.difficulty === "hard").length,
};

export default function Home() {
  const progress = useAllProgress();
  const moduleProgress = useAllModuleProgress();

  // Dexie live queries return undefined on the server and on the first client
  // render. Gate the returning-user UI on this so the server HTML and the first
  // client render are both the new-visitor hero — otherwise hydration mismatches
  // and the CTA flashes "Resume" → "Start". (Same gate as the journey page.)
  const moduleProgressLoaded = moduleProgress !== undefined;
  const masteredCount = masteredModuleCount(AUTHORED_MODULES, moduleProgress);
  const nextModule = moduleProgressLoaded
    ? MODULES.find(
        (m) => m.status === "authored" && !moduleProgress.get(m.id)?.mastered,
      )
    : undefined;
  const allAuthoredMastered =
    moduleProgressLoaded && MODULE_COUNT > 0 && !nextModule;

  const solvedCount = progress
    ? SEED_PROBLEMS.filter((p) => progress.get(p.id)?.status === "solved").length
    : 0;

  const hasProgress =
    moduleProgressLoaded && (masteredCount > 0 || solvedCount > 0);

  // Primary CTA adapts to the learner's state; secondary CTA is constant.
  let ctaHref = "/journey";
  let ctaLabel = "Start the journey →";
  if (allAuthoredMastered) {
    ctaHref = "/paths";
    ctaLabel = "Explore Interview Prep →";
  } else if (masteredCount > 0 && nextModule) {
    // Only "resume" once at least one module is mastered. A user who has only
    // solved standalone problems hasn't started the journey, so they fall
    // through to the "Start" default — with their progress still shown below.
    ctaHref = `/journey/${nextModule.id}`;
    ctaLabel = "Resume where you left off →";
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      {/* Hero */}
      <section className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Master SQL by running it, not memorizing it.
        </h1>
        <p className="mt-4 text-neutral-600 dark:text-neutral-300">
          Write PostgreSQL, run it against a real Postgres database in your
          browser, and get instant pass/fail feedback — plus an AI tutor that
          coaches you toward the answer instead of handing it over.
        </p>

        {hasProgress && (
          <div className="mt-6 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
            {allAuthoredMastered ? (
              <p className="text-sm font-medium text-green-700 dark:text-green-400">
                <span aria-hidden>🎓</span> You&apos;ve mastered all{" "}
                {MODULE_COUNT} modules — on to the comprehensive tests.
              </p>
            ) : (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Your progress</span>
                  <span className="text-neutral-500">
                    {solvedCount} / {PROBLEM_COUNT} problems solved
                  </span>
                </div>
                <div className="mt-2">
                  <ProgressMeter
                    value={masteredCount}
                    max={MODULE_COUNT}
                    label={`${masteredCount} / ${MODULE_COUNT} modules mastered`}
                    ariaLabel="Modules mastered"
                  />
                </div>
              </>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={ctaHref} className={PRIMARY_CTA}>
            {ctaLabel}
          </Link>
          <Link href="/problems" className={SECONDARY_CTA}>
            Browse problems
          </Link>
        </div>

        <p className="mt-5 text-sm text-neutral-500">
          {PROBLEM_COUNT} problems · {MODULE_COUNT}-module guided journey ·{" "}
          {PATH_COUNT} learning paths · in-browser Postgres · works offline
        </p>
      </section>

      {/* Explore */}
      <section className="mt-16">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Explore
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <FeatureCard
            title="Guided journey"
            meta={`${MODULE_COUNT} modules`}
            description="From SELECT basics to window functions. Practice one concept at a time, then prove it with a short quiz."
            href="/journey"
            cta="Start learning"
          />
          <FeatureCard
            title="Problem library"
            meta={`${PROBLEM_COUNT} problems`}
            description={`LeetCode-style problems (${DIFFICULTY.easy} easy · ${DIFFICULTY.medium} medium · ${DIFFICULTY.hard} hard) with instant, deterministic grading.`}
            href="/problems"
            cta="Browse problems"
          />
          <FeatureCard
            title="Learning paths"
            meta={`${PATH_COUNT} paths`}
            description="Ordered sequences that build a topic from the ground up, one problem at a time."
            href="/paths"
            cta="View paths"
          />
          <FeatureCard
            title="Cheatsheet"
            meta={`${CHEATSHEET_SECTIONS} sections`}
            description="A practical, example-driven SQL reference — when to use which syntax and function."
            href="/cheatsheet"
            cta="Open cheatsheet"
          />
        </div>
      </section>

      <HowItWorks />
      <WhyDifferent />

      {/* Closing CTA */}
      <section className="mt-16 flex flex-col items-start gap-4 rounded-lg border border-emerald-300 bg-emerald-50 p-6 dark:border-emerald-900 dark:bg-emerald-950/40 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold">Ready to write some SQL?</h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
            No signup, no setup — it runs entirely in your browser.
          </p>
        </div>
        <Link href={ctaHref} className={`${PRIMARY_CTA} shrink-0`}>
          {ctaLabel}
        </Link>
      </section>
    </main>
  );
}
