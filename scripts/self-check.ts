/**
 * Dev self-check: for every seed problem AND every journey drill/quiz question,
 * seed a fresh Postgres, run the reference solution, and assert it (a) runs
 * without error and (b) passes its own comparator. Guarantees every shipped
 * problem is internally consistent.
 *
 * Run with: npm run check:problems
 */
import { PGlite } from "@electric-sql/pglite";
import { SEED_PROBLEMS } from "@/lib/problems/registry";
import { MODULE_PROBLEMS } from "@/data/modules";
import { compareResults } from "@/lib/validation/compareResults";
import type { RunResult } from "@/lib/problems/types";

async function runIsolated(db: PGlite, sql: string): Promise<RunResult> {
  await db.exec("BEGIN");
  try {
    const res = await db.query(sql, [], { rowMode: "array" });
    return { columns: res.fields.map((f) => f.name), rows: res.rows as unknown[][] };
  } catch (e) {
    return { columns: [], rows: [], error: (e as Error).message };
  } finally {
    await db.exec("ROLLBACK");
  }
}

async function main() {
  let failures = 0;

  const allProblems = [...SEED_PROBLEMS, ...MODULE_PROBLEMS];
  for (const p of allProblems) {
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

    // Reflexivity: the solution must pass its own comparator on real data types.
    const actual = await runIsolated(db, p.solutionSql);
    const cmp = compareResults(expected, actual, {
      ordered: p.ordered,
      enforceColumnNames: p.enforceColumnNames,
    });
    if (!cmp.pass) {
      console.error(`✗ ${p.id}: solution failed its own comparator — ${cmp.reason}`);
      failures++;
    } else {
      console.log(
        `✓ ${p.id} — ${expected.rows.length} row(s), cols [${expected.columns.join(", ")}]`,
      );
    }
    await db.close();
  }

  if (failures > 0) {
    console.error(`\n${failures} problem(s) failed the self-check.`);
    process.exit(1);
  }
  console.log(
    `\nAll ${allProblems.length} problems passed the self-check ` +
      `(${SEED_PROBLEMS.length} seed + ${MODULE_PROBLEMS.length} journey drill/quiz).`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
