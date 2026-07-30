// Static three-step explainer for the landing page. No state or hooks — renders
// fine inside the client tree.

const STEPS = [
  {
    n: 1,
    title: "Pick a problem or module",
    body: "Start the guided journey, browse the problem library, or follow a learning path — nothing is locked.",
  },
  {
    n: 2,
    title: "Write SQL and run it",
    body: "Your query runs against a real PostgreSQL database in your browser. No install, no server, no account.",
  },
  {
    n: 3,
    title: "Get instant feedback",
    body: "See your result graded against the expected answer — and ask the built-in AI tutor when you get stuck.",
  },
];

export function HowItWorks() {
  return (
    <section className="mt-16">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
        How it works
      </h2>
      <ol className="mt-4 grid gap-6 sm:grid-cols-3">
        {STEPS.map((s) => (
          <li key={s.n} className="flex flex-col">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
              {s.n}
            </span>
            <h3 className="mt-3 font-semibold">{s.title}</h3>
            <p className="mt-1 text-sm text-neutral-500">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
