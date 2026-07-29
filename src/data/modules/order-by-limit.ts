import type { Module } from "@/lib/modules/types";
import type { Problem } from "@/lib/problems/types";

// One tiny shared dataset for every drill and quiz question in this module, so
// each exercise is a short variation on the same familiar table. Prices are all
// distinct (so a sort is unambiguous) while `category` repeats (so a two-column
// sort has something to break ties on).
const SCHEMA = `
CREATE TABLE products (
  id        int          PRIMARY KEY,
  name      text         NOT NULL,
  price     numeric(8,2) NOT NULL,
  category  text         NOT NULL
);

INSERT INTO products (id, name, price, category) VALUES
  (1, 'Keyboard',   49.99, 'Accessories'),
  (2, 'Mouse',      24.50, 'Accessories'),
  (3, 'Monitor',   199.00, 'Displays'),
  (4, 'Laptop',   1299.00, 'Computers'),
  (5, 'Webcam',     79.99, 'Accessories'),
  (6, 'Desk Lamp',  34.00, 'Office');
`;

const drills: Problem[] = [
  {
    id: "drill-order-by-limit-1",
    title: "Cheapest first",
    difficulty: "easy",
    topics: ["ordering"],
    description: `The \`products\` table lists everything in the store.

Return each product's \`name\` and \`price\`, sorted by \`price\` from cheapest to most expensive.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT name, price FROM products ORDER BY price, id;`,
    ordered: true,
    hints: [
      "`ORDER BY <column>` sorts ascending (smallest first) by default.",
      "Add `, id` as a tiebreaker so the order is always deterministic.",
      "Full answer: `SELECT name, price FROM products ORDER BY price, id;`",
    ],
  },
  {
    id: "drill-order-by-limit-2",
    title: "Most expensive first",
    difficulty: "easy",
    topics: ["ordering"],
    description: `Return each product's \`name\` and \`price\`, sorted by \`price\` from most expensive to cheapest.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT name, price FROM products ORDER BY price DESC, id;`,
    ordered: true,
    hints: [
      "Add `DESC` after the column to sort in descending order.",
      "Keep `, id` as a tiebreaker for a stable order.",
      "Full answer: `SELECT name, price FROM products ORDER BY price DESC, id;`",
    ],
  },
  {
    id: "drill-order-by-limit-3",
    title: "Sort by two columns",
    difficulty: "easy",
    topics: ["ordering"],
    description: `Return each product's \`name\`, \`category\`, and \`price\`. Sort by \`category\` alphabetically, and within each category sort by \`price\` from cheapest to most expensive.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT name, category, price FROM products ORDER BY category, price, id;`,
    ordered: true,
    hints: [
      "List sort keys in `ORDER BY`, separated by commas — the first is the primary sort.",
      "`ORDER BY category, price` sorts by category, then breaks ties by price.",
      "Full answer: `SELECT name, category, price FROM products ORDER BY category, price, id;`",
    ],
  },
  {
    id: "drill-order-by-limit-4",
    title: "Top 3 most expensive",
    difficulty: "easy",
    topics: ["ordering"],
    description: `Return the \`name\` and \`price\` of the **3 most expensive** products.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT name, price FROM products ORDER BY price DESC, id LIMIT 3;`,
    ordered: true,
    hints: [
      "Sort by `price DESC` first, so the priciest rows come first.",
      "`LIMIT 3` keeps only the first 3 rows of that ordering.",
      "Full answer: `SELECT name, price FROM products ORDER BY price DESC, id LIMIT 3;`",
    ],
  },
  {
    id: "drill-order-by-limit-5",
    title: "Skip then take",
    difficulty: "medium",
    topics: ["ordering"],
    description: `Sort products by \`price\` from most expensive to cheapest, then **skip the single most expensive** and return the \`name\` and \`price\` of the next 2.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT name, price FROM products ORDER BY price DESC, id LIMIT 2 OFFSET 1;`,
    ordered: true,
    hints: [
      "`OFFSET 1` skips the first row before `LIMIT` counts rows.",
      "Combine them: `LIMIT 2 OFFSET 1` skips 1 row, then returns the next 2.",
      "Full answer: `SELECT name, price FROM products ORDER BY price DESC, id LIMIT 2 OFFSET 1;`",
    ],
  },
  {
    id: "drill-order-by-limit-6",
    title: "Sort by an expression",
    difficulty: "medium",
    topics: ["ordering"],
    description: `Return each product's \`name\`, ordered by the **length of the name** from longest to shortest. Use \`LENGTH(name)\` to measure it.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT name FROM products ORDER BY LENGTH(name) DESC, id;`,
    ordered: true,
    hints: [
      "You can `ORDER BY` a computed expression, not just a plain column.",
      "`ORDER BY LENGTH(name) DESC` sorts by name length, longest first.",
      "Full answer: `SELECT name FROM products ORDER BY LENGTH(name) DESC, id;`",
    ],
  },
];

