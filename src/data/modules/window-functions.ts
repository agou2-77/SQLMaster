import type { Module } from "@/lib/modules/types";
import type { Problem } from "@/lib/problems/types";

// One tiny shared dataset for every drill and quiz question in this module, so
// each exercise is a short variation on the same familiar table. Two categories
// with three dated rows each, distinct dates for stable ordering, and one
// repeated amount (250) so RANK/DENSE_RANK ties are visible.
const SCHEMA = `
CREATE TABLE sales (
  id         int  PRIMARY KEY,
  sale_date  date NOT NULL,
  product    text NOT NULL,
  category   text NOT NULL,
  amount     int  NOT NULL
);

INSERT INTO sales (id, sale_date, product, category, amount) VALUES
  (1, '2024-01-01', 'Widget',  'Hardware', 100),
  (2, '2024-01-02', 'Gadget',  'Hardware', 250),
  (3, '2024-01-03', 'Cable',   'Hardware', 150),
  (4, '2024-01-04', 'License', 'Software', 300),
  (5, '2024-01-05', 'Support', 'Software', 250),
  (6, '2024-01-06', 'Upgrade', 'Software', 400);
`;

const drills: Problem[] = [
  {
    id: "drill-window-functions-1",
    title: "Number rows with ROW_NUMBER()",
    difficulty: "easy",
    topics: ["window-functions"],
    description: `The \`sales\` table has one row per sale.

Number every sale from earliest to latest by \`sale_date\` (earliest = 1). Return \`id\`, \`sale_date\`, and the sequence number in a column named \`seq\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT id, sale_date,
       ROW_NUMBER() OVER (ORDER BY sale_date) AS seq
FROM sales
ORDER BY sale_date, id;`,
    ordered: true,
    enforceColumnNames: true,
    hints: [
      "`ROW_NUMBER()` needs an `OVER (ORDER BY ...)` clause to decide the numbering.",
      "Order the window by `sale_date` and alias the result with `AS seq`.",
      "Full answer: `SELECT id, sale_date, ROW_NUMBER() OVER (ORDER BY sale_date) AS seq FROM sales ORDER BY sale_date, id;`",
    ],
  },
  {
    id: "drill-window-functions-2",
    title: "Rank with ties using DENSE_RANK()",
    difficulty: "easy",
    topics: ["window-functions"],
    description: `Rank sales by \`amount\`, highest first. Tied amounts should share a rank with **no gap** afterwards (that is what \`DENSE_RANK()\` gives you). Return \`id\`, \`amount\`, and the rank in a column named \`amount_rank\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT id, amount,
       DENSE_RANK() OVER (ORDER BY amount DESC) AS amount_rank
FROM sales
ORDER BY amount DESC, id;`,
    ordered: true,
    enforceColumnNames: true,
    hints: [
      "`DENSE_RANK() OVER (ORDER BY amount DESC)` assigns 1 to the largest amount.",
      "Two sales share the amount 250, so they get the same rank and the next rank is not skipped.",
      "Full answer: `SELECT id, amount, DENSE_RANK() OVER (ORDER BY amount DESC) AS amount_rank FROM sales ORDER BY amount DESC, id;`",
    ],
  },
  {
    id: "drill-window-functions-3",
    title: "Running total with SUM() OVER()",
    difficulty: "medium",
    topics: ["window-functions"],
    description: `Show a **running total** of \`amount\` as sales accumulate over time. Order the window by \`sale_date\`. Return \`id\`, \`sale_date\`, \`amount\`, and the cumulative sum in a column named \`running_total\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT id, sale_date, amount,
       SUM(amount) OVER (ORDER BY sale_date, id) AS running_total
FROM sales
ORDER BY sale_date, id;`,
    ordered: true,
    enforceColumnNames: true,
    hints: [
      "An aggregate like `SUM(amount)` becomes a running total when you add `OVER (ORDER BY ...)`.",
      "Order the window by `sale_date, id` so each row sums everything up to and including itself.",
      "Full answer: `SELECT id, sale_date, amount, SUM(amount) OVER (ORDER BY sale_date, id) AS running_total FROM sales ORDER BY sale_date, id;`",
    ],
  },
  {
    id: "drill-window-functions-4",
    title: "Rank within each group with PARTITION BY",
    difficulty: "medium",
    topics: ["window-functions"],
    description: `Rank products **within each \`category\`** by \`amount\`, highest first — so every category restarts at rank 1. Return \`id\`, \`category\`, \`amount\`, and the within-category rank in a column named \`rank_in_category\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT id, category, amount,
       RANK() OVER (PARTITION BY category ORDER BY amount DESC) AS rank_in_category
FROM sales
ORDER BY category, amount DESC, id;`,
    ordered: true,
    enforceColumnNames: true,
    hints: [
      "`PARTITION BY category` restarts the ranking for each category.",
      "Combine it with `ORDER BY amount DESC` inside the same `OVER (...)`.",
      "Full answer: `SELECT id, category, amount, RANK() OVER (PARTITION BY category ORDER BY amount DESC) AS rank_in_category FROM sales ORDER BY category, amount DESC, id;`",
    ],
  },
  {
    id: "drill-window-functions-5",
    title: "3-row moving average with a frame",
    difficulty: "medium",
    topics: ["window-functions"],
    description: `Compute a **3-row moving average** of \`amount\`: for each row, average it with the two rows before it, ordered by \`sale_date\`. Round the result to 2 decimals. Return \`id\`, \`sale_date\`, \`amount\`, and the average in a column named \`moving_avg\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT id, sale_date, amount,
       ROUND(AVG(amount) OVER (ORDER BY sale_date, id
                               ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS moving_avg
FROM sales
ORDER BY sale_date, id;`,
    ordered: true,
    enforceColumnNames: true,
    hints: [
      "Add a frame clause `ROWS BETWEEN 2 PRECEDING AND CURRENT ROW` to limit the window to three rows.",
      "Wrap the whole window expression in `ROUND(..., 2)` and alias it `AS moving_avg`.",
      "Full answer: `SELECT id, sale_date, amount, ROUND(AVG(amount) OVER (ORDER BY sale_date, id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS moving_avg FROM sales ORDER BY sale_date, id;`",
    ],
  },
  {
    id: "drill-window-functions-6",
    title: "Look back with LAG()",
    difficulty: "easy",
    topics: ["window-functions"],
    description: `For each sale ordered by \`sale_date\`, show the **previous** sale's \`amount\` in a column named \`prev_amount\` (it is \`NULL\` for the very first sale). Return \`id\`, \`sale_date\`, \`amount\`, and \`prev_amount\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT id, sale_date, amount,
       LAG(amount) OVER (ORDER BY sale_date, id) AS prev_amount
FROM sales
ORDER BY sale_date, id;`,
    ordered: true,
    enforceColumnNames: true,
    hints: [
      "`LAG(amount)` returns the value from the previous row in the window's order.",
      "Order the window by `sale_date, id`; the first row has no predecessor, so it is `NULL`.",
      "Full answer: `SELECT id, sale_date, amount, LAG(amount) OVER (ORDER BY sale_date, id) AS prev_amount FROM sales ORDER BY sale_date, id;`",
    ],
  },
];

