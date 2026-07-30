import Link from "next/link";

interface FeatureCardProps {
  title: string;
  description: string;
  /** Small count/label shown top-right, e.g. "14 modules". */
  meta: string;
  href: string;
  /** Call-to-action label; a → is appended. */
  cta: string;
}

/**
 * A linked feature tile for the landing page. Presentational — reused for the
 * journey, problems, paths, and cheatsheet entry points. `flex-1` on the body
 * pins the CTA to the bottom so cards in a grid row share a baseline.
 */
export function FeatureCard({
  title,
  description,
  meta,
  href,
  cta,
}: FeatureCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-lg border border-neutral-200 p-5 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900/50"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-semibold">{title}</h3>
        <span className="shrink-0 text-xs font-medium text-neutral-400">
          {meta}
        </span>
      </div>
      <p className="mt-1 flex-1 text-sm text-neutral-500">{description}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
        {cta}
        <span
          aria-hidden
          className="transition-transform group-hover:translate-x-0.5"
        >
          →
        </span>
      </span>
    </Link>
  );
}
