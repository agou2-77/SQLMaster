import type { Problem } from "@/lib/problems/types";

export const employeesAboveDeptAvg: Problem = {
  id: "employees-above-dept-avg",
  title: "Employees earning above their department average",
  difficulty: "medium",
  topics: ["subqueries", "aggregation"],
  description: `Return the \`name\` and \`salary\` of every employee who earns **more than the
average salary of their own department**.`,
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
  (1, 'Ada',   1, 120000),
  (2, 'Bji',   1, 90000),
  (3, 'Cleo',  1, 100000),   -- Eng avg = 103333.33 → only Ada is above
  (4, 'Dee',   2, 60000),
  (5, 'Eli',   2, 80000);    -- Sales avg = 70000 → only Eli is above
`,
  solutionSql: `SELECT e.name, e.salary
FROM employees e
WHERE e.salary > (
  SELECT AVG(e2.salary)
  FROM employees e2
  WHERE e2.department_id = e.department_id
);`,
  hints: [
    "For each employee you need the average salary of *their* department — a correlated subquery.",
    "In the subquery, filter `WHERE e2.department_id = e.department_id` so it recomputes per employee.",
  ],
};
