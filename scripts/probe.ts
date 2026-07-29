/**
 * Reproduction helper for verifying journey modules: seed a module's shared
 * SCHEMA into a fresh Postgres and run an arbitrary probe query against it, so a
 * reviewer can test a hypothesis ("does removing HAVING change the result?",
 * "does this LIKE actually exclude any row?") without hand-simulating SQL.
 *
 * Run with: npx tsx scripts/probe.ts src/data/modules/<id>.ts "SELECT ..."
 */
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { PGlite } from "@electric-sql/pglite";

interface ProblemLike {
  id: string;
  setupSql: string;
  solutionSql: string;
}

function firstProblem(mod: Record<string, unknown>): ProblemLike | undefined {
  for (const value of Object.values(mod)) {
    if (!value || typeof value !== "object") continue;
    const m = value as { drills?: unknown[]; quiz?: unknown[] };
    const first = (m.drills ?? [])[0] ?? (m.quiz ?? [])[0];
    if (
      first &&
      typeof (first as ProblemLike).setupSql === "string" &&
      typeof (first as ProblemLike).solutionSql === "string"
    ) {
      return first as ProblemLike;
    }
  }
  return undefined;
}

async function main() {
  const [file, sql] = process.argv.slice(2);
  if (!file || !sql) {
    console.error('usage: tsx scripts/probe.ts <module-file> "SELECT ..."');
    process.exit(2);
  }

  const mod = (await import(pathToFileURL(resolve(file)).href)) as Record<
    string,
    unknown
  >;
  const problem = firstProblem(mod);
  if (!problem) {
    console.error(`No drill/quiz problem with a SCHEMA found in ${file}.`);
    process.exit(1);
  }

  const db = await PGlite.create();
  await db.exec(problem.setupSql);
  try {
    const res = await db.query(sql, [], { rowMode: "array" });
    console.log("columns:", res.fields.map((f) => f.name).join(", "));
    for (const row of res.rows as unknown[][]) {
      console.log(JSON.stringify(row));
    }
    console.log(`(${(res.rows as unknown[][]).length} row(s))`);
  } catch (e) {
    console.error("query error:", (e as Error).message);
    process.exit(1);
  } finally {
    await db.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
