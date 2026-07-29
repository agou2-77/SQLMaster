"use client";

import Link from "next/link";
import { MODULES } from "@/data/modules";
import { CLUSTERS } from "@/data/clusters";
import { useAllProgress, useAllModuleProgress } from "@/lib/db/hooks";
import {
  deriveModuleState,
  drillsSolved,
  masteredClusterIds,
  masteredModuleCount,
} from "@/lib/modules/progress";
import { ModuleStateBadge } from "@/components/journey/ModuleStateBadge";
import { ProgressMeter } from "@/components/journey/ProgressMeter";
import { ClusterCallout } from "@/components/journey/ClusterCallout";
import { GraduationCard } from "@/components/journey/GraduationCard";

export default function JourneyPage() {
  const progress = useAllProgress();
  const moduleProgress = useAllModuleProgress();

  const authoredModules = MODULES.filter((m) => m.status === "authored");
  const masteredCount = masteredModuleCount(authoredModules, moduleProgress);

  // Recommended next step: the first authored module not yet mastered. Gate on
  // moduleProgress having loaded — while it's undefined every module reads as
  // "not mastered", which would briefly recommend an already-mastered module
  // and then swap to the "all mastered" banner. Show neither until we know.
  const moduleProgressLoaded = moduleProgress !== undefined;
  const nextModule = moduleProgressLoaded
    ? MODULES.find(
        (m) => m.status === "authored" && !moduleProgress.get(m.id)?.mastered,
      )
    : undefined;
  const allAuthoredMastered =
    moduleProgressLoaded && authoredModules.length > 0 && !nextModule;

  // Milestone callouts for fully-mastered clusters. Suppressed once graduated —
  // the graduation card supersedes the per-cluster acknowledgements.
  const doneClusters = masteredClusterIds(CLUSTERS, moduleProgress);
  const masteredClusters = allAuthoredMastered
    ? []
    : CLUSTERS.filter((c) => doneClusters.has(c.id));

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-bold">Your SQL mastery journey</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Practice one concept at a time, prove it with a short quiz, then take on
        the full problems. Nothing is locked — this is your recommended path.
      </p>

      {authoredModules.length > 0 && (
        <div className="mt-5">
          <ProgressMeter
            value={masteredCount}
            max={authoredModules.length}
            label={`${masteredCount} / ${authoredModules.length} modules mastered`}
            ariaLabel="Modules mastered"
          />
        </div>
      )}

      {allAuthoredMastered && <GraduationCard masteredCount={masteredCount} />}

      {nextModule && (
        <div className="mt-6 rounded-lg border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/40">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
            Recommended next
          </p>
          <div className="mt-1 flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold">{nextModule.title}</p>
              <p className="text-sm text-neutral-500">{nextModule.summary}</p>
            </div>
            <Link
              href={`/journey/${nextModule.id}`}
              className="shrink-0 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
            >
              {deriveModuleState(nextModule, progress, moduleProgress) ===
              "practicing"
                ? "Continue ▸"
                : "Start ▸"}
            </Link>
          </div>
        </div>
      )}

      {masteredClusters.length > 0 && (
        <section className="mt-6 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Milestones
          </h2>
          {masteredClusters.map((c) => (
            <ClusterCallout key={c.id} cluster={c} />
          ))}
        </section>
      )}

      <ol className="mt-8 space-y-3">
        {MODULES.map((m) => {
          const state = deriveModuleState(m, progress, moduleProgress);
          const solved = drillsSolved(m, progress);
          const isStub = m.status === "stub";
          return (
            <li key={m.id}>
              <Link
                href={`/journey/${m.id}`}
                className="flex items-center gap-4 rounded-lg border border-neutral-200 px-4 py-3 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900/50"
              >
                <span className="w-6 shrink-0 text-center text-sm font-semibold text-neutral-400">
                  {m.order}
                </span>
                <span className="flex-1">
                  <span className="flex items-center gap-2">
                    <span className="font-semibold">{m.title}</span>
                    {isStub ? (
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                        Coming soon
                      </span>
                    ) : (
                      <ModuleStateBadge state={state} />
                    )}
                  </span>
                  <span className="mt-0.5 block text-sm text-neutral-500">
                    {m.summary}
                  </span>
                </span>
                {!isStub && m.drills.length > 0 && (
                  // aria-hidden: the meter is redundant with the card's title +
                  // state badge, and would otherwise pollute the link's
                  // accessible name. The detail page shows an accessible meter.
                  <span className="w-32 shrink-0" aria-hidden="true">
                    <ProgressMeter
                      value={solved}
                      max={m.drills.length}
                      label={`${solved} / ${m.drills.length}`}
                    />
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
