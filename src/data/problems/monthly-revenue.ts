import type { Problem } from "@/lib/problems/types";

export const monthlyRevenue: Problem = {
  id: "monthly-revenue",
  title: "Monthly revenue trend",
  difficulty: "medium",
  topics: ["date-time", "aggregation", "grouping"],
  description: `Each order has an \`order_date\` and an \`amount\`.

Return the **first day of each month** (as a date) and the **total revenue** for
that month, ordered by month ascending.`,
  ordered: true,
  setupSql: `
CREATE TABLE orders (
  id         int PRIMARY KEY,
  order_date date NOT NULL,
  amount     numeric(10, 2) NOT NULL
);

INSERT INTO orders (id, order_date, amount) VALUES
  (1, '2024-01-05', 100.00),
  (2, '2024-01-20', 50.00),
  (3, '2024-02-01', 200.00),
  (4, '2024-02-14', 25.00),
  (5, '2024-03-30', 300.00);
`,
  solutionSql: `SELECT date_trunc('month', order_date)::date AS month,
       SUM(amount) AS revenue
FROM orders
GROUP BY 1
ORDER BY 1;`,
  hints: [
    "`date_trunc('month', order_date)` collapses each date to the first of its month.",
    "Group by that truncated month and `SUM(amount)`, then `ORDER BY` the month. Cast to `::date` for a clean date value.",
  ],
};
