"use client";

import { Suspense, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getProblemById, mergeProblems } from "@/lib/problems/registry";
import { getModuleById } from "@/data/modules";
import { PATHS } from "@/data/paths";
import { usePglite } from "@/lib/pglite/usePglite";
import { recordAttempt } from "@/lib/db/dexie";
import { useProblemProgress, useCustomProblems } from "@/lib/db/hooks";
import { compareResults, type CompareResult } from "@/lib/validation/compareResults";
import type { RunResult, Problem } from "@/lib/problems/types";
import { SqlEditor } from "@/components/editor/SqlEditor";
import { RunBar } from "@/components/workspace/RunBar";
import { ResultsGrid } from "@/components/workspace/ResultsGrid";
import { ValidationBanner } from "@/components/workspace/ValidationBanner";
import { SchemaViewer } from "@/components/workspace/SchemaViewer";
import { TutorPanel } from "@/components/workspace/TutorPanel";
import { DifficultyBadge } from "@/components/problems/DifficultyBadge";

type BackTarget = { href: string; label: string };

// Where the "back" link returns to, keyed by the `?from=` param the entry page
// attaches. Falls back to the full problem list. Add entries here as new pages
// start linking into the workspace.
const BACK_TARGETS: Record<string, BackTarget> = {
  paths: { href: "/paths", label: "← Learning path" },
  problems: { href: "/problems", label: "← All problems" },
};
const DEFAULT_BACK = BACK_TARGETS.problems;

// Resolve the back-link. The journey opens drills with `from=journey&m=<id>`,
// so it needs a dynamic target back to the specific module.
function resolveBack(from: string | null, moduleId: string | null): BackTarget {
  if (from === "journey") {
    return moduleId
      ? { href: `/journey/${moduleId}`, label: "← Back to module" }
      : { href: "/journey", label: "← Journey" };
  }
  return (from && BACK_TARGETS[from]) || DEFAULT_BACK;
}

type NextTarget = { href: string; label: string };

// Resolve the "next" link from the same navigation context as the back link.
// The sequence depends on where the learner came from:
//   journey → the next drill in the module, then the mastery quiz
//   paths   → the next problem in the path (needs the path id via `&p=`)
//   problems / default → the next problem in the merged library order
// Always returns a target so the Next button is never a dead end; at the end of
// a sequence it points back to the relevant list.
function resolveNext(
  from: string | null,
  moduleId: string | null,
  pathId: string | null,
  currentId: string,
  library: Problem[],
): NextTarget {
  if (from === "journey" && moduleId) {
    const mod = getModuleById(moduleId);
    const i = mod?.drills.findIndex((d) => d.id === currentId) ?? -1;
    if (mod && i >= 0 && i < mod.drills.length - 1) {
      const drill = mod.drills[i + 1];
      return {
        href: `/problems/${drill.id}?from=journey&m=${moduleId}`,
        label: "Next drill →",
      };
    }
    // Past the last drill → prove mastery, if the module has a quiz.
    if (mod && mod.quiz.length > 0) {
      return { href: `/journey/${moduleId}/quiz`, label: "Take the mastery quiz →" };
    }
    return { href: `/journey/${moduleId}`, label: "Module overview →" };
  }

  if (from === "paths" && pathId) {
    const path = PATHS.find((p) => p.id === pathId);
    const i = path?.problemIds.indexOf(currentId) ?? -1;
    if (path && i >= 0 && i < path.problemIds.length - 1) {
      return {
        href: `/problems/${path.problemIds[i + 1]}?from=paths&p=${pathId}`,
        label: "Next in path →",
      };
    }
    return { href: "/paths", label: "All learning paths →" };
  }

  // problems context / default: the next problem in the merged library order.
  const i = library.findIndex((p) => p.id === currentId);
  if (i >= 0 && i < library.length - 1) {
    return {
      href: `/problems/${library[i + 1].id}?from=problems`,
      label: "Next problem →",
    };
  }
  return { href: "/problems", label: "All problems →" };
}

export default function ProblemWorkspacePage() {
  // useSearchParams() requires a Suspense boundary in the App Router.
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-3xl px-6 py-10 text-neutral-500">Loading…</main>
      }
    >
      <ProblemWorkspace />
    </Suspense>
  );
}

function ProblemWorkspace() {
  const { id } = useParams<{ id: string }>();
  const search = useSearchParams();
  const from = search.get("from");
  const moduleId = search.get("m");
  const pathId = search.get("p");
  const back = resolveBack(from, moduleId);
  const custom = useCustomProblems();
  const { loading: progressLoading, row: progress } = useProblemProgress(id);
  const problem = useMemo(() => getProblemById(id, custom ?? []), [id, custom]);
  const next = useMemo(
    () => resolveNext(from, moduleId, pathId, id, mergeProblems(custom ?? [])),
    [from, moduleId, pathId, id, custom],
  );

  if (!problem) {
    // Custom problems load asynchronously from IndexedDB; wait before 404-ing.
    const message = custom === undefined ? "Loading…" : "Problem not found.";
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <Link href={back.href} className="text-sm text-emerald-600 hover:underline">
          {back.label}
        </Link>
        <p className="mt-6">{message}</p>
      </main>
    );
  }

  // Wait for stored progress so the editor can initialise from the last query.
  if (progressLoading) {
    return <main className="mx-auto max-w-3xl px-6 py-10 text-neutral-500">Loading…</main>;
  }

  return (
    <Workspace
      key={problem.id}
      problem={problem}
      initialSql={progress?.lastSql ?? ""}
      back={back}
      next={next}
    />
  );
}

