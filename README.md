# SQL Master — practice SQL like LeetCode

A browser-based SQL learning platform. Pick a problem, write PostgreSQL, run it
against a **real Postgres running in your browser** (PGlite/WASM), and get instant
pass/fail feedback — plus a multi-turn AI tutor that coaches you toward the answer
instead of handing it over.

No servers to run, no database to provision, no login. Everything but the AI tutor
works fully offline.

## Highlights

- 🐘 **Real Postgres in the browser.** Every query runs client-side via
  [PGlite](https://pglite.dev) — a fresh, seeded database per problem, rolled back
  after each run.
- ✅ **Deterministic checking.** Your output is compared against the reference
  solution's (order-insensitive by default, with per-problem overrides for ordering
  and column names).
- 🎓 **Multi-turn AI tutor.** Streamed hints, error explanations, and query reviews.
  Ask follow-ups or click *Show me the answer* — it guides first, reveals only when
  you explicitly ask. Backed by IBM Consulting Advantage (optional; see below).
- 🧭 **31 problems + 7 learning paths.** Curated LeetCode-style problems grouped into
  guided paths (joins, aggregation, window functions, recursion, …), filterable by
  topic and difficulty.
- ✍️ **Author your own problems.** Build a problem in-app at `/problems/new` — define
  the schema, seed data, and reference solution; it's validated the same way built-in
  problems are.
- 📖 **SQL cheatsheet** at `/cheatsheet` for quick syntax reference.
- 💾 **Local-first progress.** Solved/attempted status and custom problems are saved
  in your browser (IndexedDB) — nothing leaves your machine.

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 ·
[PGlite](https://pglite.dev) (Postgres WASM) · CodeMirror 6 · Dexie (IndexedDB) · Zod

## Quick start

```bash
npm install
npm run dev
# open http://localhost:3000
```

That's it — all 31 problems are fully playable without any configuration.

### Enable the AI tutor (optional)

The tutor is proxied server-side through **IBM Consulting Advantage (ICA)**, whose
OpenAI-compatible API keeps your key off the client. Copy the example env file and
fill it in:

```bash
cp .env.local.example .env.local
```

```ini
# .env.local
ICA_API_KEY=your-ica-developer-key
ICA_BASE_URL=https://api.nextgen-beta.ica.ibm.com/ica/v1
ICA_MODEL=claude-opus-4-8          # model for reviews / error explanations
ICA_MODEL_LIGHT=claude-haiku-4-5   # optional: cheaper model for one-off hints
```

Get a developer key from the ICA UI (*Settings → API Keys → ICA APIs*) and find valid
model IDs via `GET /chat-models/models`. Then restart `npm run dev`. Without a key the
tutor panel simply shows a "not configured" message and everything else keeps working.

## How it works

| Piece | Where |
|---|---|
| In-browser Postgres, one per problem, seeded + rolled back per run | `src/lib/pglite/usePglite.ts` |
| Result comparison (normalization, multiset / ordered) | `src/lib/validation/compareResults.ts` |
| Problem definitions | `src/data/problems/*.ts`, registered in `src/lib/problems/seed.ts` |
| Learning paths | `src/data/paths.ts` |
| Workspace (editor, run, validate, tutor) | `src/app/problems/[id]/page.tsx` |
| AI tutor proxy (server-only, streaming, multi-turn) | `src/app/api/tutor/route.ts` |
| Tutor prompts & request schema | `src/lib/tutor/prompts.ts` |
| Progress + custom problems (IndexedDB) | `src/lib/db/dexie.ts` |

## Scripts

```bash
npm run dev              # start the dev server
npm run build            # production build
npm run start            # serve the production build
npm run lint             # eslint
npm run check            # comparator tests + problem self-check (run before pushing)
npm run check:problems   # verify every problem's reference solution passes its comparator
npm run check:compare    # comparator edge-case assertions
npm run e2e              # end-to-end smoke test
```

## Adding a problem

Two ways:

1. **In-app** — go to `/problems/new`, fill in the schema, seed rows, and reference
   solution. It's validated live in the browser and saved to IndexedDB.
2. **In code** — create a file in `src/data/problems/`, then import and register it in
   `src/lib/problems/seed.ts`.

Either way, `npm run check:problems` seeds each problem's database, runs its reference
solution, and asserts it passes the exact comparator the app uses — so a problem can't
ship with a broken expected answer.
