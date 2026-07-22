import type { Problem } from "@/lib/problems/types";

export const highestPaidPerDepartment: Problem = {
  id: "highest-paid-per-department",
  title: "Highest-paid employee per department",
  difficulty: "hard",
  topics: ["window-functions", "ctes", "joins"],
  description: `Return each department's \`department\` name and the \`employee\` name of its
**highest-paid** employee. Each department has a unique top salary (no ties).`,
  setupSql: `
CREATE TABLE departments (
  id   int PRIMARY KEY,
  name text NOT NULL
);
CREATE TABLE employees (
  id            int PRIMARY KEY,
  name          text NOT NULL,
  department_id int NOT NULL REFERENCES departments(id),
  salary        numeric(10, 2) NOT NULL
);

INSERT INTO departments (id, name) VALUES
  (1, 'Engineering'), (2, 'Sales');

INSERT INTO employees (id, name, department_id, salary) VALUES
  (1, 'Ada',  1, 120000),
  (2, 'Bji',  1, 90000),
  (3, 'Cleo', 2, 80000),
  (4, 'Dee',  2, 95000);
`,
  solutionSql: `WITH ranked AS (
  SELECT d.name AS department, e.name AS employee,
         ROW_NUMBER() OVER (PARTITION BY d.id ORDER BY e.salary DESC) AS rn
  FROM employees e
  JOIN departments d ON d.id = e.department_id
)
SELECT department, employee
FROM ranked
WHERE rn = 1;`,
  hints: [
    "Rank employees by salary within each department, then keep rank 1.",
    "`ROW_NUMBER() OVER (PARTITION BY d.id ORDER BY e.salary DESC)` in a CTE, filter `WHERE rn = 1`.",
  ],
};
