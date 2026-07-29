import type { ModuleState } from "@/lib/modules/types";

const LABELS: Record<ModuleState, string> = {
  "not-started": "Not started",
  practicing: "Practicing",
  mastered: "Mastered ✓",
};

const CLASSES: Record<ModuleState, string> = {
  "not-started":
    "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400",
  practicing:
    "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  mastered:
    "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
};

export function ModuleStateBadge({ state }: { state: ModuleState }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-center text-xs font-medium ${CLASSES[state]}`}
    >
      {LABELS[state]}
    </span>
  );
}
