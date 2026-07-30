// Static "why it's different" grid for the landing page. No state or hooks.

const POINTS = [
  {
    icon: "🐘",
    title: "Real Postgres, zero setup",
    body: "A genuine PostgreSQL engine runs entirely in your browser via WebAssembly (PGlite) — no install, no backend, no account.",
  },
  {
    icon: "✅",
    title: "Deterministic grading",
    body: "Your result is compared against the reference answer the same way every time — order-insensitive unless the problem says otherwise.",
  },
  {
    icon: "🎓",
    title: "A tutor that coaches",
    body: "The built-in AI tutor explains errors and nudges you toward the answer instead of just handing over the solution.",
  },
  {
    icon: "💾",
    title: "Local-first & offline",
    body: "Your progress is saved on your machine (IndexedDB). Everything but the AI tutor works fully offline.",
  },
];

export function WhyDifferent() {
  return (
    <section className="mt-16">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
        Why it&apos;s different
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {POINTS.map((p) => (
          <div
            key={p.title}
            className="rounded-lg border border-neutral-200 p-5 dark:border-neutral-800"
          >
            <div className="flex items-center gap-2">
              <span aria-hidden className="text-lg">
                {p.icon}
              </span>
              <h3 className="font-semibold">{p.title}</h3>
            </div>
            <p className="mt-1 text-sm text-neutral-500">{p.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
