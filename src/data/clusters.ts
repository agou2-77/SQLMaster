// Pedagogical groupings of the journey modules. A "cluster" is a set of related
// modules that together prepare a learner for one or more comprehensive tests
// (existing problems/paths). When every module in a cluster is mastered, the
// journey overview celebrates that milestone and points at what it unlocks.
//
// This is soft guidance only (like everything in the journey): nothing is
// locked, and clusters carry no persisted state — a cluster's "mastered" status
// is derived from the per-module quiz mastery already stored in Dexie.

export interface ModuleCluster {
  /** Stable slug. */
  id: string;
  title: string;
  /** Shown once every module in the cluster is mastered. */
  blurb: string;
  /** All of these modules must be mastered to complete the cluster. */
  moduleIds: string[];
  /** Comprehensive learning-path id(s) this cluster prepares the learner for. */
  pathIds?: string[];
  /** Comprehensive problem id(s) this cluster prepares the learner for. */
  problemIds?: string[];
}

// Ordered to mirror the curriculum. Every authored module belongs to exactly one
// cluster (guarded by scripts/check-clusters.ts), and each cluster holds ≥2
// modules so the milestone is genuinely a cross-module achievement.
export const CLUSTERS: ModuleCluster[] = [
  {
    id: "query-foundations",
    title: "Query foundations",
    blurb:
      "You can read, filter, sort, and handle NULLs in any table — the bedrock every other query builds on.",
    moduleIds: [
      "select-basics",
      "where-filtering",
      "null-handling",
      "order-by-limit",
    ],
    pathIds: ["sql-basics"],
  },
  {
    id: "aggregating-data",
    title: "Aggregating data",
    blurb:
      "You can summarize rows with aggregates and slice them into groups with GROUP BY / HAVING.",
    moduleIds: ["aggregation", "group-by-having"],
    problemIds: ["avg-price-by-category", "count-orders-per-customer"],
  },
  {
    id: "relating-tables",
    title: "Relating tables",
    blurb:
      "You can combine and compare multiple tables — joins, subqueries, and set operations.",
    moduleIds: ["joins", "subqueries", "set-operations"],
    pathIds: ["joins-and-grouping", "subqueries"],
  },
  {
    id: "advanced-sql",
    title: "Advanced SQL",
    blurb:
      "You've got the advanced toolkit: CASE, string and date functions, CTEs, and window functions.",
    moduleIds: [
      "case-expressions",
      "string-functions",
      "date-time",
      "ctes",
      "window-functions",
    ],
    pathIds: ["ctes-and-dates", "window-functions", "interview-prep"],
  },
];
