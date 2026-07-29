import type { Module } from "@/lib/modules/types";
import type { Problem } from "@/lib/problems/types";

// One tiny shared dataset for every drill and quiz question in this module, so
// each exercise is a short variation on the same familiar table.
const SCHEMA = `
CREATE TABLE products (
  id        int PRIMARY KEY,
  name      text    NOT NULL,
  category  text    NOT NULL,
  price     numeric NOT NULL,  -- shelf price
  stock     int     NOT NULL   -- units on hand
);

INSERT INTO products (id, name, category, price, stock) VALUES
  (1, 'Apple',     'Fruit',  0.50, 120),
  (2, 'Banana',    'Fruit',  0.30,  90),
  (3, 'Baguette',  'Bakery', 2.50,  40),
  (4, 'Croissant', 'Bakery', 1.80,  60),
  (5, 'Milk',      'Dairy',  1.20,  30),
  (6, 'Cheddar',   'Dairy',  4.00,  15);
`;

const drills: Problem[] = [
  {
    id: "drill-where-filtering-1",
    title: "A simple comparison",
    difficulty: "easy",
    topics: ["filtering"],
    description: `Every row in \`products\` is one item on the shelf.

Return the \`name\` and \`price\` of every product that costs more than \`1.00\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT name, price FROM products WHERE price > 1.00;`,
    hints: [
      "Add a `WHERE` clause after the table name to keep only some rows.",
      "Compare the `price` column with `>`.",
      "Full answer: `SELECT name, price FROM products WHERE price > 1.00;`",
    ],
  },
  {
    id: "drill-where-filtering-2",
    title: "Combine conditions with AND",
    difficulty: "easy",
    topics: ["filtering"],
    description: `Return the \`name\` of every product that costs more than \`1.50\` **and** has fewer than \`50\` units in \`stock\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT name FROM products WHERE price > 1.50 AND stock < 50;`,
    hints: [
      "`AND` keeps a row only when *both* conditions are true.",
      "Write one comparison, then `AND`, then the second comparison.",
      "Full answer: `SELECT name FROM products WHERE price > 1.50 AND stock < 50;`",
    ],
  },
  {
    id: "drill-where-filtering-3",
    title: "Either condition with OR",
    difficulty: "easy",
    topics: ["filtering"],
    description: `Return the \`name\` of every product that either costs less than \`0.50\` **or** has more than \`100\` units in \`stock\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT name FROM products WHERE price < 0.50 OR stock > 100;`,
    hints: [
      "`OR` keeps a row when *at least one* condition is true.",
      "Full answer: `SELECT name FROM products WHERE price < 0.50 OR stock > 100;`",
    ],
  },
  {
    id: "drill-where-filtering-4",
    title: "Match a list with IN",
    difficulty: "easy",
    topics: ["filtering"],
    description: `Return the \`name\` and \`category\` of every product in the \`Fruit\` or \`Dairy\` category. Use \`IN\` instead of two \`OR\`s.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT name, category FROM products WHERE category IN ('Fruit', 'Dairy');`,
    hints: [
      "`IN (...)` checks whether a column matches any value in a list.",
      "Put the category names in quotes, separated by commas.",
      "Full answer: `SELECT name, category FROM products WHERE category IN ('Fruit', 'Dairy');`",
    ],
  },
  {
    id: "drill-where-filtering-5",
    title: "An inclusive range with BETWEEN",
    difficulty: "easy",
    topics: ["filtering"],
    description: `Return the \`name\` and \`price\` of every product priced between \`0.50\` and \`2.50\`, inclusive. Use \`BETWEEN\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT name, price FROM products WHERE price BETWEEN 0.50 AND 2.50;`,
    hints: [
      "`BETWEEN a AND b` matches values from `a` to `b`, including both endpoints.",
      "Full answer: `SELECT name, price FROM products WHERE price BETWEEN 0.50 AND 2.50;`",
    ],
  },
  {
    id: "drill-where-filtering-6",
    title: "Pattern matching with LIKE",
    difficulty: "medium",
    topics: ["filtering"],
    description: `Return the \`name\` of every product whose name starts with the letter \`B\`. Use \`LIKE\` with the \`%\` wildcard.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT name FROM products WHERE name LIKE 'B%';`,
    hints: [
      "`LIKE` matches text patterns; `%` stands for any run of characters.",
      "`'B%'` means \"a B followed by anything\".",
      "Full answer: `SELECT name FROM products WHERE name LIKE 'B%';`",
    ],
  },
];

const quiz: Problem[] = [
  {
    id: "quiz-where-filtering-1",
    title: "Both must hold",
    difficulty: "easy",
    topics: ["filtering"],
    description: `Return the \`name\` of every \`Fruit\` product priced at \`0.50\` or more.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT name FROM products WHERE category = 'Fruit' AND price >= 0.50;`,
    hints: ["Join the two conditions with `AND`."],
  },
  {
    id: "quiz-where-filtering-2",
    title: "One or the other",
    difficulty: "easy",
    topics: ["filtering"],
    description: `Return the \`name\` of every product that either costs more than \`3.00\` or has more than \`100\` units in \`stock\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT name FROM products WHERE price > 3.00 OR stock > 100;`,
    hints: ["`OR` is satisfied when at least one side is true."],
  },
  {
    id: "quiz-where-filtering-3",
    title: "Pick from a list",
    difficulty: "easy",
    topics: ["filtering"],
    description: `Return the \`name\` and \`category\` of every product in the \`Bakery\` or \`Dairy\` category, using \`IN\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT name, category FROM products WHERE category IN ('Bakery', 'Dairy');`,
    hints: ["List both categories inside `IN (...)`."],
  },
  {
    id: "quiz-where-filtering-4",
    title: "Inside a range",
    difficulty: "medium",
    topics: ["filtering"],
    description: `Return the \`name\` and \`stock\` of every product with between \`30\` and \`90\` units in \`stock\`, inclusive. Use \`BETWEEN\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT name, stock FROM products WHERE stock BETWEEN 30 AND 90;`,
    hints: ["`BETWEEN 30 AND 90` includes both 30 and 90."],
  },
  {
    id: "quiz-where-filtering-5",
    title: "Starts with C",
    difficulty: "medium",
    topics: ["filtering"],
    description: `Return the \`name\` of every product whose name starts with the letter \`C\`. Use \`LIKE\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT name FROM products WHERE name LIKE 'C%';`,
    hints: ["Use the `%` wildcard right after `C`."],
  },
];

export const whereFiltering: Module = {
  id: "where-filtering",
  title: "WHERE / filtering",
  order: 2,
  summary: "Comparisons, AND/OR, IN, BETWEEN, and LIKE.",
  topics: ["filtering"],
  cheatsheetAnchor: "4-where-filtering-rows",
  drills,
  quiz,
  quizPassThreshold: 4,
  comprehensiveProblemIds: ["active-users", "signups-2023"],
  status: "authored",
};
