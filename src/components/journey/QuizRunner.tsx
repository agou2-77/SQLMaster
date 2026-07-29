"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import type { Module } from "@/lib/modules/types";
import { recordQuizResult } from "@/lib/db/dexie";
import { QuizQuestion } from "@/components/journey/QuizQuestion";
import { ReadinessCallout } from "@/components/journey/ReadinessCallout";

type Phase = "intro" | "running" | "results";

/**
 * Drives a module's gate quiz question-by-question. Run state is ephemeral —
 * only the final score is persisted (via recordQuizResult) when the learner
 * finishes an attempt. Navigation is deliberately forward-only: this is a gate
 * you retake, not a form you edit.
 */
export function QuizRunner({ module }: { module: Module }) {
  const total = module.quiz.length;
  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [passed, setPassed] = useState<boolean[]>(() =>
    Array(total).fill(false),
  );
  // Which questions have been graded at least once this attempt (drives the
  // amber "attempted but not solved" segment in the progress bar).
  const [attempted, setAttempted] = useState<boolean[]>(() =>
    Array(total).fill(false),
  );
  const [attempt, setAttempt] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [finalPassed, setFinalPassed] = useState<boolean[]>([]);

  const start = useCallback(() => {
    setPassed(Array(total).fill(false));
    setAttempted(Array(total).fill(false));
    setIndex(0);
    setAttempt((a) => a + 1);
    setPhase("running");
  }, [total]);

  const handleGraded = useCallback(
    (pass: boolean) => {
      setAttempted((prev) => {
        if (prev[index]) return prev;
        const next = [...prev];
        next[index] = true;
        return next;
      });
      setPassed((prev) => {
        if (!pass || prev[index]) return prev;
        const next = [...prev];
        next[index] = true;
        return next;
      });
    },
    [index],
  );

  const handleNext = useCallback(() => {
    if (index < total - 1) {
      setIndex((i) => i + 1);
      return;
    }
    const score = passed.filter(Boolean).length;
    setFinalScore(score);
    setFinalPassed(passed);
    void recordQuizResult(module.id, score, total, module.quizPassThreshold);
    setPhase("results");
  }, [index, total, passed, module.id, module.quizPassThreshold]);

  if (total === 0) {
    return (
      <p className="rounded-md border border-neutral-200 p-4 text-sm text-neutral-500 dark:border-neutral-800">
        This module’s quiz hasn’t been written yet.
      </p>
    );
  }

  if (phase === "intro") {
    return (
      <div className="space-y-4 rounded-lg border border-neutral-200 p-6 dark:border-neutral-800">
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          {total} questions. Solve at least{" "}
          <strong>{module.quizPassThreshold}</strong> to master this module. No
          hints or solutions here — that’s the point. You can retake it anytime.
        </p>
        <button
          type="button"
          onClick={start}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
        >
          Start quiz ▸
        </button>
      </div>
    );
  }

  if (phase === "results") {
    const mastered = finalScore >= module.quizPassThreshold;
    return (
      <div className="space-y-5">
        <div
          className={`rounded-lg border p-6 text-center ${
            mastered
              ? "border-green-300 bg-green-50 dark:border-green-900 dark:bg-green-950/40"
              : "border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40"
          }`}
        >
          <h2 className="text-3xl font-bold">
            {finalScore} / {total}
          </h2>
          <p className="mt-2 text-sm font-medium">
            {mastered
              ? `Module mastered — you cleared the ${module.quizPassThreshold}-question bar.`
              : `You need ${module.quizPassThreshold} to master this module. Review and retake.`}
          </p>
        </div>

        <ol className="space-y-1.5 rounded-lg border border-neutral-200 p-4 text-sm dark:border-neutral-800">
          {module.quiz.map((q, i) => {
            const ok = finalPassed[i] ?? false;
            return (
              <li key={q.id} className="flex items-center justify-between gap-3">
                <span className="text-neutral-600 dark:text-neutral-300">
                  {i + 1}. {q.title}
                </span>
                <span
                  className={
                    ok
                      ? "shrink-0 font-semibold text-green-600 dark:text-green-400"
                      : "shrink-0 font-semibold text-neutral-400"
                  }
                >
                  {ok ? "Solved ✓" : "Missed ✗"}
                </span>
              </li>
            );
          })}
        </ol>

        {mastered && <ReadinessCallout module={module} mastered />}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={start}
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            Retake quiz
          </button>
          <Link
            href={`/journey/${module.id}`}
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            Back to module
          </Link>
        </div>
      </div>
    );
  }

  const current = module.quiz[index];
  const solvedSoFar = passed.filter(Boolean).length;
  const cleared = solvedSoFar >= module.quizPassThreshold;

  return (
    <div className="space-y-4">
      {/* Per-question progress: one segment each — emerald=solved, amber=tried
          but not solved, ringed=current, neutral=not yet reached. */}
      <div className="flex items-center gap-1.5">
        {module.quiz.map((q, i) => {
          const isCurrent = i === index;
          const base = passed[i]
            ? "bg-emerald-500"
            : attempted[i]
              ? "bg-amber-400"
              : "bg-neutral-200 dark:bg-neutral-700";
          const ring = isCurrent
            ? " ring-2 ring-emerald-500 ring-offset-1 ring-offset-white dark:ring-offset-neutral-950"
            : "";
          return (
            <div
              key={q.id}
              aria-hidden
              className={`h-1.5 flex-1 rounded-full transition-all ${base}${ring}`}
            />
          );
        })}
      </div>

      <p
        className="text-xs text-neutral-500"
        aria-live="polite"
        aria-atomic="true"
      >
        {cleared ? (
          <span className="font-medium text-green-600 dark:text-green-400">
            Pass bar cleared ✓ — finish to lock it in.
          </span>
        ) : (
          <>
            Solved {solvedSoFar} of {total} · need {module.quizPassThreshold} to
            master
          </>
        )}
      </p>

      <QuizQuestion
        key={`${attempt}-${current.id}`}
        problem={current}
        index={index}
        total={total}
        passed={passed[index]}
        onGraded={handleGraded}
        onNext={handleNext}
        isLast={index === total - 1}
      />
    </div>
  );
}
