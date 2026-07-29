import Dexie, { type Table } from "dexie";
import type { Problem } from "@/lib/problems/types";

export type ProblemStatus = "attempted" | "solved";

export interface ProgressRow {
  problemId: string;
  status: ProblemStatus;
  attempts: number;
  lastSql?: string;
  solvedAt?: number;
  updatedAt: number;
}

export interface CustomProblemRow {
  id: string;
  problem: Problem;
  createdAt: number;
}

/**
 * Per-module mastery, set by the gate quiz. `mastered` is sticky (mirrors the
 * `solved` semantics on `ProgressRow`): once true it stays true, even if a later
 * quiz attempt scores lower.
 */
export interface ModuleProgressRow {
  moduleId: string;
  /** Best correct-count ever achieved on this module's quiz. */
  bestQuizScore: number;
  /** Number of questions in the quiz when last taken. */
  quizTotal: number;
  quizAttempts: number;
  mastered: boolean;
  masteredAt?: number;
  updatedAt: number;
}

class AppDB extends Dexie {
  progress!: Table<ProgressRow, string>;
  customProblems!: Table<CustomProblemRow, string>;
  moduleProgress!: Table<ModuleProgressRow, string>;

  constructor() {
    super("sql-agent");
    this.version(1).stores({
      progress: "problemId, status",
      customProblems: "id, createdAt",
    });
    // v2 is additive: v1 tables carry forward untouched, so existing progress
    // is preserved. Only the new moduleProgress table is declared here. Keyed by
    // moduleId only — `mastered` is a boolean (not a valid IndexedDB key type),
    // and every read is a .get(moduleId) or .toArray(), so no secondary index is
    // needed.
    this.version(2).stores({
      moduleProgress: "moduleId",
    });
  }
}

export const db = new AppDB();

/**
 * Record a run against a problem. Bumps the attempt count, stores the last SQL,
 * and marks the problem solved once it passes (staying solved thereafter).
 */
export async function recordAttempt(
  problemId: string,
  sql: string,
  passed: boolean,
): Promise<void> {
  const existing = await db.progress.get(problemId);
  const alreadySolved = existing?.status === "solved";
  await db.progress.put({
    problemId,
    status: passed || alreadySolved ? "solved" : "attempted",
    attempts: (existing?.attempts ?? 0) + 1,
    lastSql: sql,
    solvedAt: passed ? existing?.solvedAt ?? Date.now() : existing?.solvedAt,
    updatedAt: Date.now(),
  });
}

export async function addCustomProblem(problem: Problem): Promise<void> {
  await db.customProblems.put({
    id: problem.id,
    problem: { ...problem, isCustom: true },
    createdAt: Date.now(),
  });
}

export async function deleteCustomProblem(id: string): Promise<void> {
  await db.customProblems.delete(id);
}

/**
 * Record a completed gate-quiz attempt for a module. Keeps the best score,
 * bumps the attempt count, and masters the module once `score` meets
 * `passThreshold` (staying mastered thereafter).
 */
export async function recordQuizResult(
  moduleId: string,
  score: number,
  total: number,
  passThreshold: number,
): Promise<void> {
  const existing = await db.moduleProgress.get(moduleId);
  const nowMastered = (existing?.mastered ?? false) || score >= passThreshold;
  await db.moduleProgress.put({
    moduleId,
    bestQuizScore: Math.max(existing?.bestQuizScore ?? 0, score),
    quizTotal: total,
    quizAttempts: (existing?.quizAttempts ?? 0) + 1,
    mastered: nowMastered,
    masteredAt: nowMastered ? existing?.masteredAt ?? Date.now() : undefined,
    updatedAt: Date.now(),
  });
}
