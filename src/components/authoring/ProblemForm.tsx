"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { TOPICS, type Difficulty, type Problem, type Topic } from "@/lib/problems/types";
import { addCustomProblem } from "@/lib/db/dexie";
import { runSolutionPreview } from "@/lib/problems/validateInBrowser";
import { streamTutor } from "@/lib/tutor/client";
import type { RunResult } from "@/lib/problems/types";
import { ResultsGrid } from "@/components/workspace/ResultsGrid";

const formSchema = z.object({
  id: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a kebab-case slug (lowercase letters, numbers, hyphens)."),
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
  setupSql: z.string().min(1, "Setup SQL is required."),
  solutionSql: z.string().min(1, "Solution SQL is required."),
});

const textareaClass =
  "w-full rounded-md border border-neutral-300 bg-transparent p-2 font-mono text-sm dark:border-neutral-700";
const inputClass =
  "w-full rounded-md border border-neutral-300 bg-transparent p-2 text-sm dark:border-neutral-700";

export function ProblemForm() {
  const router = useRouter();
  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [description, setDescription] = useState("");
  const [setupSql, setSetupSql] = useState("");
  const [solutionSql, setSolutionSql] = useState("");
  const [hintsText, setHintsText] = useState("");
  const [ordered, setOrdered] = useState(false);
  const [enforceColumnNames, setEnforceColumnNames] = useState(false);

  const [preview, setPreview] = useState<RunResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  // AI generation
  const [aiTopic, setAiTopic] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const aiAbortRef = useRef<AbortController | null>(null);

  const toggleTopic = (t: Topic) =>
    setTopics((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const assemble = useCallback((): Problem => {
    return {
      id: id.trim(),
      title: title.trim(),
      difficulty,
      topics,
      description,
      setupSql,
      solutionSql,
      hints: hintsText
        .split("\n")
        .map((h) => h.trim())
        .filter(Boolean),
      ordered,
      enforceColumnNames,
      isCustom: true,
    };
  }, [
    id,
    title,
    difficulty,
    topics,
    description,
    setupSql,
    solutionSql,
    hintsText,
    ordered,
    enforceColumnNames,
  ]);

  const validate = useCallback(async (): Promise<boolean> => {
    const problems: string[] = [];
    const parsed = formSchema.safeParse({ id, title, description, setupSql, solutionSql });
    if (!parsed.success) problems.push(...parsed.error.issues.map((i) => i.message));
    if (topics.length === 0) problems.push("Pick at least one topic.");

    let ok = false;
    if (problems.length === 0) {
      const result = await runSolutionPreview(setupSql, solutionSql);
      setPreview(result);
      if (result.error) problems.push(result.error);
      else ok = true;
    } else {
      setPreview(null);
    }
    setErrors(problems);
    return ok;
  }, [id, title, description, setupSql, solutionSql, topics]);

  const handleValidate = useCallback(async () => {
    setBusy(true);
    try {
      await validate();
    } finally {
      setBusy(false);
    }
  }, [validate]);

  const handleSave = useCallback(async () => {
    setBusy(true);
    try {
      if (await validate()) {
        await addCustomProblem(assemble());
        router.push(`/problems/${id.trim()}`);
      }
    } finally {
      setBusy(false);
    }
  }, [validate, assemble, router, id]);

  const handleGenerate = useCallback(async () => {
    aiAbortRef.current?.abort();
    const controller = new AbortController();
    aiAbortRef.current = controller;
    setAiBusy(true);
    setAiError(null);
    let json = "";
    try {
      await streamTutor(
        {
          mode: "generate-problem",
          problemTitle: "",
          problemDescription: "",
          schema: "",
          userSql: "",
          topic: aiTopic || undefined,
        },
        (delta) => (json += delta),
        controller.signal,
      );
      const data = JSON.parse(json) as Partial<Problem>;
      if (data.id) setId(String(data.id));
      if (data.title) setTitle(String(data.title));
      if (data.difficulty) setDifficulty(data.difficulty);
      if (Array.isArray(data.topics)) {
        setTopics(data.topics.filter((t): t is Topic => (TOPICS as readonly string[]).includes(t)));
      }
      if (data.description) setDescription(String(data.description));
      if (data.setupSql) setSetupSql(String(data.setupSql));
      if (data.solutionSql) setSolutionSql(String(data.solutionSql));
      if (Array.isArray(data.hints)) setHintsText(data.hints.join("\n"));
      if (typeof data.ordered === "boolean") setOrdered(data.ordered);
    } catch (e) {
      if ((e as Error).name === "SyntaxError") {
        setAiError("The AI response wasn't valid JSON. Try again.");
      } else if ((e as Error).name !== "AbortError") {
        setAiError((e as Error).message);
      }
    } finally {
      setAiBusy(false);
    }
  }, [aiTopic]);

  return (
    <div className="space-y-5">
      {/* AI generation */}
      <div className="rounded-lg border border-dashed border-neutral-300 p-4 dark:border-neutral-700">
        <h2 className="text-sm font-semibold">Generate with AI (optional)</h2>
        <p className="mt-0.5 text-xs text-neutral-500">
          Describe a topic and let Claude draft a problem you can edit.
        </p>
        <div className="mt-2 flex gap-2">
          <input
            className={inputClass}
            placeholder="e.g. self-joins on an employees/manager table"
            value={aiTopic}
            onChange={(e) => setAiTopic(e.target.value)}
          />
          <button
            type="button"
            onClick={handleGenerate}
            disabled={aiBusy}
            className="shrink-0 rounded-md border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            {aiBusy ? "Generating…" : "Generate"}
          </button>
        </div>
        {aiError && <p className="mt-2 text-sm text-red-600">{aiError}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">Slug (id)</span>
          <input className={inputClass} value={id} onChange={(e) => setId(e.target.value)} placeholder="my-problem" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Title</span>
          <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="block">
          <span className="text-sm font-medium">Difficulty</span>
          <select
            className={`${inputClass} mt-0`}
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={ordered} onChange={(e) => setOrdered(e.target.checked)} />
          Row order matters
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={enforceColumnNames}
            onChange={(e) => setEnforceColumnNames(e.target.checked)}
          />
          Enforce column names
        </label>
      </div>

      <div>
        <span className="text-sm font-medium">Topics</span>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {TOPICS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => toggleTopic(t)}
              className={`rounded-full px-2.5 py-1 text-xs ${
                topics.includes(t)
                  ? "bg-emerald-600 text-white"
                  : "border border-neutral-300 dark:border-neutral-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="text-sm font-medium">Description (markdown)</span>
        <textarea
          className={`${textareaClass} min-h-24`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium">Setup SQL (CREATE TABLE + INSERTs)</span>
        <textarea
          className={`${textareaClass} min-h-32`}
          value={setupSql}
          onChange={(e) => setSetupSql(e.target.value)}
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium">Solution SQL (reference query)</span>
        <textarea
          className={`${textareaClass} min-h-24`}
          value={solutionSql}
          onChange={(e) => setSolutionSql(e.target.value)}
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium">Hints (one per line)</span>
        <textarea
          className={`${textareaClass} min-h-20`}
          value={hintsText}
          onChange={(e) => setHintsText(e.target.value)}
        />
      </label>

      {errors.length > 0 && (
        <ul className="list-disc rounded-md border border-red-300 bg-red-50 p-3 pl-8 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {errors.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      )}

      {preview && !preview.error && (
        <div>
          <p className="mb-1 text-sm font-medium text-green-700 dark:text-green-400">
            ✓ Solution runs. Expected output preview:
          </p>
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800">
            <ResultsGrid result={preview} />
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={busy}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {busy ? "Working…" : "Validate & save"}
        </button>
        <button
          type="button"
          onClick={handleValidate}
          disabled={busy}
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          Validate only
        </button>
      </div>
    </div>
  );
}
