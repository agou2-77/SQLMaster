import type { Problem } from "@/lib/problems/types";

export const duplicateEmails: Problem = {
  id: "duplicate-emails",
  title: "Find duplicate emails",
  difficulty: "easy",
  topics: ["grouping", "aggregation"],
  description: `Return each \`email\` that appears **more than once** in the \`person\` table.
Each email should appear only once in your result.`,
  setupSql: `
CREATE TABLE person (
  id    int PRIMARY KEY,
  email text NOT NULL
);

INSERT INTO person (id, email) VALUES
  (1, 'alice@example.com'),
  (2, 'bob@example.com'),
  (3, 'alice@example.com'),   -- dup
  (4, 'carol@example.com'),
  (5, 'bob@example.com');     -- dup
`,
  solutionSql: `SELECT email
FROM person
GROUP BY email
HAVING COUNT(*) > 1;`,
  hints: [
    "Collapse rows that share an email into one group, then keep only the groups that contain more than one row.",
    "`GROUP BY email HAVING COUNT(*) > 1`. Remember: you filter groups with HAVING, not WHERE.",
  ],
};
