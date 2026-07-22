import type { Problem } from "@/lib/problems/types";

export const runningTotalDailySales: Problem = {
  id: "running-total-daily-sales",
  title: "Running total of daily sales",
  difficulty: "hard",
  topics: ["window-functions"],
  description: `\`daily_sales\` has one row per day with an \`amount\`.

Return each \`sale_date\`, its \`amount\`, and the **running total** of amount up to
and including that day, ordered by date ascending.`,
  ordered: true,
  setupSql: `
CREATE TABLE daily_sales (
  sale_date date PRIMARY KEY,
  amount    numeric(10, 2) NOT NULL
);

INSERT INTO daily_sales (sale_date, amount) VALUES
  ('2024-01-01', 100.00),
  ('2024-01-02', 50.00),
  ('2024-01-03', 200.00),
  ('2024-01-04', 25.00);
`,
  solutionSql: `SELECT sale_date, amount,
       SUM(amount) OVER (ORDER BY sale_date) AS running_total
FROM daily_sales
ORDER BY sale_date;`,
  hints: [
    "A running total is a windowed SUM ordered by date.",
    "`SUM(amount) OVER (ORDER BY sale_date)` — the ORDER BY inside OVER() makes it cumulative.",
  ],
};
