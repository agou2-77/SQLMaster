import type { Module } from "@/lib/modules/types";
import type { Problem } from "@/lib/problems/types";

// One tiny shared dataset for every drill and quiz question in this module, so
// each exercise is a short variation on the same familiar table. Department
// sizes are deliberately uneven (Engineering/Research have two people, Support
// and Design have one) so EXISTS / NOT EXISTS and per-department averages each
// return a non-trivial slice of the rows.
const SCHEMA = `
CREATE TABLE employees (
  id          int PRIMARY KEY,
  name        text NOT NULL,
  department  text NOT NULL,
  salary      int  NOT NULL   -- monthly pay
);

INSERT INTO employees (id, name, department, salary) VALUES
  (1, 'Ada Lovelace',      'Engineering', 9200),
  (2, 'Grace Hopper',      'Engineering', 7800),
  (3, 'Alan Turing',       'Research',    8600),
  (4, 'Katherine Johnson', 'Research',    7100),
  (5, 'Linus Torvalds',    'Support',     6400),
  (6, 'Margaret Hamilton', 'Design',      8100);
`;

const drills: Problem[] = [
  {
    id: "drill-subqueries-1",
    title: "Above the company average",
    difficulty: "easy",
    topics: ["subqueries"],
    description: `The \`employees\` table lists everyone at the company, each with a \`department\` and a monthly \`salary\`.

Return the \`name\` and \`salary\` of every employee who earns **more than the company-wide average salary**.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT name, salary FROM employees WHERE salary > (SELECT AVG(salary) FROM employees);`,
    hints: [
      "A **scalar subquery** in parentheses stands in for a single value — compute the average with `(SELECT AVG(salary) FROM employees)` and compare each row against it.",
      "Full answer: `SELECT name, salary FROM employees WHERE salary > (SELECT AVG(salary) FROM employees);`",
    ],
  },
  {
    id: "drill-subqueries-2",
    title: "Match against a list (IN)",
    difficulty: "easy",
    topics: ["subqueries"],
    description: `Return the \`name\` and \`department\` of every employee who works in a department that has **at least one employee earning more than 8000**.

Use a subquery to build the list of qualifying departments.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT name, department FROM employees WHERE department IN (SELECT department FROM employees WHERE salary > 8000);`,
    hints: [
      "`IN (subquery)` keeps a row when its value matches **any** value the subquery returns.",
      "The inner query should return the `department` of everyone earning more than 8000.",
      "Full answer: `SELECT name, department FROM employees WHERE department IN (SELECT department FROM employees WHERE salary > 8000);`",
    ],
  },
  {
    id: "drill-subqueries-3",
    title: "The only one in the department (NOT EXISTS)",
    difficulty: "medium",
    topics: ["subqueries"],
    description: `Return the \`name\` and \`department\` of every employee who is the **only person in their department** — nobody else shares it.

Use \`NOT EXISTS\` with a correlated subquery.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT name, department FROM employees e WHERE NOT EXISTS (SELECT 1 FROM employees other WHERE other.department = e.department AND other.id <> e.id);`,
    hints: [
      "A **correlated** subquery references the outer row (here, `e.department`). `NOT EXISTS (...)` is true when the inner query finds no matching rows.",
      "Inside, look for a *different* employee (`other.id <> e.id`) in the same department.",
      "Full answer: `SELECT name, department FROM employees e WHERE NOT EXISTS (SELECT 1 FROM employees other WHERE other.department = e.department AND other.id <> e.id);`",
    ],
  },
  {
    id: "drill-subqueries-4",
    title: "Has a co-worker (EXISTS)",
    difficulty: "medium",
    topics: ["subqueries"],
    description: `Return the \`name\` and \`department\` of every employee who **shares their department with at least one colleague**.

Use a correlated \`EXISTS\` subquery.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT name, department FROM employees e WHERE EXISTS (SELECT 1 FROM employees other WHERE other.department = e.department AND other.id <> e.id);`,
    hints: [
      "`EXISTS (...)` is true as soon as the correlated inner query returns **one** row — you never need to count.",
      "Look for another employee (`other.id <> e.id`) in the same `department`.",
      "Full answer: `SELECT name, department FROM employees e WHERE EXISTS (SELECT 1 FROM employees other WHERE other.department = e.department AND other.id <> e.id);`",
    ],
  },
  {
    id: "drill-subqueries-5",
    title: "Above your own department's average",
    difficulty: "medium",
    topics: ["subqueries"],
    description: `Return the \`name\`, \`department\`, and \`salary\` of every employee who earns **more than the average salary of their own department**.

The subquery must be **correlated** — its average depends on the outer row's \`department\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT name, department, salary FROM employees e WHERE salary > (SELECT AVG(salary) FROM employees d WHERE d.department = e.department);`,
    hints: [
      "Unlike a plain scalar subquery, this inner query is filtered by the outer row: `WHERE d.department = e.department`.",
      "Compare each `salary` against `(SELECT AVG(salary) FROM employees d WHERE d.department = e.department)`.",
      "Full answer: `SELECT name, department, salary FROM employees e WHERE salary > (SELECT AVG(salary) FROM employees d WHERE d.department = e.department);`",
    ],
  },
  {
    id: "drill-subqueries-6",
    title: "Add the top salary as a column",
    difficulty: "easy",
    topics: ["subqueries"],
    description: `For every employee return their \`name\` and \`salary\`, plus the **highest salary in the whole company** in a column named \`top_salary\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT name, salary, (SELECT MAX(salary) FROM employees) AS top_salary FROM employees;`,
    enforceColumnNames: true,
    hints: [
      "A scalar subquery can appear right in the `SELECT` list — it runs once and its single value repeats on every row.",
      "Alias it with `AS top_salary`.",
      "Full answer: `SELECT name, salary, (SELECT MAX(salary) FROM employees) AS top_salary FROM employees;`",
    ],
  },
];

