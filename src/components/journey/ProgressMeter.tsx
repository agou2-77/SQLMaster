interface ProgressMeterProps {
  value: number;
  max: number;
  /** Optional text shown to the right of the bar (e.g. "3 / 6 drills"). */
  label?: string;
  /** Accessible name for the bar. Defaults to the label or a generic string. */
  ariaLabel?: string;
}

/**
 * A small horizontal progress bar with an optional count label. Fully derived
 * from props (no state) and reused for drill counts and overall module mastery
 * across the journey. Emerald fill on a neutral track, matching the app palette.
 */
export function ProgressMeter({
  value,
  max,
  label,
  ariaLabel,
}: ProgressMeterProps) {
  const safeMax = Math.max(max, 0);
  const clamped = Math.min(Math.max(value, 0), safeMax);
  const pct = safeMax === 0 ? 0 : (clamped / safeMax) * 100;
  const complete = safeMax > 0 && clamped >= safeMax;

  return (
    <div className="flex items-center gap-2">
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-label={ariaLabel ?? label ?? "Progress"}
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800"
      >
        <div
          className={`h-full rounded-full transition-all ${
            complete ? "bg-green-500" : "bg-emerald-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {label && (
        <span className="shrink-0 text-xs tabular-nums text-neutral-500">
          {label}
        </span>
      )}
    </div>
  );
}
