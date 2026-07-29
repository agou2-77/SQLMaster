import type { Module } from "@/lib/modules/types";
import type { Problem } from "@/lib/problems/types";

// One tiny shared dataset for every drill and quiz question in this module, so
// each exercise is a short variation on the same familiar table.
const SCHEMA = `
CREATE TABLE users (
  id          int  PRIMARY KEY,
  first_name  text NOT NULL,
  last_name   text NOT NULL,
  email       text NOT NULL
);

INSERT INTO users (id, first_name, last_name, email) VALUES
  (1, 'Ada',       'Lovelace', 'ada@example.com'),
  (2, 'Grace',     'Hopper',   'grace.hopper@navy.mil'),
  (3, 'Alan',      'Turing',   'alan@bletchley.org'),
  (4, 'Katherine', 'Johnson',  'katherine@nasa.gov'),
  (5, 'Linus',     'Torvalds', 'linus@example.com');
`;

const drills: Problem[] = [
  {
    id: "drill-string-functions-1",
    title: "Build a full name",
    difficulty: "easy",
    topics: ["string-fns"],
    description: `The \`users\` table stores names in two columns.

Join \`first_name\` and \`last_name\` with a single space between them, and label the result \`full_name\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT first_name || ' ' || last_name AS full_name FROM users;`,
    enforceColumnNames: true,
    hints: [
      "The `||` operator concatenates (joins) two strings together.",
      "Put a literal space `' '` between the two columns: `first_name || ' ' || last_name`.",
      "Full answer: `SELECT first_name || ' ' || last_name AS full_name FROM users;`",
    ],
  },
  {
    id: "drill-string-functions-2",
    title: "Uppercase a column",
    difficulty: "easy",
    topics: ["string-fns"],
    description: `Return each user's \`first_name\` converted to UPPERCASE, in a column named \`first_upper\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT UPPER(first_name) AS first_upper FROM users;`,
    enforceColumnNames: true,
    hints: [
      "`UPPER(...)` converts text to uppercase (`LOWER(...)` does the opposite).",
      "Full answer: `SELECT UPPER(first_name) AS first_upper FROM users;`",
    ],
  },
  {
    id: "drill-string-functions-3",
    title: "Measure a string",
    difficulty: "easy",
    topics: ["string-fns"],
    description: `Return each user's \`last_name\` alongside how many characters it contains, in a column named \`name_length\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT last_name, LENGTH(last_name) AS name_length FROM users;`,
    enforceColumnNames: true,
    hints: [
      "`LENGTH(text)` returns the number of characters in a string.",
      "Select `last_name` as-is, then add `LENGTH(last_name)` as a second column.",
      "Full answer: `SELECT last_name, LENGTH(last_name) AS name_length FROM users;`",
    ],
  },
  {
    id: "drill-string-functions-4",
    title: "Take the first letters",
    difficulty: "easy",
    topics: ["string-fns"],
    description: `Return each user's \`first_name\` and its first 3 characters, in a column named \`abbrev\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT first_name, LEFT(first_name, 3) AS abbrev FROM users;`,
    enforceColumnNames: true,
    hints: [
      "`LEFT(text, n)` returns the first `n` characters of a string.",
      "`SUBSTRING(first_name FROM 1 FOR 3)` works too, but `LEFT` is shorter here.",
      "Full answer: `SELECT first_name, LEFT(first_name, 3) AS abbrev FROM users;`",
    ],
  },
  {
    id: "drill-string-functions-5",
    title: "Extract the email domain",
    difficulty: "medium",
    topics: ["string-fns"],
    description: `Return each user's \`email\` and its domain — the part **after** the \`@\` — in a column named \`domain\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT email, SPLIT_PART(email, '@', 2) AS domain FROM users;`,
    enforceColumnNames: true,
    hints: [
      "`SPLIT_PART(text, delimiter, n)` splits on the delimiter and returns the `n`th piece.",
      "Split on `'@'` and take piece number 2 to get everything after it.",
      "Full answer: `SELECT email, SPLIT_PART(email, '@', 2) AS domain FROM users;`",
    ],
  },
  {
    id: "drill-string-functions-6",
    title: "Replace part of a string",
    difficulty: "medium",
    topics: ["string-fns"],
    description: `Return each user's \`email\` with the \`@\` symbol replaced by \`-at-\`, in a column named \`masked_email\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT REPLACE(email, '@', '-at-') AS masked_email FROM users;`,
    enforceColumnNames: true,
    hints: [
      "`REPLACE(text, from, to)` swaps every occurrence of `from` with `to`.",
      "Replace `'@'` with `'-at-'` inside `email`.",
      "Full answer: `SELECT REPLACE(email, '@', '-at-') AS masked_email FROM users;`",
    ],
  },
];

const quiz: Problem[] = [
  {
    id: "quiz-string-functions-1",
    title: "Last, first",
    difficulty: "easy",
    topics: ["string-fns"],
    description: `Return each user's name as \`last_name\`, then \`first_name\`, joined by a comma and a space (e.g. \`Lovelace, Ada\`), in a column named \`display_name\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT last_name || ', ' || first_name AS display_name FROM users;`,
    enforceColumnNames: true,
    hints: ["Concatenate with `||`, putting the literal `', '` between the two columns."],
  },
  {
    id: "quiz-string-functions-2",
    title: "Lowercase a column",
    difficulty: "easy",
    topics: ["string-fns"],
    description: `Return each user's \`last_name\` converted to lowercase, in a column named \`last_lower\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT LOWER(last_name) AS last_lower FROM users;`,
    enforceColumnNames: true,
    hints: ["`LOWER(...)` converts text to lowercase."],
  },
  {
    id: "quiz-string-functions-3",
    title: "How long is the email?",
    difficulty: "easy",
    topics: ["string-fns"],
    description: `Return each user's \`email\` and how many characters long it is, in a column named \`email_length\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT email, LENGTH(email) AS email_length FROM users;`,
    enforceColumnNames: true,
    hints: ["`LENGTH(...)` returns the number of characters in a string."],
  },
  {
    id: "quiz-string-functions-4",
    title: "Last few characters",
    difficulty: "easy",
    topics: ["string-fns"],
    description: `Return each user's \`email\` and its last 3 characters, in a column named \`tld\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT email, RIGHT(email, 3) AS tld FROM users;`,
    enforceColumnNames: true,
    hints: ["`RIGHT(text, n)` returns the last `n` characters."],
  },
  {
    id: "quiz-string-functions-5",
    title: "Extract the mailbox",
    difficulty: "medium",
    topics: ["string-fns"],
    description: `Return the local part of each user's \`email\` — everything **before** the \`@\` — in a column named \`mailbox\`.`,
    setupSql: SCHEMA,
    solutionSql: `SELECT SPLIT_PART(email, '@', 1) AS mailbox FROM users;`,
    enforceColumnNames: true,
    hints: [
      "`SPLIT_PART(text, delimiter, n)` splits on the delimiter and returns the `n`th piece — which piece comes before the `@`?",
    ],
  },
];

export const stringFunctions: Module = {
  id: "string-functions",
  title: "String functions",
  order: 11,
  summary: "Concatenation, LOWER/UPPER, LENGTH, and substrings.",
  topics: ["string-fns"],
  cheatsheetAnchor: "14-strings",
  drills,
  quiz,
  quizPassThreshold: 4,
  comprehensiveProblemIds: ["duplicate-emails"],
  status: "authored",
};