const quiz: Problem[] = [
  {
    id: "quiz-subqueries-1",
    title: "Below the average",
    difficulty: "easy",
    topics: ["subqueries"],
    description: `Return the \`name\` and \`salary\` of every employee who earns **less than the company-wide average salary**.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT name, salary FROM employees WHERE salary < (SELECT AVG(salary) FROM employees);`,
    hints: ["Compare `salary` against the scalar subquery `(SELECT AVG(salary) FROM employees)`."],
  },
  {
    id: "quiz-subqueries-2",
    title: "In a high-paying department",
    difficulty: "easy",
    topics: ["subqueries"],
    description: `Return the \`name\` and \`department\` of every employee who works in a department that has **at least one employee earning more than 8500**.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT name, department FROM employees WHERE department IN (SELECT department FROM employees WHERE salary > 8500);`,
    hints: ["Build the list of qualifying departments with a subquery, then filter with `department IN (...)`."],
  },
  {
    id: "quiz-subqueries-3",
    title: "Someone earns more",
    difficulty: "medium",
    topics: ["subqueries"],
    description: `Return the \`name\` of every employee who has a **colleague in the same department earning more than they do**.

Use a correlated \`EXISTS\` subquery.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT name FROM employees e WHERE EXISTS (SELECT 1 FROM employees other WHERE other.department = e.department AND other.salary > e.salary);`,
    hints: ["The correlated inner query should look for a same-department row whose `salary` is greater than the outer row's `salary`."],
  },
  {
    id: "quiz-subqueries-4",
    title: "Above the department average",
    difficulty: "medium",
    topics: ["subqueries"],
    description: `Return the \`name\` of every employee whose \`salary\` is **greater than the average salary of their own department**.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT name FROM employees e WHERE salary > (SELECT AVG(salary) FROM employees d WHERE d.department = e.department);`,
    hints: ["Correlate the inner `AVG` to the outer row with `WHERE d.department = e.department`."],
  },
  {
    id: "quiz-subqueries-5",
    title: "Second-highest salary",
    difficulty: "medium",
    topics: ["subqueries"],
    description: `Return a single value: the **second-highest** \`salary\` in the \`employees\` table.

Use a subquery to exclude the maximum salary first.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees);`,
    hints: ["Take the largest salary that is still **less than** the overall maximum."],
  },
];

export const subqueries: Module = {
  id: "subqueries",
  title: "Subqueries",
  order: 8,
  summary: "Scalar, IN, EXISTS, and correlated subqueries.",
  topics: ["subqueries"],
  cheatsheetAnchor: "9-subqueries",
  drills,
  quiz,
  quizPassThreshold: 4,
  comprehensiveProblemIds: ["employees-above-dept-avg", "second-highest-salary"],
  comprehensivePathIds: ["subqueries"],
  status: "authored",
};
