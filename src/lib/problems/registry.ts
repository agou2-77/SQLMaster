import type { Problem } from "./types";
import { SEED_PROBLEMS } from "./seed";

/**
 * Merge the static seed problems with any locally-authored custom problems.
 * Custom problems win on slug collision and are tagged `isCustom`.
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
  return mergeProblems(custom).find((p) => p.id === id);
}

export { SEED_PROBLEMS };
