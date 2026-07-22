import type { Problem } from "@/lib/problems/types";

export const risingTemperature: Problem = {
  id: "rising-temperature",
  title: "Rising temperature",
  difficulty: "medium",
  topics: ["window-functions", "date-time"],
  description: `The \`weather\` table records one temperature reading per day. Return the \`id\`
of every day that was **warmer than the day before it** (the previous calendar
day). The very first day has nothing to compare against, so it never qualifies.`,
  setupSql: `
CREATE TABLE weather (
  id          int PRIMARY KEY,
  recorded_on date NOT NULL,
  temperature int  NOT NULL
);

INSERT INTO weather (id, recorded_on, temperature) VALUES
  (1, '2024-01-01', 10),
  (2, '2024-01-02', 25),   -- 25 > 10 → rising ✓
  (3, '2024-01-03', 20),   -- 20 < 25 → no
  (4, '2024-01-04', 30);   -- 30 > 20 → rising ✓
`,
  solutionSql: `SELECT id
FROM (
  SELECT id,
         temperature,
         LAG(temperature) OVER (ORDER BY recorded_on) AS prev_temp
  FROM weather
) t
WHERE temperature > prev_temp;`,
  hints: [
    "You need each row to \"see\" the previous day's temperature. `LAG(temperature) OVER (ORDER BY recorded_on)` fetches the value from the prior row.",
    "A window function can't go in WHERE, so compute the previous temperature in a subquery/CTE, then filter `WHERE temperature > prev_temp` in the outer query. (A self-join on `recorded_on = prev.recorded_on + 1` also works.)",
  ],
};
