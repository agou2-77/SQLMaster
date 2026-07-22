import type { Problem } from "@/lib/problems/types";

export const movingAverage3day: Problem = {
  id: "moving-average-3day",
  title: "3-day moving average of sales",
  difficulty: "hard",
  topics: ["window-functions"],
  description: `Using \`daily_sales\`, return each \`sale_date\` and the **3-day moving average**
of \`amount\` — the average of the current day and the two days before it —
rounded to 2 decimals, ordered by date.

For the first days (with fewer than 3 prior rows), average over whatever days
are available.`,
  ordered: true,
  setupSql: `
CREATE TABLE daily_sales (
  sale_date date PRIMARY KEY,
  amount    numeric(10, 2) NOT NULL
);

INSERT INTO daily_sales (sale_date, amount) VALUES
  ('2024-01-01', 10.00),
  ('2024-01-02', 20.00),
  ('2024-01-03', 30.00),
  ('2024-01-04', 40.00),
  ('2024-01-05', 50.00);
`,
  solutionSql: `SELECT sale_date,
       ROUND(AVG(amount) OVER (
         ORDER BY sale_date
         ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
       ), 2) AS moving_avg
FROM daily_sales
ORDER BY sale_date;`,
  hints: [
    "You need a windowed AVG with an explicit frame of the last 3 rows.",
    "`AVG(amount) OVER (ORDER BY sale_date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)`, wrapped in `ROUND(..., 2)`.",
  ],
};
