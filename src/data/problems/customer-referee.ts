import type { Problem } from "@/lib/problems/types";

export const customerReferee: Problem = {
  id: "customer-referee",
  title: "Customers not referred by #2",
  difficulty: "easy",
  topics: ["filtering"],
  description: `Each customer may have been referred by another, stored in \`referee_id\`
(\`NULL\` if nobody referred them). Return the \`name\` of every customer who was
**not** referred by the customer with \`id = 2\`.

**Watch out:** a customer with \`referee_id IS NULL\` was *not* referred by #2, so
they must appear in your answer.`,
  setupSql: `
CREATE TABLE customer (
  id         int PRIMARY KEY,
  name       text NOT NULL,
  referee_id int
);

INSERT INTO customer (id, name, referee_id) VALUES
  (1, 'Will',  NULL),
  (2, 'Jane',  NULL),
  (3, 'Alex',  2),      -- referred by #2 → excluded
  (4, 'Bill',  NULL),
  (5, 'Zack',  1),
  (6, 'Mark',  2);      -- referred by #2 → excluded
`,
  solutionSql: `SELECT name
FROM customer
WHERE referee_id <> 2 OR referee_id IS NULL;`,
  hints: [
    "`referee_id <> 2` alone silently drops the NULL rows — comparing NULL to anything is never true.",
    "Add `OR referee_id IS NULL` so the un-referred customers are included. (`COALESCE(referee_id, 0) <> 2` also works.)",
  ],
};
