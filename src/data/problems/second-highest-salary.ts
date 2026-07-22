import type { Problem } from "@/lib/problems/types";

export const secondHighestSalary: Problem = {
  id: "second-highest-salary",
  title: "Second-highest salary",
  difficulty: "medium",
  topics: ["subqueries", "aggregation"],
  description: `Return the **second-highest distinct salary** from the \`employees\` table
as a single value.`,
  setupSql: `
CREATE TABLE employees (
  id     int PRIMARY KEY,
  name   text NOT NULL,
  salary numeric(10, 2) NOT NULL
);

INSERT INTO employees (id, name, salary) VALUES
  (1, 'Ada',  120000),
  (2, 'Bji',  100000),
  (3, 'Cleo', 100000),
  (4, 'Dee',   90000),
  (5, 'Eli',   80000);
`,
  solutionSql: `SELECT MAX(salary) AS second_highest
FROM employees
WHERE salary < (SELECT MAX(salary) FROM employees);`,
  hints: [
    "The second highest is the maximum among salaries strictly below the overall maximum.",
    "`SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees)` — or `ORDER BY salary DESC` on distinct salaries with `LIMIT 1 OFFSET 1`.",
  ],
};
