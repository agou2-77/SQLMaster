import type { Problem } from "@/lib/problems/types";

export const signups2023: Problem = {
  id: "signups-2023",
  title: "Users who signed up in 2023",
  difficulty: "easy",
  topics: ["filtering", "date-time"],
  description: `The \`users\` table has a \`created_at\` date for each signup.

Return the \`id\` and \`name\` of every user who signed up during the year **2023**.`,
  setupSql: `
CREATE TABLE users (
  id         int PRIMARY KEY,
  name       text NOT NULL,
  created_at date NOT NULL
);

INSERT INTO users (id, name, created_at) VALUES
  (1, 'Ada',       '2023-02-11'),
  (2, 'Linus',     '2022-08-01'),
  (3, 'Grace',     '2023-12-31'),
  (4, 'Alan',      '2021-06-23'),
  (5, 'Katherine', '2024-01-02'),
  (6, 'Edsger',    '2023-01-01');
`,
  solutionSql: `SELECT id, name FROM users
WHERE created_at >= '2023-01-01' AND created_at < '2024-01-01';`,
  hints: [
    "A date range from Jan 1 2023 up to (but not including) Jan 1 2024 captures the whole year.",
    "`WHERE created_at >= '2023-01-01' AND created_at < '2024-01-01'` — or use `EXTRACT(YEAR FROM created_at) = 2023`.",
  ],
};
