import type { Problem } from "@/lib/problems/types";

export const departmentTop3Salaries: Problem = {
  id: "department-top-3-salaries",
  title: "Department top 3 salaries",
  difficulty: "hard",
  topics: ["window-functions", "ctes", "joins"],
  description: `A "high earner" is an employee whose salary is among the **top three distinct
salaries** in their department. Return \`department\`, \`employee\`, and \`salary\` for
every high earner.

Because ranking is by **distinct** salary, two employees tied at the top count as
the same (first) place, and more than three employees can qualify.`,
  setupSql: `
CREATE TABLE departments (
  id   int PRIMARY KEY,
  name text NOT NULL
);
CREATE TABLE employees (
  id            int PRIMARY KEY,
  name          text NOT NULL,
  salary        numeric(10, 2) NOT NULL,
  department_id int NOT NULL REFERENCES departments(id)
);

INSERT INTO departments (id, name) VALUES
  (1, 'IT'), (2, 'Sales');

INSERT INTO employees (id, name, salary, department_id) VALUES
  (1, 'Joe',   85000, 1),
  (2, 'Randy', 85000, 1),   -- tie for 1st distinct salary
  (3, 'Will',  70000, 1),   -- 2nd distinct
  (4, 'Janet', 69000, 1),   -- 3rd distinct
  (5, 'Ron',   60000, 1),   -- 4th → excluded
  (6, 'Henry', 80000, 2),
  (7, 'Sam',   60000, 2);
`,
  solutionSql: `WITH ranked AS (
  SELECT d.name AS department,
         e.name AS employee,
         e.salary,
         DENSE_RANK() OVER (PARTITION BY e.department_id ORDER BY e.salary DESC) AS rnk
  FROM employees e
  JOIN departments d ON d.id = e.department_id
)
SELECT department, employee, salary
FROM ranked
WHERE rnk <= 3;`,
  hints: [
    "\"Top three *distinct* salaries, ties share a place\" → `DENSE_RANK()` partitioned by department, ordered by salary descending.",
    "Compute the rank in a CTE, then keep `WHERE rnk <= 3`. (`RANK` or `ROW_NUMBER` would give the wrong answer here because of the tie.)",
  ],
};
