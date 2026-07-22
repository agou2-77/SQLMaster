// Core domain types shared across the app.

export type Difficulty = "easy" | "medium" | "hard";

export const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

// Topic tags. Order here is the order shown in filter UIs.
export const TOPICS = [
  "filtering",
  "ordering",
  "aggregation",
  "grouping",
  "joins",
  "subqueries",
  "set-ops",
  "string-fns",
  "date-time",
  "window-functions",
  "ctes",
] as const;

export type Topic = (typeof TOPICS)[number];

export interface Problem {
  /** Stable slug, e.g. "avg-price-by-category". */
  id: string;
  title: string;
  difficulty: Difficulty;
  topics: Topic[];
  /** Markdown prompt shown to the learner. */
  description: string;
  /** DDL + seed INSERTs. Runs once per fresh DB. */
  setupSql: string;
  /** Canonical reference query. Expected output is derived by running this. */
  solutionSql: string;
  /** Progressive, human-authored fallback hints. */
  hints: string[];
  /** true → row order is significant (prompt requires sorting). */
  ordered?: boolean;
  /** true → output column names/aliases must match the reference. */
  enforceColumnNames?: boolean;
  /** Set at load time for locally-authored problems. */
  isCustom?: boolean;
}

/** The result of running one SQL statement against a seeded DB. */
export interface RunResult {
  columns: string[];
  /** Positional rows (rowMode: "array") — avoids duplicate column-name collisions. */
  rows: unknown[][];
  /** Present when the query threw (syntax error, etc.). */
  error?: string;
}
