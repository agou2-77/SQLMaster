import type { Problem } from "@/lib/problems/types";

export const productsNeverOrdered: Problem = {
  id: "products-never-ordered",
  title: "Products never ordered",
  difficulty: "easy",
  topics: ["joins", "subqueries"],
  description: `\`order_items\` records which products appear in orders (via \`product_id\`).

Return the \`id\` and \`name\` of every product that has **never** been ordered
(no matching row in \`order_items\`).`,
  setupSql: `
CREATE TABLE products (
  id   int PRIMARY KEY,
  name text NOT NULL
);

CREATE TABLE order_items (
  id         int PRIMARY KEY,
  product_id int NOT NULL REFERENCES products(id),
  quantity   int NOT NULL
);

INSERT INTO products (id, name) VALUES
  (1, 'Laptop'), (2, 'Phone'), (3, 'Headphones'), (4, 'Charger'), (5, 'Case');

INSERT INTO order_items (id, product_id, quantity) VALUES
  (1, 1, 1), (2, 2, 2), (3, 1, 1), (4, 3, 1);
`,
  solutionSql: `SELECT p.id, p.name
FROM products p
WHERE NOT EXISTS (
  SELECT 1 FROM order_items oi WHERE oi.product_id = p.id
);`,
  hints: [
    "You want products with no matching rows in `order_items`. Think 'anti-join'.",
    "`NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.product_id = p.id)` — or a LEFT JOIN with `WHERE oi.id IS NULL`.",
  ],
};
