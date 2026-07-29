import type { Module } from "@/lib/modules/types";
import type { Problem } from "@/lib/problems/types";

// One tiny shared dataset for every drill and quiz question in this module, so
// each exercise is a short variation on the same familiar table. Salaries span
// three bands and departments repeat, so every CASE below produces a mix of
// buckets rather than one label for the whole table.
const SCHEMA = `
CREATE TABLE employees (
  id          int PRIMARY KEY,
  name        text NOT NULL,
  department  text NOT NULL,
  salary      int  NOT NULL   -- monthly pay
);

INSERT INTO employees (id, name, department, salary) VALUES
  (1, 'Ada Lovelace',      'Engineering', 8200),
  (2, 'Grace Hopper',      'Engineering', 9100),
  (3, 'Katherine Johnson', 'Research',    7600),
  (4, 'Alan Turing',       'Research',    8800),
  (5, 'Linus Torvalds',    'Support',     6400),
  (6, 'Margaret Hamilton', 'Engineering', 6800);
`;

const drills: Problem[] = [
  {
    id: "drill-case-expressions-1",
    title: "Bucket a number into labels",
    difficulty: "easy",
    topics: ["filtering"],
    description: `A **searched** \`CASE\` walks its \`WHEN\` branches top to bottom and returns the first that matches.

Return each employee's \`name\` and a \`band\` column: \`'low'\` when \`salary\` is under 7000, \`'mid'\` when it is under 9000, and \`'high'\` at 9000 or more.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT name,
  CASE
    WHEN salary < 7000 THEN 'low'
    WHEN salary < 9000 THEN 'mid'
    WHEN salary >= 9000 THEN 'high'
  END AS band
FROM employees;`,
    enforceColumnNames: true,
    hints: [
      "Start with `CASE`, list one `WHEN ... THEN ...` per band, and close with `END`.",
      "Branches are checked in order, so once `salary < 7000` is handled the next `WHEN salary < 9000` only sees the rest.",
      "Full answer: `SELECT name, CASE WHEN salary < 7000 THEN 'low' WHEN salary < 9000 THEN 'mid' WHEN salary >= 9000 THEN 'high' END AS band FROM employees;`",
    ],
  },
  {
    id: "drill-case-expressions-2",
    title: "ELSE for the default",
    difficulty: "easy",
    topics: ["filtering"],
    description: `\`ELSE\` gives a fallback value for every row that no \`WHEN\` matched (without it, unmatched rows get \`NULL\`).

Return each employee's \`name\` and a \`level\` column that is \`'senior'\` when \`salary\` is 8500 or more, and \`'junior'\` for everyone else.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT name,
  CASE
    WHEN salary >= 8500 THEN 'senior'
    ELSE 'junior'
  END AS level
FROM employees;`,
    enforceColumnNames: true,
    hints: [
      "Only one `WHEN` is needed; `ELSE` covers the rest.",
      "Full answer: `SELECT name, CASE WHEN salary >= 8500 THEN 'senior' ELSE 'junior' END AS level FROM employees;`",
    ],
  },
  {
    id: "drill-case-expressions-3",
    title: "Label from a text column",
    difficulty: "easy",
    topics: ["filtering"],
    description: `\`WHEN\` conditions can test any column, including text.

Return each employee's \`name\` and a \`role_summary\` column: \`'Builds the product'\` for \`Engineering\`, \`'Explores new ideas'\` for \`Research\`, and \`'Keeps things running'\` for \`Support\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT name,
  CASE
    WHEN department = 'Engineering' THEN 'Builds the product'
    WHEN department = 'Research' THEN 'Explores new ideas'
    WHEN department = 'Support' THEN 'Keeps things running'
  END AS role_summary
FROM employees;`,
    enforceColumnNames: true,
    hints: [
      "Compare `department` to each text value with `=` inside a `WHEN`.",
      "Wrap the literals in single quotes, e.g. `WHEN department = 'Research' THEN ...`.",
      "Full answer: `SELECT name, CASE WHEN department = 'Engineering' THEN 'Builds the product' WHEN department = 'Research' THEN 'Explores new ideas' WHEN department = 'Support' THEN 'Keeps things running' END AS role_summary FROM employees;`",
    ],
  },
  {
    id: "drill-case-expressions-4",
    title: "Two conditions in one WHEN",
    difficulty: "medium",
    topics: ["filtering"],
    description: `A single \`WHEN\` can combine tests with \`AND\` / \`OR\`.

Return each employee's \`name\` and a \`flag\` column:
- \`'key engineer'\` when \`department\` is \`Engineering\` **and** \`salary\` is at least 8000,
- \`'watch'\` when \`department\` is \`Research\` **or** \`salary\` is at least 9000,
- \`'standard'\` otherwise.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT name,
  CASE
    WHEN department = 'Engineering' AND salary >= 8000 THEN 'key engineer'
    WHEN department = 'Research' OR salary >= 9000 THEN 'watch'
    ELSE 'standard'
  END AS flag
FROM employees;`,
    enforceColumnNames: true,
    hints: [
      "Put the whole boolean test between `WHEN` and `THEN`, e.g. `WHEN a = 'x' AND b >= 1 THEN ...`.",
      "Order matters: a row that already matched `'key engineer'` never reaches the `'watch'` branch.",
      "Full answer: `SELECT name, CASE WHEN department = 'Engineering' AND salary >= 8000 THEN 'key engineer' WHEN department = 'Research' OR salary >= 9000 THEN 'watch' ELSE 'standard' END AS flag FROM employees;`",
    ],
  },
  {
    id: "drill-case-expressions-5",
    title: "Conditional count",
    difficulty: "medium",
    topics: ["filtering"],
    description: `Wrapping a \`CASE\` in \`SUM(...)\` counts only the rows that match — a classic **conditional aggregation**.

Return a single number in a column named \`high_earners\`: how many employees have a \`salary\` of at least 8000.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT SUM(CASE WHEN salary >= 8000 THEN 1 ELSE 0 END) AS high_earners
FROM employees;`,
    enforceColumnNames: true,
    hints: [
      "Give matching rows `1` and the rest `0`, then add them up.",
      "`SUM(CASE WHEN <condition> THEN 1 ELSE 0 END)` totals the matches.",
      "Full answer: `SELECT SUM(CASE WHEN salary >= 8000 THEN 1 ELSE 0 END) AS high_earners FROM employees;`",
    ],
  },
  {
    id: "drill-case-expressions-6",
    title: "Simple CASE form",
    difficulty: "easy",
    topics: ["filtering"],
    description: `When every branch checks the **same** column for equality, the *simple* \`CASE\` form is shorter: write the column once after \`CASE\`, then just list the values.

Return each employee's \`name\` and a \`dept_code\` column: \`'ENG'\` for \`Engineering\`, \`'RES'\` for \`Research\`, and \`'OPS'\` for anything else.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT name,
  CASE department
    WHEN 'Engineering' THEN 'ENG'
    WHEN 'Research' THEN 'RES'
    ELSE 'OPS'
  END AS dept_code
FROM employees;`,
    enforceColumnNames: true,
    hints: [
      "Put the column right after `CASE`: `CASE department WHEN 'Engineering' THEN ...`.",
      "Each `WHEN` now holds just a value to match, not a full condition.",
      "Full answer: `SELECT name, CASE department WHEN 'Engineering' THEN 'ENG' WHEN 'Research' THEN 'RES' ELSE 'OPS' END AS dept_code FROM employees;`",
    ],
  },
];

