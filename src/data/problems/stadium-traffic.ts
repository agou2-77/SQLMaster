import type { Problem } from "@/lib/problems/types";

export const stadiumTraffic: Problem = {
  id: "stadium-traffic",
  title: "Human traffic of a stadium",
  difficulty: "hard",
  topics: ["window-functions", "ctes"],
  description: `The \`stadium\` table logs the number of \`people\` present each day (\`id\` is a
gap-free running counter). Find every record that is part of a run of **three or
more consecutive rows** (by \`id\`) where \`people >= 100\` on each row.

Return \`id\`, \`visit_date\`, and \`people\`, ordered by \`visit_date\`.`,
  setupSql: `
CREATE TABLE stadium (
  id         int PRIMARY KEY,
  visit_date date NOT NULL,
  people     int  NOT NULL
);

INSERT INTO stadium (id, visit_date, people) VALUES
  (1, '2024-01-01', 10),
  (2, '2024-01-02', 109),   -- run of 2 (2,3) → too short
  (3, '2024-01-03', 150),
  (4, '2024-01-04', 99),    -- breaks the run
  (5, '2024-01-05', 145),   -- run of 3 (5,6,7) ✓
  (6, '2024-01-06', 180),
  (7, '2024-01-07', 120),
  (8, '2024-01-08', 60);
`,
  solutionSql: `WITH busy AS (
  SELECT id, visit_date, people,
         id - ROW_NUMBER() OVER (ORDER BY id) AS grp
  FROM stadium
  WHERE people >= 100
),
runs AS (
  SELECT grp
  FROM busy
  GROUP BY grp
  HAVING COUNT(*) >= 3
)
SELECT id, visit_date, people
FROM busy
WHERE grp IN (SELECT grp FROM runs)
ORDER BY visit_date;`,
  ordered: true,
  hints: [
    "Classic \"gaps and islands\": keep only the busy rows (`people >= 100`), then within them compute `id - ROW_NUMBER() OVER (ORDER BY id)`. That value is constant for a consecutive run.",
    "Group by that constant to find each island; keep islands with `COUNT(*) >= 3`; then return the rows belonging to those islands, ordered by `visit_date`.",
  ],
};
