import type { Difficulty } from "@/lib/problems/types";

const STYLES: Record<Difficulty, string> = {
  easy: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  hard: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${STYLES[difficulty]}`}
    >
      {difficulty}
    </span>
  );
}
