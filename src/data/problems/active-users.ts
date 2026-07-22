import type { Problem } from "@/lib/problems/types";

export const activeUsers: Problem = {
  id: "active-users",
  title: "Select active users",
  difficulty: "easy",
  topics: ["filtering"],
  description: `The \`users\` table tracks everyone who signed up.

Return the \`id\` and \`name\` of every **active** user (\`is_active = true\`).`,
  setupSql: `
CREATE TABLE users (
  id         int PRIMARY KEY,
  name       text NOT NULL,
  is_active  boolean NOT NULL,
  created_at date NOT NULL
);

INSERT INTO users (id, name, is_active, created_at) VALUES
  (1, 'Ada Lovelace',    true,  '2023-02-11'),
  (2, 'Linus Torvalds',  false, '2022-08-01'),
  (3, 'Grace Hopper',    true,  '2024-01-20'),
  (4, 'Alan Turing',     true,  '2021-06-23'),
  (5, 'Katherine Johnson', false, '2023-12-05');
`,
  solutionSql: `SELECT id, name FROM users WHERE is_active;`,
  hints: [
    "You only want rows where the user is active. Which column tells you that?",
    "`is_active` is a boolean, so `WHERE is_active` is enough — no `= true` needed.",
    "Full answer: `SELECT id, name FROM users WHERE is_active;`",
  ],
};
