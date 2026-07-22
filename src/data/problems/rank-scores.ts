import type { Problem } from "@/lib/problems/types";

export const rankScores: Problem = {
  id: "rank-scores",
  title: "Rank scores (no gaps)",
  difficulty: "medium",
  topics: ["window-functions", "ordering"],
  description: `Return each \`score\` and its \`rank\`, ordered from highest to lowest.

Ranking rules (like a leaderboard):
- The highest score is rank 1.
- **Ties share the same rank.**
- After a tie, the next rank is **consecutive** — no gaps. (Two players tied at
  rank 2 are followed by rank 3, not rank 4.)

Order the result by \`score\` descending.`,
  setupSql: `
CREATE TABLE scores (
  id    int PRIMARY KEY,
  score numeric(3, 1) NOT NULL
);

INSERT INTO scores (id, score) VALUES
  (1, 3.5), (2, 3.65), (3, 4.0), (4, 3.85), (5, 4.0), (6, 3.65);
`,
  solutionSql: `SELECT score,
       DENSE_RANK() OVER (ORDER BY score DESC) AS rank
FROM scores
ORDER BY score DESC;`,
  ordered: true,
  hints: [
    "\"Ties share a rank, and the next rank has no gap\" is exactly what `DENSE_RANK()` does (vs `RANK()`, which skips).",
    "`DENSE_RANK() OVER (ORDER BY score DESC)`, then `ORDER BY score DESC` for the final output.",
  ],
};
