import type { Module } from "@/lib/modules/types";
import type { Problem } from "@/lib/problems/types";

// One tiny shared dataset for every drill and quiz question in this module, so
// each exercise is a short variation on the same familiar table. Each row is one
// purchase: which `customer` bought which `product`. The data is chosen so the
// buyer sets OVERLAP (Ada and Grace bought both A and B) and DIFFER (Alan bought
// A and C but not B; Katherine bought B and C but not A), giving every set
// operation a non-degenerate, non-empty result.
const SCHEMA = `
CREATE TABLE purchases (
  id        int  PRIMARY KEY,
  customer  text NOT NULL,
  product   text NOT NULL
);

INSERT INTO purchases (id, customer, product) VALUES
  (1, 'Ada',       'A'),
  (2, 'Ada',       'B'),
  (3, 'Grace',     'A'),
  (4, 'Grace',     'B'),
  (5, 'Katherine', 'B'),
  (6, 'Alan',      'A'),
  (7, 'Alan',      'C'),
  (8, 'Katherine', 'C');
`;

const drills: Problem[] = [
  {
    id: "drill-set-operations-1",
    title: "UNION removes duplicates",
    difficulty: "easy",
    topics: ["set-ops"],
    description: `The \`purchases\` table records which \`customer\` bought which \`product\` (one row per purchase).

Return a single list of every distinct \`customer\` who bought product \`'A'\` **or** product \`'B'\` — no duplicates.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT customer FROM purchases WHERE product = 'A' UNION SELECT customer FROM purchases WHERE product = 'B';`,
    hints: [
      "Write two `SELECT`s — one filtering `product = 'A'`, one filtering `product = 'B'` — and combine them with `UNION`.",
      "`UNION` automatically removes duplicate rows across both `SELECT`s.",
      "Full answer: `SELECT customer FROM purchases WHERE product = 'A' UNION SELECT customer FROM purchases WHERE product = 'B';`",
    ],
  },
  {
    id: "drill-set-operations-2",
    title: "UNION ALL keeps duplicates",
    difficulty: "easy",
    topics: ["set-ops"],
    description: `Return the customers who bought product \`'A'\` combined with the customers who bought product \`'B'\`, **keeping duplicates** (a customer who bought both should appear twice).`,
    setupSql: SCHEMA,
    solutionSql: `SELECT customer FROM purchases WHERE product = 'A' UNION ALL SELECT customer FROM purchases WHERE product = 'B';`,
    hints: [
      "`UNION ALL` is like `UNION` but keeps every row, including duplicates.",
      "Full answer: `SELECT customer FROM purchases WHERE product = 'A' UNION ALL SELECT customer FROM purchases WHERE product = 'B';`",
    ],
  },
  {
    id: "drill-set-operations-3",
    title: "INTERSECT: in both",
    difficulty: "easy",
    topics: ["set-ops"],
    description: `Return only the customers who bought **both** product \`'A'\` and product \`'B'\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT customer FROM purchases WHERE product = 'A' INTERSECT SELECT customer FROM purchases WHERE product = 'B';`,
    hints: [
      "`INTERSECT` returns only the rows produced by **both** `SELECT`s.",
      "Filter one `SELECT` to `product = 'A'` and the other to `product = 'B'`, then `INTERSECT` them.",
      "Full answer: `SELECT customer FROM purchases WHERE product = 'A' INTERSECT SELECT customer FROM purchases WHERE product = 'B';`",
    ],
  },
  {
    id: "drill-set-operations-4",
    title: "EXCEPT: in A, not B",
    difficulty: "easy",
    topics: ["set-ops"],
    description: `Return the customers who bought product \`'A'\` but did **not** buy product \`'B'\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT customer FROM purchases WHERE product = 'A' EXCEPT SELECT customer FROM purchases WHERE product = 'B';`,
    hints: [
      "`EXCEPT` returns the rows from the first `SELECT` that are **not** in the second.",
      "Put the `'A'` buyers first and the `'B'` buyers second.",
      "Full answer: `SELECT customer FROM purchases WHERE product = 'A' EXCEPT SELECT customer FROM purchases WHERE product = 'B';`",
    ],
  },
  {
    id: "drill-set-operations-5",
    title: "UNION two different filters",
    difficulty: "easy",
    topics: ["set-ops"],
    description: `Return a single de-duplicated list of every \`customer\` who bought product \`'A'\` or product \`'C'\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT customer FROM purchases WHERE product = 'A' UNION SELECT customer FROM purchases WHERE product = 'C';`,
    hints: [
      "Combine a `product = 'A'` `SELECT` and a `product = 'C'` `SELECT` with `UNION`.",
      "`UNION` (without `ALL`) drops the duplicate for anyone who bought both.",
      "Full answer: `SELECT customer FROM purchases WHERE product = 'A' UNION SELECT customer FROM purchases WHERE product = 'C';`",
    ],
  },
  {
    id: "drill-set-operations-6",
    title: "EXCEPT is not symmetric",
    difficulty: "medium",
    topics: ["set-ops"],
    description: `\`EXCEPT\` is **not** symmetric. Return the customers who bought product \`'B'\` but did **not** buy product \`'A'\` — the reverse of drill 4.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT customer FROM purchases WHERE product = 'B' EXCEPT SELECT customer FROM purchases WHERE product = 'A';`,
    hints: [
      "Swap the order from the earlier `EXCEPT` drill: put the `'B'` buyers first.",
      "`EXCEPT` keeps rows from the first `SELECT` only, so `B EXCEPT A` differs from `A EXCEPT B`.",
      "Full answer: `SELECT customer FROM purchases WHERE product = 'B' EXCEPT SELECT customer FROM purchases WHERE product = 'A';`",
    ],
  },
];