const quiz: Problem[] = [
  {
    id: "quiz-window-functions-1",
    title: "Newest first",
    difficulty: "easy",
    topics: ["window-functions"],
    description: `Number every sale from **latest to earliest** by \`sale_date\` (newest = 1). Return \`id\`, \`sale_date\`, and the sequence number in a column named \`seq\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT id, sale_date,
       ROW_NUMBER() OVER (ORDER BY sale_date DESC) AS seq
FROM sales
ORDER BY sale_date DESC, id;`,
    ordered: true,
    enforceColumnNames: true,
    hints: ["Use `ROW_NUMBER()` with the window ordered by `sale_date DESC`."],
  },
  {
    id: "quiz-window-functions-2",
    title: "Rank with gaps",
    difficulty: "easy",
    topics: ["window-functions"],
    description: `Rank sales by \`amount\`, highest first, using \`RANK()\` — so tied amounts share a rank and the next rank **is** skipped. Return \`id\`, \`amount\`, and the rank in a column named \`amount_rank\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT id, amount,
       RANK() OVER (ORDER BY amount DESC) AS amount_rank
FROM sales
ORDER BY amount DESC, id;`,
    ordered: true,
    enforceColumnNames: true,
    hints: ["`RANK() OVER (ORDER BY amount DESC)` leaves a gap after a tie."],
  },
  {
    id: "quiz-window-functions-3",
    title: "Running total per category",
    difficulty: "medium",
    topics: ["window-functions"],
    description: `Show a running total of \`amount\` **within each \`category\`**, ordered by \`sale_date\`. Each category should accumulate independently. Return \`id\`, \`category\`, \`sale_date\`, \`amount\`, and the cumulative sum in a column named \`category_running_total\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT id, category, sale_date, amount,
       SUM(amount) OVER (PARTITION BY category ORDER BY sale_date, id) AS category_running_total
FROM sales
ORDER BY category, sale_date, id;`,
    ordered: true,
    enforceColumnNames: true,
    hints: ["Combine `PARTITION BY category` with `ORDER BY sale_date, id` inside `SUM(...) OVER (...)`."],
  },
  {
    id: "quiz-window-functions-4",
    title: "Two-row moving average",
    difficulty: "medium",
    topics: ["window-functions"],
    description: `For each sale ordered by \`sale_date\`, average its \`amount\` with the single row immediately before it (a 2-row moving average). Return \`id\`, \`sale_date\`, \`amount\`, and the average in a column named \`avg_2\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT id, sale_date, amount,
       AVG(amount) OVER (ORDER BY sale_date, id
                         ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) AS avg_2
FROM sales
ORDER BY sale_date, id;`,
    ordered: true,
    enforceColumnNames: true,
    hints: ["Use a frame of `ROWS BETWEEN 1 PRECEDING AND CURRENT ROW` inside `AVG(...) OVER (...)`."],
  },
  {
    id: "quiz-window-functions-5",
    title: "Look ahead with LEAD()",
    difficulty: "easy",
    topics: ["window-functions"],
    description: `For each sale ordered by \`sale_date\`, show the **next** sale's \`amount\` in a column named \`next_amount\` (\`NULL\` for the last sale). Return \`id\`, \`sale_date\`, \`amount\`, and \`next_amount\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT id, sale_date, amount,
       LEAD(amount) OVER (ORDER BY sale_date, id) AS next_amount
FROM sales
ORDER BY sale_date, id;`,
    ordered: true,
    enforceColumnNames: true,
    hints: ["`LEAD(amount)` is the mirror of `LAG(amount)` — it looks one row forward."],
  },
];

export const windowFunctions: Module = {
  id: "window-functions",
  title: "Window functions",
  order: 14,
  summary: "Ranking, running totals, and per-group picks with OVER().",
  topics: ["window-functions"],
  cheatsheetAnchor: "11-window-functions",
  drills,
  quiz,
  quizPassThreshold: 4,
  comprehensiveProblemIds: [
    "running-total-daily-sales",
    "rank-products-within-category",
    "moving-average-3day",
  ],
  comprehensivePathIds: ["window-functions"],
  status: "authored",
};
