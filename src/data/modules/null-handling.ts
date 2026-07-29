import type { Module } from "@/lib/modules/types";
import type { Problem } from "@/lib/problems/types";

// One tiny shared dataset for every drill and quiz question in this module, so
// each exercise is a short variation on the same familiar table. `email` and
// `referred_by` are deliberately nullable: some rows have them, some don't, so
// every NULL trick below has real NULLs and real non-NULLs to work with.
const SCHEMA = `
CREATE TABLE customers (
  id           int PRIMARY KEY,
  name         text NOT NULL,
  email        text,          -- nullable: not everyone left an address
  referred_by  int            -- nullable: id of the customer who referred them
);

INSERT INTO customers (id, name, email, referred_by) VALUES
  (1, 'Ada',       'ada@example.com',   NULL),
  (2, 'Grace',     NULL,                1),
  (3, 'Katherine', 'kat@example.com',   1),
  (4, 'Alan',      NULL,                NULL),
  (5, 'Linus',     'linus@example.com', 3);
`;

const drills: Problem[] = [
  {
    id: "drill-null-handling-1",
    title: "Find the missing values",
    difficulty: "easy",
    topics: ["filtering"],
    description: `Some customers never left an email address, so \`email\` is \`NULL\` for them.

Return the \`id\` and \`name\` of every customer who has **no email** on file.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT id, name FROM customers WHERE email IS NULL;`,
    hints: [
      "You can't test for NULL with `=`. SQL has a dedicated operator.",
      "Use `WHERE email IS NULL`.",
      "Full answer: `SELECT id, name FROM customers WHERE email IS NULL;`",
    ],
  },
  {
    id: "drill-null-handling-2",
    title: "Rows that have a value",
    difficulty: "easy",
    topics: ["filtering"],
    description: `Now do the opposite: return the \`id\` and \`name\` of every customer who **does** have an email address.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT id, name FROM customers WHERE email IS NOT NULL;`,
    hints: [
      "Negate the NULL test rather than using `<> NULL` (which never matches).",
      "Full answer: `SELECT id, name FROM customers WHERE email IS NOT NULL;`",
    ],
  },
  {
    id: "drill-null-handling-3",
    title: "Substitute a default",
    difficulty: "easy",
    topics: ["filtering"],
    description: `Return each customer's \`name\` and \`email\`, but when the email is missing show the text \`no email\` instead of a blank. Keep the output column named \`email\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT name, COALESCE(email, 'no email') AS email FROM customers;`,
    enforceColumnNames: true,
    hints: [
      "`COALESCE(a, b)` returns `a` unless it's NULL, in which case it returns `b`.",
      "Wrap the column: `COALESCE(email, 'no email')`, then alias it back to `email`.",
      "Full answer: `SELECT name, COALESCE(email, 'no email') AS email FROM customers;`",
    ],
  },
  {
    id: "drill-null-handling-4",
    title: "The NULL comparison trap",
    difficulty: "medium",
    topics: ["filtering"],
    description: `You want every customer who was **not** referred by customer \`1\`.

Watch out: a plain \`referred_by <> 1\` silently drops the rows where \`referred_by\` is \`NULL\`, because \`NULL <> 1\` is *unknown*, not *true*. Those customers weren't referred by \`1\` either, so they belong in the result.

Return the \`id\` and \`name\` of every customer who was not referred by \`1\`, **including** those with no referrer at all.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT id, name FROM customers WHERE referred_by <> 1 OR referred_by IS NULL;`,
    hints: [
      "A comparison against NULL is never `true`, so NULL rows fall out of a `<>` filter.",
      "Add `OR referred_by IS NULL` to catch them (or use `COALESCE(referred_by, 0) <> 1`).",
      "Full answer: `SELECT id, name FROM customers WHERE referred_by <> 1 OR referred_by IS NULL;`",
    ],
  },
  {
    id: "drill-null-handling-5",
    title: "COUNT ignores NULLs",
    difficulty: "easy",
    topics: ["filtering"],
    description: `\`COUNT(*)\` counts rows, but \`COUNT(column)\` counts only the rows where that column is **not** NULL.

Return two numbers in a single row: the total number of customers as \`total\`, and the number who have an email as \`with_email\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT COUNT(*) AS total, COUNT(email) AS with_email FROM customers;`,
    enforceColumnNames: true,
    hints: [
      "`COUNT(*)` counts every row; `COUNT(email)` skips rows where `email` is NULL.",
      "Alias them: `COUNT(*) AS total, COUNT(email) AS with_email`.",
      "Full answer: `SELECT COUNT(*) AS total, COUNT(email) AS with_email FROM customers;`",
    ],
  },
  {
    id: "drill-null-handling-6",
    title: "Put NULLs last",
    difficulty: "medium",
    topics: ["filtering"],
    description: `In **descending** order Postgres sorts \`NULL\`s **before** all real values by default, but you can override that with \`NULLS LAST\`.

Return every customer's \`id\`, \`name\`, and \`referred_by\`, sorted by \`referred_by\` **descending** with the customers who have no referrer shown **last**. Break ties with \`id\` so the order is stable.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT id, name, referred_by FROM customers ORDER BY referred_by DESC NULLS LAST, id;`,
    ordered: true,
    hints: [
      "In `DESC` order NULLs come first by default, so add `NULLS LAST` to push them to the end.",
      "Sort by `referred_by DESC NULLS LAST`, then by `id` to break ties.",
      "Full answer: `SELECT id, name, referred_by FROM customers ORDER BY referred_by DESC NULLS LAST, id;`",
    ],
  },
];

