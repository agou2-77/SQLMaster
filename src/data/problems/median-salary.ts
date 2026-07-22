import type { Problem } from "@/lib/problems/types";

export const medianSalary: Problem = {
  id: "median-salary",
  title: "Median salary per company",
  difficulty: "hard",
  topics: ["window-functions", "aggregation", "ctes"],
  description: `Return the **median** \`salary\` for each \`company\`. The median is the middle value
when salaries are sorted; if a company has an **even** number of employees, it is
the **average of the two middle values**.

Return \`company\` and \`median\`.`,
  setupSql: `
CREATE TABLE employees (
  id      int PRIMARY KEY,
  company text NOT NULL,
  salary  int  NOT NULL
);

INSERT INTO employees (id, company, salary) VALUES
  (1, 'A', 100),
  (2, 'A', 200),
  (3, 'A', 300),   -- A: odd → median 200
  (4, 'B', 100),
  (5, 'B', 200);   -- B: even → median (100+200)/2 = 150
`,
  solutionSql: `WITH ranked AS (
  SELECT company,
         salary,
         ROW_NUMBER() OVER (PARTITION BY company ORDER BY salary) AS rn,
         COUNT(*)     OVER (PARTITION BY company)                 AS cnt
  FROM employees
)
SELECT company, AVG(salary) AS median
FROM ranked
WHERE rn BETWEEN cnt / 2.0 AND cnt / 2.0 + 1
GROUP BY company;`,
  hints: [
    "Number the rows within each company by salary (`ROW_NUMBER() OVER (PARTITION BY company ORDER BY salary)`) and also get the group size (`COUNT(*) OVER (PARTITION BY company)`).",
    "The middle row(s) satisfy `rn BETWEEN cnt/2.0 AND cnt/2.0 + 1` — that's one row for odd counts, two for even. Average those salaries. (Postgres also has `PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY salary)`.)",
  ],
};
