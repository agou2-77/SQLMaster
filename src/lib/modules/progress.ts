import type { ProgressRow, ModuleProgressRow } from "@/lib/db/dexie";
import type { Module, ModuleState } from "@/lib/modules/types";
import type { ModuleCluster } from "@/data/clusters";

/**
 * Derive a module's display state from stored progress. Mastery (a passed gate
 * quiz) wins; otherwise a module is "practicing" once any of its drills has been
 * attempted, else "not-started". Purely computed — never persisted.
 */
export function deriveModuleState(
  module: Module,
  progress: Map<string, ProgressRow> | undefined,
  moduleProgress: Map<string, ModuleProgressRow> | undefined,
): ModuleState {
  if (moduleProgress?.get(module.id)?.mastered) return "mastered";
  if (progress && module.drills.some((d) => progress.has(d.id))) {
    return "practicing";
  }
  return "not-started";
}

/** How many of a module's drills are solved. */
export function drillsSolved(
  module: Module,
  progress: Map<string, ProgressRow> | undefined,
): number {
  if (!progress) return 0;
  return module.drills.filter((d) => progress.get(d.id)?.status === "solved")
    .length;
}

/** Whether a single module has been mastered (a passed gate quiz). */
export function isModuleMastered(
  moduleId: string,
  moduleProgress: Map<string, ModuleProgressRow> | undefined,
): boolean {
  return moduleProgress?.get(moduleId)?.mastered ?? false;
}

/** How many of the given modules are mastered. */
export function masteredModuleCount(
  modules: Module[],
  moduleProgress: Map<string, ModuleProgressRow> | undefined,
): number {
  if (!moduleProgress) return 0;
  return modules.filter((m) => moduleProgress.get(m.id)?.mastered).length;
}

/**
 * Ids of clusters whose every member module is mastered. A cluster with no
 * members is never "mastered" (guards against an empty cluster reading as done).
 */
export function masteredClusterIds(
  clusters: ModuleCluster[],
  moduleProgress: Map<string, ModuleProgressRow> | undefined,
): Set<string> {
  const done = new Set<string>();
  if (!moduleProgress) return done;
  for (const cluster of clusters) {
    if (
      cluster.moduleIds.length > 0 &&
      cluster.moduleIds.every((id) => moduleProgress.get(id)?.mastered)
    ) {
      done.add(cluster.id);
    }
  }
  return done;
}
