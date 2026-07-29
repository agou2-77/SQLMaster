import type { Module } from "@/lib/modules/types";
import type { Problem } from "@/lib/problems/types";

// One tiny shared dataset for every drill and quiz question in this module, so
// each exercise is a short variation on the same familiar table.
const SCHEMA = `
CREATE TABLE employees (
  id          int PRIMARY KEY,
  name        text NOT NULL,
  department  text NOT NULL,
  salary      int  NOT NULL,   -- monthly pay
  hired_on    date NOT NULL
);

INSERT INTO employees (id, name, department, salary, hired_on) VALUES
  (1, 'Ada Lovelace',   'Engineering', 8200, '2021-03-01'),
  (2, 'Grace Hopper',   'Engineering', 9100, '2020-07-15'),
  (3, 'Katherine Johnson', 'Research',  7600, '2019-11-02'),
  (4, 'Alan Turing',    'Research',    8800, '2018-05-20'),
  (5, 'Linus Torvalds', 'Support',     6400, '2022-01-10');
`;

const drills: Problem[] = [
  {
    id: "drill-select-basics-1",
    title: "Pick two columns",
    difficulty: "easy",
    topics: ["filtering"],
    description: `The \`employees\` table lists everyone at the company.

Return just the \`id\` and \`name\` of every employee.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT id, name FROM employees;`,
    hints: [
      "List the columns you want, separated by commas, between `SELECT` and `FROM`.",
      "Full answer: `SELECT id, name FROM employees;`",
    ],
  },
  {
    id: "drill-select-basics-2",
    title: "Select every column",
    difficulty: "easy",
    topics: ["filtering"],
    description: `Return **every** column for every employee.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT * FROM employees;`,
    hints: [
      "`*` is shorthand for all columns.",
      "Full answer: `SELECT * FROM employees;`",
    ],
  },
  {
    id: "drill-select-basics-3",
    title: "Rename a column",
    difficulty: "easy",
    topics: ["filtering"],
    description: `Return each employee's \`name\`, but label the output column \`employee_name\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT name AS employee_name FROM employees;`,
    enforceColumnNames: true,
    hints: [
      "Use `AS` to give a column a different output name (an alias).",
      "Full answer: `SELECT name AS employee_name FROM employees;`",
    ],
  },
  {
    id: "drill-select-basics-4",
    title: "Distinct values",
    difficulty: "easy",
    topics: ["filtering"],
    description: `List each **distinct** \`department\` — no duplicates.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT DISTINCT department FROM employees;`,
    hints: [
      "`DISTINCT` removes duplicate rows from the result.",
      "Full answer: `SELECT DISTINCT department FROM employees;`",
    ],
  },
  {
    id: "drill-select-basics-5",
    title: "Compute a column",
    difficulty: "easy",
    topics: ["filtering"],
    description: `\`salary\` is a **monthly** figure. Return each employee's \`name\` and their annual salary (monthly salary × 12) in a column named \`annual_salary\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT name, salary * 12 AS annual_salary FROM employees;`,
    enforceColumnNames: true,
    hints: [
      "You can do arithmetic directly in the `SELECT` list.",
      "Multiply `salary` by 12 and alias it with `AS annual_salary`.",
      "Full answer: `SELECT name, salary * 12 AS annual_salary FROM employees;`",
    ],
  },
  {
    id: "drill-select-basics-6",
    title: "Rename while selecting",
    difficulty: "easy",
    topics: ["filtering"],
    description: `Return each employee's \`name\` and \`salary\`, but rename the salary column to \`monthly_pay\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT name, salary AS monthly_pay FROM employees;`,
    enforceColumnNames: true,
    hints: [
      "Alias only the salary column; leave `name` as-is.",
      "Full answer: `SELECT name, salary AS monthly_pay FROM employees;`",
    ],
  },
];

const quiz: Problem[] = [
  {
    id: "quiz-select-basics-1",
    title: "Two columns",
    difficulty: "easy",
    topics: ["filtering"],
    description: `Return the \`id\` and \`department\` of every employee.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT id, department FROM employees;`,
    hints: ["List the two columns between `SELECT` and `FROM`."],
  },
  {
    id: "quiz-select-basics-2",
    title: "All columns",
    difficulty: "easy",
    topics: ["filtering"],
    description: `Return every column for every employee.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT * FROM employees;`,
    hints: ["`*` selects all columns."],
  },
  {
    id: "quiz-select-basics-3",
    title: "Distinct departments",
    difficulty: "easy",
    topics: ["filtering"],
    description: `List each distinct \`department\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT DISTINCT department FROM employees;`,
    hints: ["`DISTINCT` drops duplicate rows."],
  },
  {
    id: "quiz-select-basics-4",
    title: "Alias the name",
    difficulty: "easy",
    topics: ["filtering"],
    description: `Return each employee's \`name\` in a column called \`full_name\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT name AS full_name FROM employees;`,
    enforceColumnNames: true,
    hints: ["Use `AS full_name`."],
  },
  {
    id: "quiz-select-basics-5",
    title: "Yearly salary",
    difficulty: "easy",
    topics: ["filtering"],
    description: `Return each employee's \`name\` and their yearly salary (monthly \`salary\` × 12) in a column named \`yearly_salary\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT name, salary * 12 AS yearly_salary FROM employees;`,
    enforceColumnNames: true,
    hints: ["Multiply `salary` by 12 and alias with `AS yearly_salary`."],
  },
];

export const selectBasics: Module = {
  id: "select-basics",
  title: "SELECT basics",
  order: 1,
  summary: "Choosing columns, aliasing with AS, DISTINCT, and computed columns.",
  topics: ["filtering"],
  cheatsheetAnchor: "3-select-basics",
  drills,
  quiz,
  quizPassThreshold: 4,
  comprehensiveProblemIds: ["active-users"],
  comprehensivePathIds: ["sql-basics"],
  status: "authored",
};
