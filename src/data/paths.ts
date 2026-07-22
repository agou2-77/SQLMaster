export interface LearningPath {
  id: string;
  title: string;
  description: string;
  /** Ordered problem ids that make up the path. */
  problemIds: string[];
}

export const PATHS: LearningPath[] = [
  {
    id: "sql-basics",
    title: "SQL Basics",
    description: "Filtering, ordering, and your first aggregations.",
    problemIds: [
      "active-users",
      "signups-2023",
      "top-5-expensive-products",
      "count-orders-per-customer",
    ],
  },
  {
    id: "joins-and-grouping",
    title: "Joins & Grouping",
    description: "Combine tables and summarize with GROUP BY / HAVING.",
    problemIds: [
      "products-never-ordered",
      "avg-price-by-category",
      "customers-over-3-orders",
      "bought-a-not-b",
    ],
  },
  {
    id: "subqueries",
    title: "Subqueries",
    description: "Correlated subqueries and computing values from the data itself.",
    problemIds: ["employees-above-dept-avg", "second-highest-salary"],
  },
  {
    id: "window-functions",
    title: "Window Functions",
    description: "Running totals, ranking, moving averages, and per-group picks.",
    problemIds: [
      "running-total-daily-sales",
      "rank-products-within-category",
      "moving-average-3day",
      "second-order-per-customer",
      "highest-paid-per-department",
      "gaps-in-sequence",
    ],
  },
  {
    id: "ctes-and-dates",
    title: "CTEs & Dates",
    description: "Recursive queries and time-based aggregation.",
    problemIds: ["recursive-category-tree", "monthly-revenue"],
  },
  {
    id: "interview-prep",
    title: "Interview Prep",
    description:
      "The SQL questions that actually show up in technical interviews — self-joins, NULL traps, ranking, gaps-and-islands, and median.",
    problemIds: [
      // Warm-ups
      "duplicate-emails",
      "customers-never-order",
      "customer-referee",
      "manager-vs-employee",
      "second-highest-salary",
      // Core patterns
      "rank-scores",
      "rising-temperature",
      "consecutive-numbers",
      "tree-node-type",
      "employees-above-dept-avg",
      "exchange-seats",
      "avg-selling-price",
      // Hard
      "department-top-3-salaries",
      "stadium-traffic",
      "median-salary",
    ],
  },
];
