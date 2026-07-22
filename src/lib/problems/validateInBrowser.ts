import type { RunResult } from "./types";

/**
 * Seed a throwaway in-browser Postgres, run the reference solution, and return
 * its result (or an error). Used by the authoring form to validate a new
 * problem's SQL and preview its expected output before saving.
 */
export async function runSolutionPreview(
  setupSql: string,
  solutionSql: string,
): Promise<RunResult> {
  const { PGlite } = await import("@electric-sql/pglite");
  const db = await PGlite.create();
  try {
    try {
      await db.exec(setupSql);
    } catch (e) {
      return { columns: [], rows: [], error: `setupSql: ${(e as Error).message}` };
    }
    try {
      const res = await db.query(solutionSql.trim().replace(/;\s*$/, ""), [], {
        rowMode: "array",
      });
      return {
        columns: res.fields.map((f) => f.name),
        rows: res.rows as unknown[][],
      };
    } catch (e) {
      return { columns: [], rows: [], error: `solutionSql: ${(e as Error).message}` };
    }
  } finally {
    await db.close();
  }
}
