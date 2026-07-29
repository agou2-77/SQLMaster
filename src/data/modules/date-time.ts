import type { Module } from "@/lib/modules/types";
import type { Problem } from "@/lib/problems/types";

// One tiny shared dataset for every drill and quiz question in this module, so
// each exercise is a short variation on the same familiar table. Dates span two
// years and different months/weekdays so extracting parts, truncating, date
// arithmetic, and range filters all return non-degenerate results.
const SCHEMA = `
CREATE TABLE orders (
  id          int PRIMARY KEY,
  customer    text NOT NULL,
  ordered_on  date NOT NULL,
  amount      int  NOT NULL   -- order total, in dollars
);

INSERT INTO orders (id, customer, ordered_on, amount) VALUES
  (1, 'Alice', '2023-01-15', 120),
  (2, 'Bob',   '2023-02-20',  80),
  (3, 'Carol', '2023-06-10', 200),
  (4, 'Dan',   '2024-03-05', 150),
  (5, 'Eve',   '2024-11-22',  90);
`;

const drills: Problem[] = [
  {
    id: "drill-date-time-1",
    title: "Extract the year",
    difficulty: "easy",
    topics: ["date-time"],
    description: `The \`orders\` table records when each order was placed in \`ordered_on\`.

Return each order's \`id\` and the year it was placed, in a column named \`order_year\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT id, EXTRACT(YEAR FROM ordered_on) AS order_year FROM orders;`,
    enforceColumnNames: true,
    hints: [
      "`EXTRACT(YEAR FROM ordered_on)` pulls the year out of a date.",
      "Alias the extracted value with `AS order_year`.",
      "Full answer: `SELECT id, EXTRACT(YEAR FROM ordered_on) AS order_year FROM orders;`",
    ],
  },
  {
    id: "drill-date-time-2",
    title: "Truncate to the month",
    difficulty: "easy",
    topics: ["date-time"],
    description: `Return each order's \`id\` and the first day of the month it was placed in, in a column named \`month_start\`.

Use \`DATE_TRUNC\` to snap the date back to the start of its month.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT id, DATE_TRUNC('month', ordered_on) AS month_start FROM orders;`,
    enforceColumnNames: true,
    hints: [
      "`DATE_TRUNC('month', ordered_on)` drops the day part, leaving the 1st of the month.",
      "Alias the result with `AS month_start`.",
      "Full answer: `SELECT id, DATE_TRUNC('month', ordered_on) AS month_start FROM orders;`",
    ],
  },
  {
    id: "drill-date-time-3",
    title: "Add an interval",
    difficulty: "easy",
    topics: ["date-time"],
    description: `Suppose every order ships one week after it is placed.

Return each order's \`id\` and its ship date (7 days after \`ordered_on\`), in a column named \`ship_date\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT id, ordered_on + INTERVAL '7 days' AS ship_date FROM orders;`,
    enforceColumnNames: true,
    hints: [
      "You can add time to a date with `+ INTERVAL '7 days'`.",
      "Alias the shifted date with `AS ship_date`.",
      "Full answer: `SELECT id, ordered_on + INTERVAL '7 days' AS ship_date FROM orders;`",
    ],
  },
  {
    id: "drill-date-time-4",
    title: "Days between two dates",
    difficulty: "medium",
    topics: ["date-time"],
    description: `Subtracting one date from another gives the number of days between them.

Return each order's \`id\` and how many days elapsed from \`ordered_on\` until 2024-12-31, in a column named \`days_elapsed\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT id, DATE '2024-12-31' - ordered_on AS days_elapsed FROM orders;`,
    enforceColumnNames: true,
    hints: [
      "`date2 - date1` returns an integer number of days.",
      "Write the fixed date as `DATE '2024-12-31'` and subtract `ordered_on`.",
      "Full answer: `SELECT id, DATE '2024-12-31' - ordered_on AS days_elapsed FROM orders;`",
    ],
  },
  {
    id: "drill-date-time-5",
    title: "Filter a date range",
    difficulty: "easy",
    topics: ["date-time"],
    description: `Return the \`id\` and \`ordered_on\` of every order placed during 2023 (from 2023-01-01 to 2023-12-31, inclusive).`,
    setupSql: SCHEMA,
    solutionSql: `SELECT id, ordered_on FROM orders WHERE ordered_on BETWEEN DATE '2023-01-01' AND DATE '2023-12-31';`,
    hints: [
      "`BETWEEN` includes both endpoints of the range.",
      "Filter with `WHERE ordered_on BETWEEN DATE '2023-01-01' AND DATE '2023-12-31'`.",
      "Full answer: `SELECT id, ordered_on FROM orders WHERE ordered_on BETWEEN DATE '2023-01-01' AND DATE '2023-12-31';`",
    ],
  },
  {
    id: "drill-date-time-6",
    title: "Day of the week",
    difficulty: "medium",
    topics: ["date-time"],
    description: `Return each order's \`id\` and the day-of-week number it was placed on (0 = Sunday, 6 = Saturday), in a column named \`weekday\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT id, EXTRACT(DOW FROM ordered_on) AS weekday FROM orders;`,
    enforceColumnNames: true,
    hints: [
      "`EXTRACT(DOW FROM ordered_on)` gives the day of week, where Sunday is 0.",
      "Alias the result with `AS weekday`.",
      "Full answer: `SELECT id, EXTRACT(DOW FROM ordered_on) AS weekday FROM orders;`",
    ],
  },
];

