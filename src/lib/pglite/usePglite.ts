"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PGlite } from "@electric-sql/pglite";
import type { Problem, RunResult } from "@/lib/problems/types";

export interface SchemaColumn {
  name: string;
  type: string;
}
export interface SchemaTable {
  name: string;
  columns: SchemaColumn[];
}

export interface UsePglite {
  ready: boolean;
  bootError: string | null;
  schema: SchemaTable[];
  /** Run arbitrary user SQL, isolated in a rolled-back transaction. */
  runUser: (sql: string) => Promise<RunResult>;
  /** Run the problem's reference solution to derive expected output. */
  runReference: () => Promise<RunResult>;
}

/**
 * Instantiates a fresh in-browser Postgres per problem, seeded once, and runs
 * every query inside BEGIN…ROLLBACK so the seed is never mutated (free reset).
 * PGlite is WASM and must only ever be imported/instantiated client-side.
 */
export function usePglite(problem: Problem): UsePglite {
  const dbRef = useRef<PGlite | null>(null);
  const [ready, setReady] = useState(false);
  const [bootError, setBootError] = useState<string | null>(null);
  const [schema, setSchema] = useState<SchemaTable[]>([]);

  useEffect(() => {
    // The consuming <Workspace> is keyed by problem.id, so this hook remounts
    // (with fresh initial state) whenever the problem changes — no reset needed.
    let cancelled = false;

    (async () => {
      try {
        const { PGlite } = await import("@electric-sql/pglite");
        const db = await PGlite.create();
        await db.exec(problem.setupSql);
        if (cancelled) {
          await db.close();
          return;
        }
        dbRef.current = db;
        setSchema(await introspectSchema(db));
        setReady(true);
      } catch (e) {
        if (!cancelled) setBootError((e as Error).message);
      }
    })();

    return () => {
      cancelled = true;
      const db = dbRef.current;
      dbRef.current = null;
      void db?.close();
    };
  }, [problem.id, problem.setupSql]);

  const runIsolated = useCallback(async (sql: string): Promise<RunResult> => {
    const db = dbRef.current;
    if (!db) return { columns: [], rows: [], error: "Database is still loading." };
    const trimmed = sql.trim().replace(/;\s*$/, "");
    if (!trimmed) return { columns: [], rows: [], error: "Write a query first." };

    await db.exec("BEGIN");
    try {
      const res = await db.query(trimmed, [], { rowMode: "array" });
      return {
        columns: res.fields.map((f) => f.name),
        rows: res.rows as unknown[][],
      };
    } catch (e) {
      return { columns: [], rows: [], error: (e as Error).message };
    } finally {
      try {
        await db.exec("ROLLBACK");
      } catch {
        // ignore — the transaction may already be aborted
      }
    }
  }, []);

  const runUser = useCallback((sql: string) => runIsolated(sql), [runIsolated]);
  const runReference = useCallback(
    () => runIsolated(problem.solutionSql),
    [runIsolated, problem.solutionSql],
  );

  return { ready, bootError, schema, runUser, runReference };
}

async function introspectSchema(db: PGlite): Promise<SchemaTable[]> {
  const res = await db.query<{
    table_name: string;
    column_name: string;
    data_type: string;
  }>(
    `SELECT table_name, column_name, data_type
     FROM information_schema.columns
     WHERE table_schema = 'public'
     ORDER BY table_name, ordinal_position`,
  );
  const tables = new Map<string, SchemaTable>();
  for (const row of res.rows) {
    let t = tables.get(row.table_name);
    if (!t) {
      t = { name: row.table_name, columns: [] };
      tables.set(row.table_name, t);
    }
    t.columns.push({ name: row.column_name, type: row.data_type });
  }
  return [...tables.values()];
}
