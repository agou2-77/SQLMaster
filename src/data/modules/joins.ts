import type { Module } from "@/lib/modules/types";
import type { Problem } from "@/lib/problems/types";

// One tiny shared dataset for every drill and quiz question in this module, so
// each exercise is a short variation on the same familiar tables. `customers`
// and `orders` are a classic one-to-many pair (Carol has never ordered), while
// `employees` self-references via `manager_id` (Diana has no manager).
const SCHEMA = `
CREATE TABLE customers (
  id    int PRIMARY KEY,
  name  text NOT NULL
);

CREATE TABLE orders (
  id           int PRIMARY KEY,
  customer_id  int NOT NULL REFERENCES customers(id),
  amount       int NOT NULL   -- order total in dollars
);

CREATE TABLE employees (
  id          int PRIMARY KEY,
  name        text NOT NULL,
  manager_id  int REFERENCES employees(id)   -- NULL for the top boss
);

INSERT INTO customers (id, name) VALUES
  (1, 'Alice'),
  (2, 'Bob'),
  (3, 'Carol');   -- Carol has placed no orders

INSERT INTO orders (id, customer_id, amount) VALUES
  (101, 1, 120),
  (102, 1, 90),
  (103, 2, 200);

INSERT INTO employees (id, name, manager_id) VALUES
  (1, 'Diana',  NULL),
  (2, 'Evan',   1),
  (3, 'Fiona',  1),
  (4, 'George', 2);
`;

const drills: Problem[] = [
  {
    id: "drill-joins-1",
    title: "Inner join two tables",
    difficulty: "easy",
    topics: ["joins"],
    description: `Each row in \`orders\` points at a customer via \`customer_id\`.

Return the customer \`name\` and the \`amount\` for every order, matching each order to its customer with an \`INNER JOIN\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT customers.name, orders.amount FROM customers JOIN orders ON customers.id = orders.customer_id;`,
    hints: [
      "Join `customers` to `orders`, matching `customers.id` to `orders.customer_id`.",
      "The join condition goes in an `ON` clause: `... JOIN orders ON customers.id = orders.customer_id`.",
      "Full answer: `SELECT customers.name, orders.amount FROM customers JOIN orders ON customers.id = orders.customer_id;`",
    ],
  },
  {
    id: "drill-joins-2",
    title: "Aliases for both tables",
    difficulty: "easy",
    topics: ["joins"],
    description: `Typing full table names gets tedious. Give \`customers\` the alias \`c\` and \`orders\` the alias \`o\`, then return the customer \`name\`, the order \`id\`, and the \`amount\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT c.name, o.id, o.amount FROM customers c JOIN orders o ON c.id = o.customer_id;`,
    hints: [
      "Put a short alias right after the table name: `FROM customers c`.",
      "Prefix each column with its table's alias, e.g. `c.name` and `o.amount`.",
      "Full answer: `SELECT c.name, o.id, o.amount FROM customers c JOIN orders o ON c.id = o.customer_id;`",
    ],
  },
  {
    id: "drill-joins-3",
    title: "Keep unmatched rows with LEFT JOIN",
    difficulty: "easy",
    topics: ["joins"],
    description: `An \`INNER JOIN\` drops customers who have no orders. Use a \`LEFT JOIN\` instead so **every** customer appears — return each customer's \`name\` and the order \`amount\` (which is \`NULL\` for customers with no orders).`,
    setupSql: SCHEMA,
    solutionSql: `SELECT c.name, o.amount FROM customers c LEFT JOIN orders o ON c.id = o.customer_id;`,
    hints: [
      "A `LEFT JOIN` keeps every row from the left table even when nothing matches on the right.",
      "Columns from the right table (`o.amount`) come back as `NULL` when there is no match.",
      "Full answer: `SELECT c.name, o.amount FROM customers c LEFT JOIN orders o ON c.id = o.customer_id;`",
    ],
  },
  {
    id: "drill-joins-4",
    title: "Find rows with no match (anti-join)",
    difficulty: "medium",
    topics: ["joins"],
    description: `Which customers have **never** placed an order?

\`LEFT JOIN\` \`orders\`, then keep only the rows where no order matched. Return the customer \`name\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT c.name FROM customers c LEFT JOIN orders o ON c.id = o.customer_id WHERE o.id IS NULL;`,
    hints: [
      "After a `LEFT JOIN`, unmatched rows have `NULL` in every right-table column.",
      "Filter with `WHERE o.id IS NULL` to keep only the customers with no matching order.",
      "Full answer: `SELECT c.name FROM customers c LEFT JOIN orders o ON c.id = o.customer_id WHERE o.id IS NULL;`",
    ],
  },
  {
    id: "drill-joins-5",
    title: "Self-join: employee and manager",
    difficulty: "medium",
    topics: ["joins"],
    description: `The \`employees\` table references itself: \`manager_id\` points at another employee's \`id\`.

Join the table to itself to pair each employee with their manager. Return two columns: the employee's name as \`employee\` and the manager's name as \`manager\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT e.name AS employee, m.name AS manager FROM employees e JOIN employees m ON e.manager_id = m.id;`,
    enforceColumnNames: true,
    hints: [
      "List `employees` twice with two different aliases, e.g. `e` for the worker and `m` for the manager.",
      "Match them with `ON e.manager_id = m.id`, then alias the two name columns to `employee` and `manager`.",
      "Full answer: `SELECT e.name AS employee, m.name AS manager FROM employees e JOIN employees m ON e.manager_id = m.id;`",
    ],
  },
  {
    id: "drill-joins-6",
    title: "Join, then aggregate",
    difficulty: "medium",
    topics: ["joins"],
    description: `Combine a join with a \`GROUP BY\`. For each customer who has placed at least one order, return their \`name\` and the total of their order amounts in a column named \`total_spent\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT c.name, SUM(o.amount) AS total_spent FROM customers c JOIN orders o ON c.id = o.customer_id GROUP BY c.name;`,
    enforceColumnNames: true,
    hints: [
      "Start from the same inner join of `customers` and `orders`.",
      "Group by the customer, then use `SUM(o.amount)` aliased as `total_spent`.",
      "Full answer: `SELECT c.name, SUM(o.amount) AS total_spent FROM customers c JOIN orders o ON c.id = o.customer_id GROUP BY c.name;`",
    ],
  },
];

