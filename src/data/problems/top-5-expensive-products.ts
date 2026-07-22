import type { Problem } from "@/lib/problems/types";

export const top5ExpensiveProducts: Problem = {
  id: "top-5-expensive-products",
  title: "Top 5 most expensive products",
  difficulty: "easy",
  topics: ["ordering", "filtering"],
  description: `Return the **5 most expensive** products — their \`name\` and \`price\` —
ordered from most to least expensive.`,
  ordered: true,
  setupSql: `
CREATE TABLE products (
  id    int PRIMARY KEY,
  name  text NOT NULL,
  price numeric(10, 2) NOT NULL
);

INSERT INTO products (id, name, price) VALUES
  (1, 'Laptop',      1200.00),
  (2, 'Phone',        800.00),
  (3, 'Monitor',      350.00),
  (4, 'Headphones',   150.00),
  (5, 'Keyboard',      90.00),
  (6, 'Mouse',         45.00),
  (7, 'Cable',          9.00);
`,
  solutionSql: `SELECT name, price
FROM products
ORDER BY price DESC
LIMIT 5;`,
  hints: [
    "Sort by price descending, then keep only the first few rows.",
    "`ORDER BY price DESC LIMIT 5`. This problem is order-sensitive, so the ORDER BY matters.",
  ],
};
