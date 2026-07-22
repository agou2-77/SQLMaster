import type { Problem } from "@/lib/problems/types";

export const rankProductsWithinCategory: Problem = {
  id: "rank-products-within-category",
  title: "Rank products within each category",
  difficulty: "hard",
  topics: ["window-functions", "joins"],
  description: `For every product, return its \`category\` name, \`product\` name, \`price\`, and its
**rank by price within its category** (rank 1 = most expensive in that category).

Prices are distinct within each category, so the ranking is unambiguous.`,
  setupSql: `
CREATE TABLE categories (
  id   int PRIMARY KEY,
  name text NOT NULL
);
CREATE TABLE products (
  id          int PRIMARY KEY,
  name        text NOT NULL,
  category_id int NOT NULL REFERENCES categories(id),
  price       numeric(10, 2) NOT NULL
);

INSERT INTO categories (id, name) VALUES
  (1, 'Electronics'), (2, 'Books');

INSERT INTO products (id, name, category_id, price) VALUES
  (1, 'Laptop',   1, 1200.00),
  (2, 'Phone',    1, 800.00),
  (3, 'Cable',    1, 20.00),
  (4, 'Textbook', 2, 85.00),
  (5, 'Novel',    2, 15.00);
`,
  solutionSql: `SELECT c.name AS category, p.name AS product, p.price,
       RANK() OVER (PARTITION BY c.id ORDER BY p.price DESC) AS rank
FROM products p
JOIN categories c ON c.id = p.category_id;`,
  hints: [
    "Ranking *within* a group means a window function with PARTITION BY.",
    "`RANK() OVER (PARTITION BY c.id ORDER BY p.price DESC)`. (With distinct prices, RANK / DENSE_RANK / ROW_NUMBER all agree.)",
  ],
};
