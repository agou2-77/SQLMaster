"use client";

interface RunBarProps {
  onRun: () => void;
  onClear: () => void;
  onToggleSolution: () => void;
  running: boolean;
  ready: boolean;
  solutionShown: boolean;
}

export function RunBar({
  onRun,
  onClear,
  onToggleSolution,
  running,
  ready,
  solutionShown,
}: RunBarProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onRun}
        disabled={!ready || running}
        className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {running ? "Running…" : "Run ▸"}
      </button>
      <span className="text-xs text-neutral-500">⌘/Ctrl+Enter</span>
      <div className="flex-1" />
      <button
        type="button"
        onClick={onClear}
        className="rounded-md border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
      >
        Clear
      </button>
      <button
        type="button"
        onClick={onToggleSolution}
        className="rounded-md border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
      >
        {solutionShown ? "Hide solution" : "Show solution"}
      </button>
    </div>
  );
}
