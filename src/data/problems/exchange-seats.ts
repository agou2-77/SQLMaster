import type { Problem } from "@/lib/problems/types";

export const exchangeSeats: Problem = {
  id: "exchange-seats",
  title: "Exchange adjacent seats",
  difficulty: "medium",
  topics: ["subqueries", "ordering"],
  description: `Students sit in seats numbered \`1..n\` with no gaps. Swap the students in each
pair of adjacent seats: 1↔2, 3↔4, 5↔6, and so on. If there is an **odd** number
of seats, the last student keeps their seat.

Return \`id\` and \`student\`, ordered by the (new) seat \`id\`.`,
  setupSql: `
CREATE TABLE seat (
  id      int PRIMARY KEY,
  student text NOT NULL
);

INSERT INTO seat (id, student) VALUES
  (1, 'Abbot'),
  (2, 'Doris'),
  (3, 'Emerson'),
  (4, 'Green'),
  (5, 'Jeames');   -- odd count → seat 5 stays put
`,
  solutionSql: `SELECT
  CASE
    WHEN id % 2 = 1 AND id = (SELECT MAX(id) FROM seat) THEN id
    WHEN id % 2 = 1 THEN id + 1
    ELSE id - 1
  END AS id,
  student
FROM seat
ORDER BY 1;`,
  ordered: true,
  hints: [
    "Compute a new id per row with `CASE`: an even seat pairs with the one before it (`id - 1`); an odd seat pairs with the one after it (`id + 1`).",
    "Handle the odd tail: an odd seat that is also the maximum id has no partner, so it keeps its own id. Then `ORDER BY 1` (the new id). A `LEAD`/`LAG` window solution also works.",
  ],
};
