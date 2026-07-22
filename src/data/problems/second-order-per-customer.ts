import type { Problem } from "@/lib/problems/types";

export const secondOrderPerCustomer: Problem = {
  id: "second-order-per-customer",
  title: "Each customer's second order",
  difficulty: "hard",
  topics: ["window-functions", "ctes"],
  description: `Using \`orders\`, return the \`customer_id\` and \`order_date\` of each customer's
**second order** (by \`order_date\`, earliest first).

Customers with fewer than two orders should not appear.`,
  setupSql: `
CREATE TABLE orders (
  id          int PRIMARY KEY,
  customer_id int NOT NULL,
  order_date  date NOT NULL
);

INSERT INTO orders (id, customer_id, order_date) VALUES
  (1, 1, '2024-01-01'),
  (2, 1, '2024-02-01'),
  (3, 1, '2024-03-01'),
  (4, 2, '2024-01-15'),
  (5, 2, '2024-01-20'),
  (6, 3, '2024-05-01');   -- customer 3 has only one order → excluded
`,
  solutionSql: `WITH ranked AS (
  SELECT customer_id, order_date,
         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date) AS rn
  FROM orders
)
SELECT customer_id, order_date
FROM ranked
WHERE rn = 2;`,
  hints: [
    "Number each customer's orders by date, then keep the one numbered 2.",
    "`ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date)` in a CTE, then filter `WHERE rn = 2`.",
  ],
};