const quiz: Problem[] = [
  {
    id: "quiz-null-handling-1",
    title: "No referrer",
    difficulty: "easy",
    topics: ["filtering"],
    description: `Return the \`id\` and \`name\` of every customer who has no referrer (\`referred_by\` is \`NULL\`).`,
    setupSql: SCHEMA,
    solutionSql: `SELECT id, name FROM customers WHERE referred_by IS NULL;`,
    hints: ["Test for NULL with `IS NULL`, not `=`."],
  },
  {
    id: "quiz-null-handling-2",
    title: "Was referred",
    difficulty: "easy",
    topics: ["filtering"],
    description: `Return the \`id\` and \`name\` of every customer who **was** referred by someone (\`referred_by\` is not \`NULL\`).`,
    setupSql: SCHEMA,
    solutionSql: `SELECT id, name FROM customers WHERE referred_by IS NOT NULL;`,
    hints: ["Use `IS NOT NULL`."],
  },
  {
    id: "quiz-null-handling-3",
    title: "Default the referrer",
    difficulty: "easy",
    topics: ["filtering"],
    description: `Return each customer's \`name\` and \`referred_by\`, but show \`0\` when there is no referrer. Keep the output column named \`referred_by\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT name, COALESCE(referred_by, 0) AS referred_by FROM customers;`,
    enforceColumnNames: true,
    hints: ["`COALESCE(referred_by, 0)` swaps NULL for 0; alias it back to `referred_by`."],
  },
  {
    id: "quiz-null-handling-4",
    title: "Not Ada's email",
    difficulty: "medium",
    topics: ["filtering"],
    description: `Return the \`id\` and \`name\` of every customer whose email is **not** \`ada@example.com\`. Customers with no email at all should still be included.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT id, name FROM customers WHERE email <> 'ada@example.com' OR email IS NULL;`,
    hints: ["A `<>` test drops NULL rows — add `OR email IS NULL` to keep them."],
  },
  {
    id: "quiz-null-handling-5",
    title: "Count the referred",
    difficulty: "easy",
    topics: ["filtering"],
    description: `Return two numbers in a single row: the total number of customers as \`total\`, and the number who have a referrer as \`referred_count\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT COUNT(*) AS total, COUNT(referred_by) AS referred_count FROM customers;`,
    enforceColumnNames: true,
    hints: ["`COUNT(referred_by)` ignores NULLs, while `COUNT(*)` counts every row."],
  },
];

export const nullHandling: Module = {
  id: "null-handling",
  title: "NULL handling",
  order: 3,
  summary: "IS NULL, COALESCE, and the three-valued-logic traps.",
  topics: ["filtering"],
  cheatsheetAnchor: "5-null-handling",
  drills,
  quiz,
  quizPassThreshold: 4,
  comprehensiveProblemIds: ["customers-never-order", "customer-referee"],
  status: "authored",
};
