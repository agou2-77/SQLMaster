import type { Module } from "@/lib/modules/types";
import type { Problem } from "@/lib/problems/types";

// One tiny shared dataset for every drill and quiz question in this module, so
// each exercise is a short variation on the same familiar table. `shipped_on`
// is deliberately NULL for two rows so COUNT(col) can differ from COUNT(*).
const SCHEMA = `
CREATE TABLE orders (
  id          int PRIMARY KEY,
  status      text          NOT NULL,
  amount      numeric(10,2) NOT NULL,   -- order total in dollars
  shipped_on  date                      -- NULL until the order ships
);

INSERT INTO orders (id, status, amount, shipped_on) VALUES
  (1, 'paid',     120.00, '2024-01-05'),
  (2, 'paid',      75.50, '2024-01-08'),
  (3, 'pending',  200.00, NULL),
  (4, 'refunded',  50.28, '2024-01-10'),
  (5, 'paid',     300.00, NULL);
`;

const drills: Problem[] = [
  {
    id: "drill-aggregation-1",
    title: "Count the rows",
    difficulty: "easy",
    topics: ["aggregation"],
    description: `The \`orders\` table has one row per order.

Return how many orders there are in a column named \`total_orders\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT COUNT(*) AS total_orders FROM orders;`,
    enforceColumnNames: true,
    hints: [
      "`COUNT(*)` counts every row in the table.",
      "Alias the result with `AS total_orders`.",
      "Full answer: `SELECT COUNT(*) AS total_orders FROM orders;`",
    ],
  },
  {
    id: "drill-aggregation-2",
    title: "Count non-NULL values",
    difficulty: "medium",
    topics: ["aggregation"],
    description: `\`shipped_on\` is \`NULL\` for orders that haven't shipped yet.

\`COUNT(column)\` ignores \`NULL\`s — so it counts only the rows where that column has a value. Return how many orders have shipped in a column named \`shipped_orders\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT COUNT(shipped_on) AS shipped_orders FROM orders;`,
    enforceColumnNames: true,
    hints: [
      "`COUNT(*)` counts all rows, but `COUNT(shipped_on)` skips the `NULL`s.",
      "Alias the result with `AS shipped_orders`.",
      "Full answer: `SELECT COUNT(shipped_on) AS shipped_orders FROM orders;`",
    ],
  },
  {
    id: "drill-aggregation-3",
    title: "Sum a column",
    difficulty: "easy",
    topics: ["aggregation"],
    description: `Return the combined total of every order's \`amount\` in a column named \`total_amount\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT SUM(amount) AS total_amount FROM orders;`,
    enforceColumnNames: true,
    hints: [
      "`SUM(amount)` adds up the values across all rows.",
      "Alias the result with `AS total_amount`.",
      "Full answer: `SELECT SUM(amount) AS total_amount FROM orders;`",
    ],
  },
  {
    id: "drill-aggregation-4",
    title: "Average, rounded",
    difficulty: "medium",
    topics: ["aggregation"],
    description: `Return the average order \`amount\`, rounded to 2 decimal places, in a column named \`avg_amount\`.

Wrap the average in \`ROUND(..., 2)\` so the number stays clean.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT ROUND(AVG(amount), 2) AS avg_amount FROM orders;`,
    enforceColumnNames: true,
    hints: [
      "`AVG(amount)` gives the mean; `ROUND(x, 2)` trims it to 2 decimals.",
      "Put them together: `ROUND(AVG(amount), 2)` and alias it `AS avg_amount`.",
      "Full answer: `SELECT ROUND(AVG(amount), 2) AS avg_amount FROM orders;`",
    ],
  },
  {
    id: "drill-aggregation-5",
    title: "Smallest value",
    difficulty: "easy",
    topics: ["aggregation"],
    description: `Return the smallest order \`amount\` in a column named \`min_amount\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT MIN(amount) AS min_amount FROM orders;`,
    enforceColumnNames: true,
    hints: [
      "`MIN(amount)` returns the lowest value in the column.",
      "Alias the result with `AS min_amount`.",
      "Full answer: `SELECT MIN(amount) AS min_amount FROM orders;`",
    ],
  },
  {
    id: "drill-aggregation-6",
    title: "Largest value",
    difficulty: "easy",
    topics: ["aggregation"],
    description: `Return the largest order \`amount\` in a column named \`max_amount\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT MAX(amount) AS max_amount FROM orders;`,
    enforceColumnNames: true,
    hints: [
      "`MAX(amount)` returns the highest value in the column.",
      "Alias the result with `AS max_amount`.",
      "Full answer: `SELECT MAX(amount) AS max_amount FROM orders;`",
    ],
  },
];

const quiz: Problem[] = [
  {
    id: "quiz-aggregation-1",
    title: "How many orders",
    difficulty: "easy",
    topics: ["aggregation"],
    description: `Return the number of orders in the table, in a column named \`order_count\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT COUNT(*) AS order_count FROM orders;`,
    enforceColumnNames: true,
    hints: ["`COUNT(*)` counts every row; alias it `AS order_count`."],
  },
  {
    id: "quiz-aggregation-2",
    title: "Total revenue",
    difficulty: "easy",
    topics: ["aggregation"],
    description: `Return the total of every order's \`amount\` in a column named \`revenue\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT SUM(amount) AS revenue FROM orders;`,
    enforceColumnNames: true,
    hints: ["`SUM(amount)` adds the values; alias it `AS revenue`."],
  },
  {
    id: "quiz-aggregation-3",
    title: "Biggest order",
    difficulty: "easy",
    topics: ["aggregation"],
    description: `Return the largest order \`amount\` in a column named \`biggest_order\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT MAX(amount) AS biggest_order FROM orders;`,
    enforceColumnNames: true,
    hints: ["`MAX(amount)` returns the highest value; alias it `AS biggest_order`."],
  },
  {
    id: "quiz-aggregation-4",
    title: "Mean amount",
    difficulty: "medium",
    topics: ["aggregation"],
    description: `Return the average order \`amount\`, rounded to 2 decimal places, in a column named \`mean_amount\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT ROUND(AVG(amount), 2) AS mean_amount FROM orders;`,
    enforceColumnNames: true,
    hints: ["Wrap `AVG(amount)` in `ROUND(..., 2)` and alias it `AS mean_amount`."],
  },
  {
    id: "quiz-aggregation-5",
    title: "Shipped so far",
    difficulty: "medium",
    topics: ["aggregation"],
    description: `Some orders have a \`NULL\` \`shipped_on\`. Return how many orders have actually shipped, in a column named \`shipped_count\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT COUNT(shipped_on) AS shipped_count FROM orders;`,
    enforceColumnNames: true,
    hints: ["`COUNT(shipped_on)` ignores `NULL`s; alias it `AS shipped_count`."],
  },
];

export const aggregation: Module = {
  id: "aggregation",
  title: "Aggregation",
  order: 5,
  summary: "COUNT, SUM, AVG, MIN, and MAX over a whole table.",
  topics: ["aggregation"],
  cheatsheetAnchor: "7-aggregation",
  drills,
  quiz,
  quizPassThreshold: 4,
  comprehensiveProblemIds: ["count-orders-per-customer"],
  status: "authored",
};
