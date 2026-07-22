import type { Problem } from "@/lib/problems/types";

export const boughtANotB: Problem = {
  id: "bought-a-not-b",
  title: "Bought Widget but not Gadget",
  difficulty: "medium",
  topics: ["set-ops", "subqueries"],
  description: `Each order in \`orders\` is for a single \`product\`.

Return the \`name\` of every customer who has ordered a **'Widget'** but has
**never** ordered a **'Gadget'**.`,
  setupSql: `
CREATE TABLE customers (
  id   int PRIMARY KEY,
  name text NOT NULL
);
CREATE TABLE orders (
  id          int PRIMARY KEY,
  customer_id int NOT NULL REFERENCES customers(id),
  product     text NOT NULL
);

INSERT INTO customers (id, name) VALUES
  (1, 'Alice'), (2, 'Bob'), (3, 'Carol'), (4, 'Dave');

INSERT INTO orders (id, customer_id, product) VALUES
  (1, 1, 'Widget'),
  (2, 1, 'Gadget'),   -- Alice: both → excluded
  (3, 2, 'Widget'),   -- Bob: widget only → included
  (4, 3, 'Gadget'),   -- Carol: gadget only → excluded
  (5, 4, 'Widget'),
  (6, 4, 'Widget');   -- Dave: widget only → included
`,
  solutionSql: `SELECT DISTINCT c.name
FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE o.product = 'Widget'
  AND NOT EXISTS (
    SELECT 1 FROM orders g
    WHERE g.customer_id = c.id AND g.product = 'Gadget'
  );`,
  hints: [
    "Two conditions: they DID order a Widget, and they did NOT order a Gadget.",
    "Use `NOT EXISTS` (or `NOT IN`) for the 'never ordered a Gadget' half, correlated on the customer id.",
  ],
};