function Workspace({
  problem,
  initialSql,
  back,
  next,
}: {
  problem: NonNullable<ReturnType<typeof getProblemById>>;
  initialSql: string;
  back: BackTarget;
  next: NextTarget;
}) {
  const { ready, bootError, schema, runUser, runReference } = usePglite(problem);
  const { row: progress } = useProblemProgress(problem.id);
  const [sql, setSql] = useState(initialSql);
  const [result, setResult] = useState<RunResult | null>(null);
  const [comparison, setComparison] = useState<CompareResult | null>(null);
  const [running, setRunning] = useState(false);
  const [solutionShown, setSolutionShown] = useState(false);
  const [hintsShown, setHintsShown] = useState(0);

  const handleRun = useCallback(async () => {
    if (!ready || running) return;
    setRunning(true);
    try {
      const userResult = await runUser(sql);
      setResult(userResult);
      const expected = await runReference();
      const cmp = compareResults(expected, userResult, {
        ordered: problem.ordered,
        enforceColumnNames: problem.enforceColumnNames,
      });
      setComparison(cmp);
      void recordAttempt(problem.id, sql, cmp.pass);
    } finally {
      setRunning(false);
    }
  }, [
    ready,
    running,
    runUser,
    runReference,
    sql,
    problem.id,
    problem.ordered,
    problem.enforceColumnNames,
  ]);

  const handleClear = useCallback(() => {
    setSql("");
    setResult(null);
    setComparison(null);
  }, []);

  // Compact schema DDL and a run summary to give the AI tutor context.
  const schemaText = useMemo(
    () =>
      schema
        .map((t) => `${t.name}(${t.columns.map((c) => `${c.name} ${c.type}`).join(", ")})`)
        .join("\n"),
    [schema],
  );
  const resultSummary = useMemo(() => {
    if (result?.error) return `Database error: ${result.error}`;
    if (comparison)
      return `Returned ${comparison.actualRowCount} row(s). ${
        comparison.pass ? "This PASSED the check." : `Did not match: ${comparison.reason}`
      }`;
    return undefined;
  }, [result, comparison]);

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-8 lg:grid-cols-2">
      {/* Left: prompt, schema, hints */}
      <section className="space-y-5">
        <div>
          <Link href={back.href} className="text-sm text-emerald-600 hover:underline">
            {back.label}
          </Link>
          <div className="mt-2 flex items-center gap-3">
            <h1 className="text-xl font-bold">{problem.title}</h1>
            <DifficultyBadge difficulty={problem.difficulty} />
            {progress?.status === "solved" && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800 dark:bg-green-950 dark:text-green-300">
                Solved ✓
              </span>
            )}
            {problem.isCustom && (
              <span className="rounded bg-purple-100 px-1.5 py-0.5 text-xs text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                custom
              </span>
            )}
          </div>
          <div className="mt-1 flex gap-1">
            {problem.topics.map((t) => (
              <span
                key={t}
                className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="markdown space-y-3 text-sm leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{problem.description}</ReactMarkdown>
        </div>

        <div>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Schema
          </h2>
          <SchemaViewer schema={schema} />
        </div>

        {problem.hints.length > 0 && (
          <div>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Hints
            </h2>
            <ol className="list-decimal space-y-2 pl-5 text-sm">
              {problem.hints.slice(0, hintsShown).map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ol>
            {hintsShown < problem.hints.length && (
              <button
                type="button"
                onClick={() => setHintsShown((n) => n + 1)}
                className="mt-2 text-sm text-emerald-600 hover:underline"
              >
                {hintsShown === 0 ? "Show a hint" : "Show next hint"}
              </button>
            )}
          </div>
        )}

        <TutorPanel
          problemTitle={problem.title}
          problemDescription={problem.description}
          schemaText={schemaText}
          userSql={sql}
          resultSummary={resultSummary}
        />
      </section>

      {/* Right: editor, run, results */}
      <section className="space-y-4">
        {bootError && (
          <p className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
            Failed to start the database: {bootError}
          </p>
        )}

        <div className="overflow-hidden rounded-lg border border-neutral-300 dark:border-neutral-700">
          <SqlEditor
            value={sql}
            onChange={setSql}
            onRun={handleRun}
            schema={schema}
            disabled={!ready}
          />
        </div>

        <RunBar
          onRun={handleRun}
          onClear={handleClear}
          onToggleSolution={() => setSolutionShown((s) => !s)}
          running={running}
          ready={ready}
          solutionShown={solutionShown}
          next={next}
        />

        {solutionShown && (
          <pre className="overflow-auto rounded-md border border-neutral-300 bg-neutral-50 p-3 font-mono text-sm dark:border-neutral-700 dark:bg-neutral-900">
            {problem.solutionSql}
          </pre>
        )}

        <ValidationBanner result={comparison} />

        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800">
          <ResultsGrid result={result} />
        </div>
      </section>
    </main>
  );
}