const quiz: Problem[] = [
  {
    id: "quiz-order-by-limit-1",
    title: "Priciest first",
    difficulty: "easy",
    topics: ["ordering"],
    description: `Return each product's \`name\` and \`price\`, sorted from most expensive to cheapest.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT name, price FROM products ORDER BY price DESC, id;`,
    ordered: true,
    hints: ["Sort by `price DESC`, with `, id` as a tiebreaker."],
  },
  {
    id: "quiz-order-by-limit-2",
    title: "Two cheapest",
    difficulty: "easy",
    topics: ["ordering"],
    description: `Return the \`name\` and \`price\` of the **2 cheapest** products.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT name, price FROM products ORDER BY price, id LIMIT 2;`,
    ordered: true,
    hints: ["Sort by `price` ascending, then keep only the first rows with `LIMIT`."],
  },
  {
    id: "quiz-order-by-limit-3",
    title: "Category then price",
    difficulty: "medium",
    topics: ["ordering"],
    description: `Return each product's \`name\`, \`category\`, and \`price\`. Sort by \`category\` alphabetically, and within each category sort by \`price\` from most expensive to cheapest.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT name, category, price FROM products ORDER BY category, price DESC, id;`,
    ordered: true,
    hints: ["Use two sort keys: `category` ascending, then `price DESC`."],
  },
  {
    id: "quiz-order-by-limit-4",
    title: "Third and fourth cheapest",
    difficulty: "medium",
    topics: ["ordering"],
    description: `Sort products by \`price\` from cheapest to most expensive, then return the \`name\` and \`price\` of the **3rd and 4th cheapest** (skip the first 2).`,
    setupSql: SCHEMA,
    solutionSql: `SELECT name, price FROM products ORDER BY price, id LIMIT 2 OFFSET 2;`,
    ordered: true,
    hints: ["`OFFSET 2` skips the first two rows; `LIMIT 2` then takes the next two."],
  },
  {
    id: "quiz-order-by-limit-5",
    title: "Shortest names first",
    difficulty: "medium",
    topics: ["ordering"],
    description: `Return each product's \`name\`, ordered by the **length of the name** from shortest to longest. Use \`LENGTH(name)\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT name FROM products ORDER BY LENGTH(name), id;`,
    ordered: true,
    hints: ["`ORDER BY LENGTH(name)` sorts by name length, shortest first."],
  },
];

export const orderByLimit: Module = {
  id: "order-by-limit",
  title: "ORDER BY & LIMIT",
  order: 4,
  summary: "Sorting results and taking the top N rows.",
  topics: ["ordering"],
  cheatsheetAnchor: "6-order-by--limit",
  drills,
  quiz,
  quizPassThreshold: 4,
  comprehensiveProblemIds: ["top-5-expensive-products"],
  status: "authored",
};
