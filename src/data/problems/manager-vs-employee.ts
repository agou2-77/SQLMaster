import type { Problem } from "@/lib/problems/types";

export const managerVsEmployee: Problem = {
  id: "manager-vs-employee",
  title: "Employees earning more than their manager",
  difficulty: "easy",
  topics: ["joins"],
  description: `Each employee has a \`manager_id\` pointing at another row in the same table
(their manager). Return the \`name\` of every employee who **earns more than their
own manager**. Employees with no manager are never included.`,
  setupSql: `
CREATE TABLE employees (
  id         int PRIMARY KEY,
  name       text NOT NULL,
  salary     numeric(10, 2) NOT NULL,
  manager_id int REFERENCES employees(id)
);

INSERT INTO employees (id, name, salary, manager_id) VALUES
  (1, 'Sam',   90000, NULL),   -- top manager
  (2, 'Max',   85000, NULL),   -- top manager
  (3, 'Joe',   70000, 1),      -- manager Sam (90000) → earns less
  (4, 'Henry', 95000, 2),      -- manager Max (85000) → earns MORE ✓
  (5, 'Ivy',   88000, 1);      -- manager Sam (90000) → earns less
`,
  solutionSql: `SELECT e.name
FROM employees e
JOIN employees m ON e.manager_id = m.id
WHERE e.salary > m.salary;`,
  hints: [
    "You need to compare two rows of the *same* table — that's a self-join: join `employees` to `employees` again.",
    "Alias the table twice (e.g. `e` for the worker, `m` for the manager) and join `e.manager_id = m.id`, then compare `e.salary > m.salary`.",
  ],
};
