import type { Module } from "@/lib/modules/types";
import type { Problem } from "@/lib/problems/types";

// One tiny shared dataset for every drill and quiz question in this module, so
// each exercise is a short variation on the same familiar table. One row per
// order line item; multiple customers and categories give us real groups.
const SCHEMA = `
CREATE TABLE orders (
  id        int  PRIMARY KEY,
  customer  text NOT NULL,
  category  text NOT NULL,
  amount    int  NOT NULL   -- dollars for this order
);

INSERT INTO orders (id, customer, category, amount) VALUES
  (1, 'Ada',   'Books', 30),
  (2, 'Ada',   'Books', 20),
  (3, 'Ada',   'Games', 50),
  (4, 'Grace', 'Books', 45),
  (5, 'Grace', 'Games', 60),
  (6, 'Linus', 'Games', 25);
`;

const drills: Problem[] = [
  {
    id: "drill-group-by-having-1",
    title: "Count rows per group",
    difficulty: "easy",
    topics: ["grouping"],
    description: `The \`orders\` table has one row per order.

Count how many orders each \`customer\` placed. Return \`customer\` and the count in a column named \`order_count\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT customer, COUNT(*) AS order_count FROM orders GROUP BY customer;`,
    enforceColumnNames: true,
    hints: [
      "`GROUP BY customer` collapses each customer's rows into one group; `COUNT(*)` counts the rows in each group.",
      "Alias the count with `AS order_count`.",
      "Full answer: `SELECT customer, COUNT(*) AS order_count FROM orders GROUP BY customer;`",
    ],
  },
  {
    id: "drill-group-by-having-2",
    title: "Total per group",
    difficulty: "easy",
    topics: ["grouping"],
    description: `Return each \`customer\` and their total spend (the sum of \`amount\`) in a column named \`total_spent\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT customer, SUM(amount) AS total_spent FROM orders GROUP BY customer;`,
    enforceColumnNames: true,
    hints: [
      "`SUM(amount)` adds up `amount` within each `GROUP BY` group.",
      "Full answer: `SELECT customer, SUM(amount) AS total_spent FROM orders GROUP BY customer;`",
    ],
  },
  {
    id: "drill-group-by-having-3",
    title: "Average per group",
    difficulty: "easy",
    topics: ["grouping"],
    description: `Return each \`category\` and its average order \`amount\`, **rounded to 2 decimal places**, in a column named \`avg_amount\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT category, ROUND(AVG(amount), 2) AS avg_amount FROM orders GROUP BY category;`,
    enforceColumnNames: true,
    hints: [
      "`AVG(amount)` averages within each group; wrap it in `ROUND(..., 2)` to keep two decimals.",
      "Group by `category` and alias the result `AS avg_amount`.",
      "Full answer: `SELECT category, ROUND(AVG(amount), 2) AS avg_amount FROM orders GROUP BY category;`",
    ],
  },
  {
    id: "drill-group-by-having-4",
    title: "Filter groups with HAVING",
    difficulty: "medium",
    topics: ["grouping"],
    description: `\`WHERE\` filters rows; \`HAVING\` filters **groups**. Return just the \`customer\` column for every customer who placed more than one order.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT customer FROM orders GROUP BY customer HAVING COUNT(*) > 1;`,
    hints: [
      "`HAVING` runs after grouping, so it can test aggregates like `COUNT(*)`.",
      "Group by `customer`, then keep only groups where `COUNT(*) > 1`.",
      "Full answer: `SELECT customer FROM orders GROUP BY customer HAVING COUNT(*) > 1;`",
    ],
  },
  {
    id: "drill-group-by-having-5",
    title: "Group by two columns",
    difficulty: "medium",
    topics: ["grouping"],
    description: `Group by both \`customer\` **and** \`category\`. Return \`customer\`, \`category\`, and the number of orders in each combination in a column named \`order_count\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT customer, category, COUNT(*) AS order_count FROM orders GROUP BY customer, category;`,
    enforceColumnNames: true,
    hints: [
      "List both grouping columns after `GROUP BY`, separated by a comma.",
      "Every non-aggregated column in the `SELECT` list must also appear in `GROUP BY`.",
      "Full answer: `SELECT customer, category, COUNT(*) AS order_count FROM orders GROUP BY customer, category;`",
    ],
  },
  {
    id: "drill-group-by-having-6",
    title: "HAVING on a sum",
    difficulty: "medium",
    topics: ["grouping"],
    description: `Return each \`customer\` whose total spend is more than 90, along with that total in a column named \`total_spent\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT customer, SUM(amount) AS total_spent FROM orders GROUP BY customer HAVING SUM(amount) > 90;`,
    enforceColumnNames: true,
    hints: [
      "You can put an aggregate like `SUM(amount)` inside `HAVING`.",
      "Group by `customer`, keep groups where `SUM(amount) > 90`, and alias the total `AS total_spent`.",
      "Full answer: `SELECT customer, SUM(amount) AS total_spent FROM orders GROUP BY customer HAVING SUM(amount) > 90;`",
    ],
  },
];