const quiz: Problem[] = [
  {
    id: "quiz-date-time-1",
    title: "Extract the month",
    difficulty: "easy",
    topics: ["date-time"],
    description: `Return each order's \`id\` and the month number it was placed, in a column named \`order_month\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT id, EXTRACT(MONTH FROM ordered_on) AS order_month FROM orders;`,
    enforceColumnNames: true,
    hints: ["`EXTRACT(MONTH FROM ordered_on)` pulls out the month; alias it `order_month`."],
  },
  {
    id: "quiz-date-time-2",
    title: "Truncate to the year",
    difficulty: "easy",
    topics: ["date-time"],
    description: `Return each order's \`id\` and the first day of the year it was placed in, in a column named \`year_start\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT id, DATE_TRUNC('year', ordered_on) AS year_start FROM orders;`,
    enforceColumnNames: true,
    hints: ["`DATE_TRUNC('year', ordered_on)` snaps a date back to January 1st."],
  },
  {
    id: "quiz-date-time-3",
    title: "Thirty-day deadline",
    difficulty: "easy",
    topics: ["date-time"],
    description: `Return each order's \`id\` and the date 30 days after it was placed, in a column named \`deadline\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT id, ordered_on + INTERVAL '30 days' AS deadline FROM orders;`,
    enforceColumnNames: true,
    hints: ["Add `INTERVAL '30 days'` to `ordered_on` and alias it `deadline`."],
  },
  {
    id: "quiz-date-time-4",
    title: "Orders in 2024",
    difficulty: "easy",
    topics: ["date-time"],
    description: `Return the \`id\` and \`ordered_on\` of every order placed in 2024.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT id, ordered_on FROM orders WHERE ordered_on >= DATE '2024-01-01' AND ordered_on < DATE '2025-01-01';`,
    hints: ["Keep rows where `ordered_on` falls on or after 2024-01-01 and before 2025-01-01."],
  },
  {
    id: "quiz-date-time-5",
    title: "Days since the order",
    difficulty: "medium",
    topics: ["date-time"],
    description: `Return each order's \`id\` and how many days passed from \`ordered_on\` until 2025-01-01, in a column named \`days_ago\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT id, DATE '2025-01-01' - ordered_on AS days_ago FROM orders;`,
    enforceColumnNames: true,
    hints: ["Subtract `ordered_on` from `DATE '2025-01-01'` and alias the result `days_ago`."],
  },
];

export const dateTime: Module = {
  id: "date-time",
  title: "Date & time",
  order: 12,
  summary: "Extracting parts, intervals, and date arithmetic.",
  topics: ["date-time"],
  cheatsheetAnchor: "16-dates",
  drills,
  quiz,
  quizPassThreshold: 4,
  comprehensiveProblemIds: ["rising-temperature", "monthly-revenue"],
  status: "authored",
};
