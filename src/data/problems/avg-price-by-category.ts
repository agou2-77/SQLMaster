import type { Problem } from "@/lib/problems/types";

export const avgPriceByCategory: Problem = {
  id: "avg-price-by-category",
  title: "Average price by category",
  difficulty: "medium",
  topics: ["joins", "aggregation", "grouping"],
  description: `You have a \`categories\` table and a \`products\` table (each product
belongs to one category via \`products.category_id\`).

For **each category**, return the category **name** and the **average price**
of its products, rounded to 2 decimal places.`,
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
  (1, 'Electronics'),
  (2, 'Books'),
  (3, 'Toys');

INSERT INTO products (id, name, category_id, price) VALUES
  (1, 'Laptop',     1, 1200.00),
  (2, 'Phone',      1, 800.00),
  (3, 'Headphones', 1, 150.00),
  (4, 'Novel',      2, 15.00),
  (5, 'Textbook',   2, 85.00),
  (6, 'Puzzle',     3, 25.00);
`,
  solutionSql: `SELECT c.name, ROUND(AVG(p.price), 2) AS avg_price
FROM categories c
JOIN products p ON p.category_id = c.id
GROUP BY c.name;`,
  hints: [
    "You need one row per category. An aggregate like AVG needs a GROUP BY to split the rows into per-category buckets.",
    "Join `products` to `categories`, then `GROUP BY` the category, and wrap the average in `ROUND(..., 2)`.",
    "Full answer: `SELECT c.name, ROUND(AVG(p.price), 2) FROM categories c JOIN products p ON p.category_id = c.id GROUP BY c.name;`",
  ],
};