const quiz: Problem[] = [
  {
    id: "quiz-joins-1",
    title: "Match orders to customers",
    difficulty: "easy",
    topics: ["joins"],
    description: `Return the customer \`name\` and the \`amount\` for every order, using an \`INNER JOIN\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT c.name, o.amount FROM customers c JOIN orders o ON c.id = o.customer_id;`,
    hints: ["Join on `customers.id = orders.customer_id`."],
  },
  {
    id: "quiz-joins-2",
    title: "Every customer, matched or not",
    difficulty: "easy",
    topics: ["joins"],
    description: `Return each customer's \`name\` and their order \`amount\`, keeping customers who have no orders (their \`amount\` will be \`NULL\`).`,
    setupSql: SCHEMA,
    solutionSql: `SELECT c.name, o.amount FROM customers c LEFT JOIN orders o ON c.id = o.customer_id;`,
    hints: ["A `LEFT JOIN` keeps every row from the left-hand table."],
  },
  {
    id: "quiz-joins-3",
    title: "Customers with no orders",
    difficulty: "medium",
    topics: ["joins"],
    description: `Return the \`name\` of every customer who has never placed an order.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT c.name FROM customers c LEFT JOIN orders o ON c.id = o.customer_id WHERE o.id IS NULL;`,
    hints: ["`LEFT JOIN`, then keep rows where the order side `IS NULL`."],
  },
  {
    id: "quiz-joins-4",
    title: "Pair employees with managers",
    difficulty: "medium",
    topics: ["joins"],
    description: `Join \`employees\` to itself and return the employee's name as \`employee_name\` and their manager's name as \`manager_name\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT e.name AS employee_name, m.name AS manager_name FROM employees e JOIN employees m ON e.manager_id = m.id;`,
    enforceColumnNames: true,
    hints: ["Use two aliases for the same table and match `manager_id` to `id`."],
  },
  {
    id: "quiz-joins-5",
    title: "Count orders per customer",
    difficulty: "medium",
    topics: ["joins"],
    description: `For each customer who has placed at least one order, return their \`name\` and the number of orders they placed in a column named \`order_count\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT c.name, COUNT(o.id) AS order_count FROM customers c JOIN orders o ON c.id = o.customer_id GROUP BY c.name;`,
    enforceColumnNames: true,
    hints: ["Inner join, then `GROUP BY` the customer and `COUNT` the orders."],
  },
];

export const joins: Module = {
  id: "joins",
  title: "Joins",
  order: 7,
  summary: "INNER, LEFT, and self-joins across tables.",
  topics: ["joins"],
  cheatsheetAnchor: "8-joins",
  drills,
  quiz,
  quizPassThreshold: 4,
  comprehensiveProblemIds: ["products-never-ordered", "manager-vs-employee"],
  comprehensivePathIds: ["joins-and-grouping"],
  status: "authored",
};
