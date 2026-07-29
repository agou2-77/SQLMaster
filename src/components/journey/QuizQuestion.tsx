"use client";

import { useCallback, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { usePglite } from "@/lib/pglite/usePglite";
import { compareResults, type CompareResult } from "@/lib/validation/compareResults";
import type { Problem, RunResult } from "@/lib/problems/types";
import { SqlEditor } from "@/components/editor/SqlEditor";
import { ResultsGrid } from "@/components/workspace/ResultsGrid";
import { ValidationBanner } from "@/components/workspace/ValidationBanner";
import { SchemaViewer } from "@/components/workspace/SchemaViewer";

interface QuizQuestionProps {
  problem: Problem;
  index: number;
  total: number;
  /** Whether this question has already been solved in the current attempt. */
  passed: boolean;
  /** Called whenever the learner's query is graded. */
  onGraded: (pass: boolean) => void;
  onNext: () => void;
  isLast: boolean;
}

/**
 * One gate-quiz question. Reuses the exact grading pipeline (usePglite +
 * compareResults) as the main workspace, but deliberately offers no hints or
 * "show solution" — and never records a normal attempt (quiz questions must not
 * pollute the comprehensive `/problems` progress).
 */
export function QuizQuestion({
  problem,
  index,
  total,
  passed,
  onGraded,
  onNext,
  isLast,
}: QuizQuestionProps) {
  const { ready, bootError, schema, runUser, runReference } = usePglite(problem);
  const [sql, setSql] = useState("");
  const [result, setResult] = useState<RunResult | null>(null);
  const [comparison, setComparison] = useState<CompareResult | null>(null);
  const [running, setRunning] = useState(false);

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
      onGraded(cmp.pass);
    } finally {
      setRunning(false);
    }
  }, [
    ready,
    running,
    runUser,
    runReference,
    sql,
    problem.ordered,
    problem.enforceColumnNames,
    onGraded,
  ]);

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Question {index + 1} of {total}
          </span>
          {passed && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800 dark:bg-green-950 dark:text-green-300">
              Solved ✓
            </span>
          )}
        </div>
        <h2 className="mt-1 text-lg font-bold">{problem.title}</h2>
        <div className="markdown mt-2 space-y-2 text-sm leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {problem.description}
          </ReactMarkdown>
        </div>
      </div>

      <SchemaViewer schema={schema} />

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

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleRun}
          disabled={!ready || running}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {running ? "Running…" : "Run ▸"}
        </button>
        <span className="text-xs text-neutral-500">⌘/Ctrl+Enter</span>
        <div className="flex-1" />
        <button
          type="button"
          onClick={onNext}
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          {isLast ? "Finish quiz →" : "Next question →"}
        </button>
      </div>

      <ValidationBanner result={comparison} />

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800">
        <ResultsGrid result={result} />
      </div>
    </div>
  );
}