const quiz: Problem[] = [
  {
    id: "quiz-group-by-having-1",
    title: "Total per category",
    difficulty: "easy",
    topics: ["grouping"],
    description: `Return each \`category\` and its total \`amount\` in a column named \`category_total\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT category, SUM(amount) AS category_total FROM orders GROUP BY category;`,
    enforceColumnNames: true,
    hints: ["`SUM(amount)` totals each `GROUP BY category` group."],
  },
  {
    id: "quiz-group-by-having-2",
    title: "Average per customer",
    difficulty: "easy",
    topics: ["grouping"],
    description: `Return each \`customer\` and their average order \`amount\`, rounded to 2 decimals, in a column named \`avg_order\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT customer, ROUND(AVG(amount), 2) AS avg_order FROM orders GROUP BY customer;`,
    enforceColumnNames: true,
    hints: ["Wrap `AVG(amount)` in `ROUND(..., 2)` and group by `customer`."],
  },
  {
    id: "quiz-group-by-having-3",
    title: "Busy customers",
    difficulty: "medium",
    topics: ["grouping"],
    description: `Return just the \`customer\` column for every customer who placed more than 2 orders.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT customer FROM orders GROUP BY customer HAVING COUNT(*) > 2;`,
    hints: ["Filter the groups with `HAVING COUNT(*) > 2`."],
  },
  {
    id: "quiz-group-by-having-4",
    title: "Spend by customer and category",
    difficulty: "medium",
    topics: ["grouping"],
    description: `For each \`customer\` and \`category\` combination, return \`customer\`, \`category\`, and the total \`amount\` in a column named \`combo_total\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT customer, category, SUM(amount) AS combo_total FROM orders GROUP BY customer, category;`,
    enforceColumnNames: true,
    hints: ["Put both `customer` and `category` in the `GROUP BY`."],
  },
  {
    id: "quiz-group-by-having-5",
    title: "Big spenders",
    difficulty: "medium",
    topics: ["grouping"],
    description: `Return each \`customer\` whose average order \`amount\` is above 30, with that average rounded to 2 decimals in a column named \`avg_order\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT customer, ROUND(AVG(amount), 2) AS avg_order FROM orders GROUP BY customer HAVING AVG(amount) > 30;`,
    enforceColumnNames: true,
    hints: ["Test the group's `AVG(amount)` inside `HAVING`."],
  },
];

export const groupByHaving: Module = {
  id: "group-by-having",
  title: "GROUP BY & HAVING",
  order: 6,
  summary: "Aggregating per group and filtering the groups.",
  topics: ["grouping"],
  cheatsheetAnchor: "7-aggregation",
  drills,
  quiz,
  quizPassThreshold: 4,
  comprehensiveProblemIds: ["avg-price-by-category", "customers-over-3-orders"],
  status: "authored",
};
