import type { ProblemStatus } from "@/lib/db/dexie";

export function StatusPill({ status }: { status: ProblemStatus | undefined }) {
  const label = status === "solved" ? "Solved" : status === "attempted" ? "Attempted" : "Todo";
  const cls =
    status === "solved"
      ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
      : status === "attempted"
        ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
        : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400";
  return (
    <span className={`inline-block w-20 rounded-full px-2 py-0.5 text-center text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}
