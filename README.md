# SQL Master — practice SQL like LeetCode

<p align="left">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white">
  <img alt="React" src="https://img.shields.io/badge/React-19-20232A?logo=react&logoColor=61DAFB">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white">
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white">
  <img alt="PGlite" src="https://img.shields.io/badge/PGlite-Postgres_WASM-4169E1?logo=postgresql&logoColor=white">
  <img alt="CodeMirror" src="https://img.shields.io/badge/CodeMirror-6-D30707?logo=codemirror&logoColor=white">
  <img alt="Dexie" src="https://img.shields.io/badge/Dexie-IndexedDB-EE6E73">
  <img alt="Zod" src="https://img.shields.io/badge/Zod-4-3E67B1?logo=zod&logoColor=white">
</p>

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
  you explicitly ask. Works with any OpenAI-compatible or Anthropic model (optional;
  see below).
- 🧭 **31 problems + 7 learning paths.** Curated LeetCode-style problems grouped into
  guided paths (joins, aggregation, window functions, recursion, …), filterable by
  topic and difficulty.
- ✍️ **Author your own problems.** Build a problem in-app at `/problems/new` — define
  the schema, seed data, and reference solution; it's validated the same way built-in
  problems are.
- 📖 **SQL cheatsheet** at `/cheatsheet` for quick syntax reference.
- 💾 **Local-first progress.** Solved/attempted status and custom problems are saved
  in your browser (IndexedDB) — nothing leaves your machine.

## Quick start

```bash
npm install
npm run dev
# open http://localhost:3000
```

That's it — all 31 problems are fully playable without any configuration.

### Enable the AI tutor (optional)

The tutor is proxied server-side so your API key never reaches the browser. It works
with **any OpenAI-compatible chat API** or with **Anthropic** — pick whichever you
have a key for. Copy the example env file and fill in four variables:

```bash
cp .env.local.example .env.local
```

**Option A — OpenAI-compatible** (OpenAI, Azure OpenAI, OpenRouter, local servers,
gateways… anything exposing `/chat/completions`):

```ini
# .env.local
LLM_PROVIDER=openai
LLM_API_KEY=sk-...
LLM_BASE_URL=https://api.openai.com/v1   # your endpoint's base URL
LLM_MODEL=gpt-4o                         # model for reviews / error explanations
LLM_MODEL_LIGHT=gpt-4o-mini              # optional: cheaper model for one-off hints
```

**Option B — Anthropic** (Messages API):

```ini
# .env.local
LLM_PROVIDER=anthropic
LLM_API_KEY=sk-ant-...
LLM_BASE_URL=https://api.anthropic.com/v1
LLM_MODEL=claude-opus-4-8
LLM_MODEL_LIGHT=claude-haiku-4-5
```

The route appends the provider's standard path (`/chat/completions` for OpenAI,
`/messages` for Anthropic), so `LLM_BASE_URL` is just the API root — any
OpenAI-compatible gateway works by pointing it at that gateway's base URL. Then
restart `npm run dev`. Without a key the tutor panel simply shows a "not configured"
message and everything else keeps working.

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
