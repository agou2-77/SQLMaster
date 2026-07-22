import type { Problem } from "@/lib/problems/types";

export const customersNeverOrder: Problem = {
  id: "customers-never-order",
  title: "Customers who never order",
  difficulty: "easy",
  topics: ["joins", "subqueries"],
  description: `Return the \`name\` of every customer who has **never placed an order** —
i.e. has no matching row in \`orders\`.`,
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
  (1, 'Ada'), (2, 'Bji'), (3, 'Cleo'), (4, 'Dee');

INSERT INTO orders (id, customer_id) VALUES
  (10, 1), (11, 1), (12, 3);   -- Bji (2) and Dee (4) never order
`,
  solutionSql: `SELECT c.name
FROM customers c
WHERE NOT EXISTS (
  SELECT 1 FROM orders o WHERE o.customer_id = c.id
);`,
  hints: [
    "You want customers with zero matching rows in `orders`. Think \"anti-join\".",
    "Use `NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)` — or a `LEFT JOIN orders ... WHERE orders.id IS NULL`. Avoid `NOT IN` here (it breaks if any customer_id is NULL).",
  ],
};
