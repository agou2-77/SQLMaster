import type { Problem } from "@/lib/problems/types";

export const consecutiveNumbers: Problem = {
  id: "consecutive-numbers",
  title: "Numbers appearing three times in a row",
  difficulty: "medium",
  topics: ["window-functions"],
  description: `The \`logs\` table has an ordered \`id\` and a \`num\`. Return each distinct \`num\`
that appears in **at least three consecutive rows** (consecutive by \`id\`).`,
  setupSql: `
CREATE TABLE logs (
  id  int PRIMARY KEY,
  num int NOT NULL
);

INSERT INTO logs (id, num) VALUES
  (1, 1), (2, 1), (3, 1),   -- 1 appears 3× in a row ✓
  (4, 2),
  (5, 1),
  (6, 2), (7, 2);           -- only 2× in a row → no
`,
  solutionSql: `SELECT DISTINCT num
FROM (
  SELECT num,
         LAG(num, 1) OVER (ORDER BY id) AS p1,
         LAG(num, 2) OVER (ORDER BY id) AS p2
  FROM logs
) t
WHERE num = p1 AND num = p2;`,
  hints: [
    "For each row, look at the two rows immediately before it. `LAG(num, 1)` and `LAG(num, 2)` over `ORDER BY id` give you those.",
    "Keep rows where the current `num` equals both the previous and the one before that, then `SELECT DISTINCT num`.",
  ],
};
