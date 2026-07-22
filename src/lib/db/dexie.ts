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

class AppDB extends Dexie {
  progress!: Table<ProgressRow, string>;
  customProblems!: Table<CustomProblemRow, string>;

  constructor() {
    super("sql-agent");
    this.version(1).stores({
      progress: "problemId, status",
      customProblems: "id, createdAt",
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
