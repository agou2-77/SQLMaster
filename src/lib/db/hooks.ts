"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db, type ProgressRow, type ModuleProgressRow } from "@/lib/db/dexie";
import type { Problem } from "@/lib/problems/types";

/**
 * Progress for one problem. Wrapped in an object so we can distinguish
 * "still loading" (undefined) from "no row exists yet" ({ row: undefined }).
 */
export function useProblemProgress(problemId: string): {
  loading: boolean;
  row: ProgressRow | undefined;
} {
  const result = useLiveQuery(
    async () => ({ row: await db.progress.get(problemId) }),
    [problemId],
  );
  return { loading: result === undefined, row: result?.row };
}

/** Map of problemId → ProgressRow. `undefined` while loading. */
export function useAllProgress(): Map<string, ProgressRow> | undefined {
  return useLiveQuery(async () => {
    const rows = await db.progress.toArray();
    return new Map(rows.map((r) => [r.problemId, r]));
  }, []);
}

/** Locally-authored custom problems. `undefined` while loading. */
export function useCustomProblems(): Problem[] | undefined {
  return useLiveQuery(async () => {
    const rows = await db.customProblems.orderBy("createdAt").toArray();
    return rows.map((r) => r.problem);
  }, []);
}

/** Quiz/mastery progress for one module. `undefined` while loading. */
export function useModuleProgress(moduleId: string): {
  loading: boolean;
  row: ModuleProgressRow | undefined;
} {
  const result = useLiveQuery(
    async () => ({ row: await db.moduleProgress.get(moduleId) }),
    [moduleId],
  );
  return { loading: result === undefined, row: result?.row };
}

/** Map of moduleId → ModuleProgressRow. `undefined` while loading. */
export function useAllModuleProgress(): Map<string, ModuleProgressRow> | undefined {
  return useLiveQuery(async () => {
    const rows = await db.moduleProgress.toArray();
    return new Map(rows.map((r) => [r.moduleId, r]));
  }, []);
}