const quiz: Problem[] = [
  {
    id: "quiz-case-expressions-1",
    title: "Salary tiers",
    difficulty: "easy",
    topics: ["filtering"],
    description: `Return each employee's \`name\` and a \`tier\` column: \`'entry'\` when \`salary\` is under 7000, \`'mid'\` when it is under 8500, and \`'senior'\` otherwise.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT name,
  CASE
    WHEN salary < 7000 THEN 'entry'
    WHEN salary < 8500 THEN 'mid'
    ELSE 'senior'
  END AS tier
FROM employees;`,
    enforceColumnNames: true,
    hints: ["Order the `WHEN` branches from lowest threshold up, then let `ELSE` handle the top tier."],
  },
  {
    id: "quiz-case-expressions-2",
    title: "Count one department",
    difficulty: "medium",
    topics: ["filtering"],
    description: `Return a single number in a column named \`eng_count\`: how many employees work in \`Engineering\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT SUM(CASE WHEN department = 'Engineering' THEN 1 ELSE 0 END) AS eng_count
FROM employees;`,
    enforceColumnNames: true,
    hints: ["Sum a `CASE` that is `1` for Engineering rows and `0` otherwise."],
  },
  {
    id: "quiz-case-expressions-3",
    title: "Status from department",
    difficulty: "easy",
    topics: ["filtering"],
    description: `Return each employee's \`name\` and a \`status\` column: \`'core'\` for \`Engineering\`, \`'partner'\` for \`Research\`, and \`'external'\` for everyone else.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT name,
  CASE
    WHEN department = 'Engineering' THEN 'core'
    WHEN department = 'Research' THEN 'partner'
    ELSE 'external'
  END AS status
FROM employees;`,
    enforceColumnNames: true,
    hints: ["Test `department` in each `WHEN`, and let `ELSE` cover the remaining departments."],
  },
  {
    id: "quiz-case-expressions-4",
    title: "Two-part condition",
    difficulty: "medium",
    topics: ["filtering"],
    description: `Return each employee's \`name\` and a \`bonus\` column that is \`'bonus'\` when \`department\` is \`Research\` **and** \`salary\` is at least 8000, and \`'none'\` for everyone else.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT name,
  CASE
    WHEN department = 'Research' AND salary >= 8000 THEN 'bonus'
    ELSE 'none'
  END AS bonus
FROM employees;`,
    enforceColumnNames: true,
    hints: ["Combine both tests with `AND` inside a single `WHEN`."],
  },
  {
    id: "quiz-case-expressions-5",
    title: "Order by CASE",
    difficulty: "medium",
    topics: ["filtering"],
    description: `A \`CASE\` can go in \`ORDER BY\` to define a custom sort.

Return each employee's \`name\` and \`department\`, sorted so \`Engineering\` rows come first, then \`Research\`, then everyone else. Break ties by \`name\` (A→Z).`,
    setupSql: SCHEMA,
    solutionSql: `SELECT name, department
FROM employees
ORDER BY
  CASE department
    WHEN 'Engineering' THEN 1
    WHEN 'Research' THEN 2
    ELSE 3
  END,
  name;`,
    ordered: true,
    hints: ["Map each department to a sort number with a `CASE` in `ORDER BY`, then add `name` as a tiebreaker."],
  },
];

export const caseExpressions: Module = {
  id: "case-expressions",
  title: "CASE expressions",
  order: 10,
  summary: "Conditional logic inside a query.",
  topics: ["filtering"],
  cheatsheetAnchor: "13-case",
  drills,
  quiz,
  quizPassThreshold: 4,
  comprehensiveProblemIds: ["tree-node-type"],
  status: "authored",
};
