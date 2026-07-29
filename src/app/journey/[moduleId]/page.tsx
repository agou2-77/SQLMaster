"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getModuleById } from "@/data/modules";
import { useAllProgress, useModuleProgress } from "@/lib/db/hooks";
import { deriveModuleState, drillsSolved } from "@/lib/modules/progress";
import { ModuleStateBadge } from "@/components/journey/ModuleStateBadge";
import { ReadinessCallout } from "@/components/journey/ReadinessCallout";
import { ProgressMeter } from "@/components/journey/ProgressMeter";
import { StatusPill } from "@/components/problems/StatusPill";

export default function ModuleDetailPage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const module = getModuleById(moduleId);
  const progress = useAllProgress();
  const { row: moduleProgress } = useModuleProgress(moduleId);

  if (!module) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <Link href="/journey" className="text-sm text-emerald-600 hover:underline">
          ← Journey
        </Link>
        <p className="mt-6">Module not found.</p>
      </main>
    );
  }

  const isStub = module.status === "stub";
  const mastered = moduleProgress?.mastered ?? false;
  // Mastery is handled above; otherwise fall back to practicing/not-started.
  const state = mastered ? "mastered" : deriveModuleState(module, progress, undefined);
  const solved = drillsSolved(module, progress);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <Link href="/journey" className="text-sm text-emerald-600 hover:underline">
        ← Journey
      </Link>

      <div className="mt-3 flex items-center gap-3">
        <span className="text-sm font-semibold text-neutral-400">
          Module {module.order}
        </span>
        {isStub ? (
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
            Coming soon
          </span>
        ) : (
          <ModuleStateBadge state={state} />
        )}
      </div>
      <h1 className="mt-1 text-2xl font-bold">{module.title}</h1>
      <p className="mt-1 text-neutral-500">{module.summary}</p>

      {/* Step 1 — learn the concept */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          1 · Learn the concept
        </h2>
        <Link
          href={`/cheatsheet#${module.cheatsheetAnchor}`}
          className="mt-2 inline-flex items-center gap-2 rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900/50"
        >
          Read the cheatsheet →
        </Link>
      </section>

      {/* Step 2 — practice drills */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            2 · Practice drills
          </h2>
          {!isStub && module.drills.length > 0 && (
            <span className="text-xs text-neutral-500">
              {solved} / {module.drills.length} solved
            </span>
          )}
        </div>

        {!isStub && module.drills.length > 0 && (
          <div className="mt-2">
            <ProgressMeter
              value={solved}
              max={module.drills.length}
              ariaLabel="Drills solved"
            />
          </div>
        )}

        {isStub || module.drills.length === 0 ? (
          <p className="mt-2 rounded-md border border-neutral-200 p-4 text-sm text-neutral-500 dark:border-neutral-800">
            Drills for this module are coming soon. In the meantime, read the
            cheatsheet and try the full problems below.
          </p>
        ) : (
          <ol className="mt-3 space-y-2">
            {module.drills.map((drill, i) => (
              <li key={drill.id}>
                <Link
                  href={`/problems/${drill.id}?from=journey&m=${module.id}`}
                  className="flex items-center gap-3 rounded-lg border border-neutral-200 px-4 py-3 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900/50"
                >
                  <span className="w-5 shrink-0 text-center text-sm font-semibold text-neutral-400">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm font-medium">
                    {drill.title}
                  </span>
                  <StatusPill status={progress?.get(drill.id)?.status} />
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Step 3 — mastery quiz */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          3 · Prove mastery
        </h2>
        {isStub || module.quiz.length === 0 ? (
          <p className="mt-2 rounded-md border border-neutral-200 p-4 text-sm text-neutral-500 dark:border-neutral-800">
            The mastery quiz for this module is coming soon.
          </p>
        ) : (
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Link
              href={`/journey/${module.id}/quiz`}
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
            >
              {mastered ? "Retake the mastery quiz →" : "Take the mastery quiz →"}
            </Link>
            {mastered ? (
              <span className="text-sm text-green-700 dark:text-green-400">
                Mastered ✓
                {moduleProgress
                  ? ` · best ${moduleProgress.bestQuizScore}/${moduleProgress.quizTotal}`
                  : ""}
              </span>
            ) : moduleProgress ? (
              <span className="text-sm text-neutral-500">
                Best so far: {moduleProgress.bestQuizScore}/
                {moduleProgress.quizTotal} (need {module.quizPassThreshold} to
                master)
              </span>
            ) : (
              <span className="text-sm text-neutral-500">
                Pass {module.quizPassThreshold} of {module.quiz.length} to master
                this module.
              </span>
            )}
          </div>
        )}
      </section>

      {/* Step 4 — where it leads */}
      <section className="mt-8">
        <ReadinessCallout module={module} mastered={mastered} />
      </section>
    </main>
  );
}
