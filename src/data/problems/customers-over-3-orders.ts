import type { Problem } from "@/lib/problems/types";

export const customersOver3Orders: Problem = {
  id: "customers-over-3-orders",
  title: "Customers with more than 3 orders",
  difficulty: "medium",
  topics: ["grouping", "aggregation"],
  description: `Return the \`name\` of every customer who has placed **more than 3** orders.`,
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
  (1, 'Alice'), (2, 'Bob'), (3, 'Carol'), (4, 'Dave');

INSERT INTO orders (id, customer_id) VALUES
  (1, 1), (2, 1), (3, 1), (4, 1), (5, 1),   -- Alice: 5
  (6, 2), (7, 2),                           -- Bob: 2
  (8, 3), (9, 3), (10, 3), (11, 3),         -- Carol: 4
  (12, 4);                                  -- Dave: 1
`,
  solutionSql: `SELECT c.name
FROM customers c
JOIN orders o ON o.customer_id = c.id
GROUP BY c.name
HAVING COUNT(*) > 3;`,
  hints: [
    "You can't filter an aggregate with WHERE — you filter groups with HAVING.",
    "`GROUP BY c.name HAVING COUNT(*) > 3`.",
  ],
};
