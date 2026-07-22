import type { Problem } from "@/lib/problems/types";

export const countOrdersPerCustomer: Problem = {
  id: "count-orders-per-customer",
  title: "Count orders per customer",
  difficulty: "easy",
  topics: ["joins", "aggregation", "grouping"],
  description: `Each row in \`orders\` belongs to a customer via \`customer_id\`.

Return every customer's \`name\` and the **number of orders** they have placed.
Every customer in this dataset has at least one order.`,
  setupSql: `
CREATE TABLE customers (
  id   int PRIMARY KEY,
  name text NOT NULL
);

CREATE TABLE orders (
  id          int PRIMARY KEY,
  customer_id int NOT NULL REFERENCES customers(id)
);

INSERT INTO customers (id, name) VALUES
  (1, 'Alice'), (2, 'Bob'), (3, 'Carol');

INSERT INTO orders (id, customer_id) VALUES
  (1, 1), (2, 1), (3, 1),
  (4, 2),
  (5, 3), (6, 3);
`,
  solutionSql: `SELECT c.name, COUNT(*) AS order_count
FROM customers c
JOIN orders o ON o.customer_id = c.id
GROUP BY c.name;`,
  hints: [
    "Join `orders` to `customers`, then collapse to one row per customer.",
    "`GROUP BY c.name` with `COUNT(*)` gives the per-customer order count.",
  ],
};
