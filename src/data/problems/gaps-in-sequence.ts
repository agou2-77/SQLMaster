import type { Problem } from "@/lib/problems/types";

export const gapsInSequence: Problem = {
  id: "gaps-in-sequence",
  title: "Find gaps in a sequence of ids",
  difficulty: "hard",
  topics: ["window-functions"],
  description: `\`seq\` holds a set of integer \`id\`s with some values missing.

Return the **missing ranges**: for each gap, the first missing id (\`gap_start\`)
and the last missing id (\`gap_end\`), ordered by \`gap_start\`.

For example, if the ids are 1, 2, 3, 7, 8, 10 then the gaps are 4–6 and 9–9.`,
  ordered: true,
  setupSql: `
CREATE TABLE seq (
  id int PRIMARY KEY
);

INSERT INTO seq (id) VALUES (1), (2), (3), (7), (8), (10);
`,
  solutionSql: `WITH s AS (
  SELECT id, LEAD(id) OVER (ORDER BY id) AS next_id
  FROM seq
)
SELECT id + 1 AS gap_start, next_id - 1 AS gap_end
FROM s
WHERE next_id - id > 1
ORDER BY gap_start;`,
  hints: [
    "Pair each id with the next present id using `LEAD(id) OVER (ORDER BY id)`.",
    "A gap exists where `next_id - id > 1`; the missing range is `id + 1` to `next_id - 1`.",
  ],
};
