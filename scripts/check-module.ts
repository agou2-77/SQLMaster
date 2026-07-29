/**
 * Per-module self-check: validate ONE journey module file in isolation, before
 * it is wired into src/data/modules.ts. For every drill and quiz Problem the
 * file exports, seed a fresh Postgres, run the reference solution, and assert it
 * (a) runs without error, (b) returns at least one column, and (c) passes its
 * own comparator (reflexivity). This mirrors scripts/self-check.ts exactly, so a
 * module that is green here is green in `npm run check`.
 *
 * Run with: npx tsx scripts/check-module.ts src/data/modules/<id>.ts
 */
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { compareResults } from "@/lib/validation/compareResults";
import type { Problem, RunResult } from "@/lib/problems/types";

async function runIsolated(db: PGlite, sql: string): Promise<RunResult> {
  await db.exec("BEGIN");
  try {
    const res = await db.query(sql, [], { rowMode: "array" });
    return {
      columns: res.fields.map((f) => f.name),
      rows: res.rows as unknown[][],
    };
  } catch (e) {
    return { columns: [], rows: [], error: (e as Error).message };
  } finally {
    await db.exec("ROLLBACK");
  }
}

function isProblem(v: unknown): v is Problem {
  if (!v || typeof v !== "object") return false;
  const p = v as Record<string, unknown>;
  return (
    typeof p.id === "string" &&
    typeof p.setupSql === "string" &&
    typeof p.solutionSql === "string"
  );
}

/** Collect every drill/quiz Problem from whatever the module file exports. */
function collectProblems(mod: Record<string, unknown>): Problem[] {
  const problems: Problem[] = [];
  for (const value of Object.values(mod)) {
    if (!value || typeof value !== "object") continue;
    const maybeModule = value as { drills?: unknown; quiz?: unknown };
    for (const group of [maybeModule.drills, maybeModule.quiz]) {
      if (Array.isArray(group)) {
        for (const p of group) if (isProblem(p)) problems.push(p);
      }
    }
  }
  return problems;
}

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error("usage: tsx scripts/check-module.ts <module-file>");
    process.exit(2);
  }

  const mod = (await import(pathToFileURL(resolve(arg)).href)) as Record<
    string,
    unknown
  >;
  const problems = collectProblems(mod);
  if (problems.length === 0) {
    console.error(`No drill/quiz problems found in ${arg}.`);
    process.exit(1);
  }

  // Guard against duplicate ids within the file (they'd collide in the registry).
  const ids = new Set<string>();
  let failures = 0;
  for (const p of problems) {
    if (ids.has(p.id)) {
      console.error(`✗ ${p.id}: duplicate id within this module`);
      failures++;
    }
    ids.add(p.id);
  }

  for (const p of problems) {
    const db = await PGlite.create();
    try {
      await db.exec(p.setupSql);
    } catch (e) {
      console.error(`✗ ${p.id}: setupSql failed — ${(e as Error).message}`);
      failures++;
      await db.close();
      continue;
    }

    const expected = await runIsolated(db, p.solutionSql);
    if (expected.error) {
      console.error(`✗ ${p.id}: solutionSql errored — ${expected.error}`);
      failures++;
      await db.close();
      continue;
    }
    if (expected.columns.length === 0) {
      console.error(`✗ ${p.id}: solutionSql returned no columns`);
      failures++;
      await db.close();
      continue;
    }

    const actual = await runIsolated(db, p.solutionSql);
    const cmp = compareResults(expected, actual, {
      ordered: p.ordered,
      enforceColumnNames: p.enforceColumnNames,
    });
    if (!cmp.pass) {
      console.error(
        `✗ ${p.id}: solution failed its own comparator — ${cmp.reason}`,
      );
      failures++;
    } else {
      const rows = expected.rows.length;
      const flag = rows === 0 ? " ⚠ 0 rows" : "";
      console.log(
        `✓ ${p.id} — ${rows} row(s), cols [${expected.columns.join(", ")}]${flag}`,
      );
    }
    await db.close();
  }

  if (failures > 0) {
    console.error(`\n${failures} problem(s) failed in ${arg}.`);
    process.exit(1);
  }
  console.log(`\nAll ${problems.length} problems in ${arg} passed.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
