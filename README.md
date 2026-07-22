# SQL Master — practice SQL like LeetCode

A browser-based SQL learning platform. Pick a problem, write PostgreSQL, run it
against a **real Postgres running in your browser** (PGlite/WASM), and get instant
pass/fail feedback plus an AI tutor that coaches you toward the answer.

- **No backend database.** Every query runs client-side via [PGlite](https://pglite.dev).
- **Deterministic checking.** Your result is compared against the reference
  solution's output (order-insensitive by default, per-problem overrides).
- **AI tutor (Claude).** Streamed hints, error explanations, and query reviews via a
  server-side proxy that keeps your API key private.
- **Local progress.** Solved/attempted status and any problems you author are saved
  in your browser (IndexedDB) — no login.

## Getting started

```bash
npm install
npm run dev
# open http://localhost:3000
```

### Enable the AI tutor (optional)

The problems work fully without it. To turn on the tutor, add your Anthropic key:

```bash
cp .env.local.example .env.local
# edit .env.local and set ANTHROPIC_API_KEY=sk-ant-...
```

Then restart `npm run dev`. Without a key, the tutor panel shows a friendly
"not configured" message and everything else keeps working.

## How it works

| Piece | Where |
|---|---|
| In-browser Postgres, one per problem, seeded + rolled back per run | `src/lib/pglite/usePglite.ts` |
| Result comparison (normalization, multiset/ordered) | `src/lib/validation/compareResults.ts` |
| Problem definitions | `src/data/problems/*.ts`, registered in `src/lib/problems/seed.ts` |
| Workspace (editor, run, validate, tutor) | `src/app/problems/[id]/page.tsx` |
| AI tutor proxy (server-only, streaming) | `src/app/api/tutor/route.ts` |
| Progress + custom problems | `src/lib/db/dexie.ts` |

## Scripts

```bash
npm run dev              # start the dev server
npm run build            # production build
npm run check            # comparator unit tests + problem self-check
npm run check:problems   # verify every problem's reference solution passes its own comparator
npm run check:compare    # comparator edge-case assertions
```

Every seed problem is validated by `npm run check:problems`, which seeds each
problem's database, runs its reference solution, and asserts it passes the same
comparator the app uses. Add a new problem by creating a file in
`src/data/problems/` and importing it in `src/lib/problems/seed.ts` — or author one
in-app at `/problems/new`.
