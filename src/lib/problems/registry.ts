import type { Problem } from "./types";
import { SEED_PROBLEMS } from "./seed";
import { MODULE_PROBLEMS } from "@/data/modules";

/**
 * Merge the static seed problems with any locally-authored custom problems.
 * Custom problems win on slug collision and are tagged `isCustom`.
 *
 * Note: journey drill/quiz problems are intentionally NOT merged here — they
 * must never appear in the `/problems` list or its solved counts. They are only
 * resolvable by id via `getProblemById` so the shared workspace can open them.
 */
export function mergeProblems(custom: Problem[] = []): Problem[] {
  const byId = new Map<string, Problem>();
  for (const p of SEED_PROBLEMS) byId.set(p.id, p);
  for (const p of custom) byId.set(p.id, { ...p, isCustom: true });
  return [...byId.values()];
}

export function getProblemById(
  id: string,
  custom: Problem[] = [],
): Problem | undefined {
  return (
    mergeProblems(custom).find((p) => p.id === id) ??
    MODULE_PROBLEMS.find((p) => p.id === id)
  );
}

export { SEED_PROBLEMS };