const quiz: Problem[] = [
  {
    id: "quiz-set-operations-1",
    title: "Buyers of B or C",
    difficulty: "easy",
    topics: ["set-ops"],
    description: `Return every distinct \`customer\` who bought product \`'B'\` or product \`'C'\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT customer FROM purchases WHERE product = 'B' UNION SELECT customer FROM purchases WHERE product = 'C';`,
    hints: ["Two filtered `SELECT`s joined with `UNION`, which de-duplicates."],
  },
  {
    id: "quiz-set-operations-2",
    title: "Products, keeping duplicates",
    difficulty: "easy",
    topics: ["set-ops"],
    description: `List the \`product\` of every purchase made by \`Ada\`, combined with the \`product\` of every purchase made by \`Grace\`, **keeping duplicates**.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT product FROM purchases WHERE customer = 'Ada' UNION ALL SELECT product FROM purchases WHERE customer = 'Grace';`,
    hints: ["Use `UNION ALL` so shared products aren't collapsed."],
  },
  {
    id: "quiz-set-operations-3",
    title: "Products bought by both",
    difficulty: "easy",
    topics: ["set-ops"],
    description: `Return the products bought by **both** \`Ada\` and \`Alan\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT product FROM purchases WHERE customer = 'Ada' INTERSECT SELECT product FROM purchases WHERE customer = 'Alan';`,
    hints: ["`INTERSECT` keeps only rows returned by both `SELECT`s."],
  },
  {
    id: "quiz-set-operations-4",
    title: "Bought A, not C",
    difficulty: "easy",
    topics: ["set-ops"],
    description: `Return the customers who bought product \`'A'\` but did **not** buy product \`'C'\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT customer FROM purchases WHERE product = 'A' EXCEPT SELECT customer FROM purchases WHERE product = 'C';`,
    hints: ["`EXCEPT` subtracts the second `SELECT`'s rows from the first."],
  },
  {
    id: "quiz-set-operations-5",
    title: "Alan's products, not Ada's",
    difficulty: "medium",
    topics: ["set-ops"],
    description: `Return the products that \`Alan\` bought but \`Ada\` did not.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT product FROM purchases WHERE customer = 'Alan' EXCEPT SELECT product FROM purchases WHERE customer = 'Ada';`,
    hints: ["`EXCEPT` with `Alan`'s products first, `Ada`'s second."],
  },
];

export const setOperations: Module = {
  id: "set-operations",
  title: "Set operations",
  order: 9,
  summary: "UNION, INTERSECT, and EXCEPT.",
  topics: ["set-ops"],
  cheatsheetAnchor: "12-set-operations",
  drills,
  quiz,
  quizPassThreshold: 4,
  comprehensiveProblemIds: ["bought-a-not-b"],
  status: "authored",
};
