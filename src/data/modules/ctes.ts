import type { Module } from "@/lib/modules/types";
import type { Problem } from "@/lib/problems/types";

// One tiny shared dataset for every drill and quiz question in this module: a
// small category tree. Electronics is the root; Computers, Phones, and
// Accessories are its children; Laptops and Desktops are grandchildren (children
// of Computers); Ultrabooks is a great-grandchild (child of Laptops). A NULL
// `parent_id` marks a root. The shape is deliberately shallow so every recursive
// walk terminates quickly, but it runs deep enough that filtering and recursion
// actually change the result.
const SCHEMA = `
CREATE TABLE categories (
  id         int PRIMARY KEY,
  name       text NOT NULL,
  parent_id  int              -- NULL for a root; otherwise the parent's id
);

INSERT INTO categories (id, name, parent_id) VALUES
  (1, 'Electronics', NULL),
  (2, 'Computers',   1),
  (3, 'Phones',      1),
  (4, 'Laptops',     2),
  (5, 'Desktops',    2),
  (6, 'Accessories', 1),
  (7, 'Ultrabooks',  4);
`;

const drills: Problem[] = [
  {
    id: "drill-ctes-1",
    title: "One CTE, then filter it",
    difficulty: "easy",
    topics: ["ctes"],
    description: `A **CTE** (Common Table Expression) is a named, temporary result you define with \`WITH\` and then query like a table.

Write a CTE named \`child_counts\` that counts how many direct children each parent has (group by \`parent_id\`, ignore roots). Then the main query returns the \`parent_id\` and count for parents that have **2 or more** children.`,
    setupSql: SCHEMA,
    solutionSql: `WITH child_counts AS (
  SELECT parent_id, COUNT(*) AS child_count
  FROM categories
  WHERE parent_id IS NOT NULL
  GROUP BY parent_id
)
SELECT parent_id, child_count
FROM child_counts
WHERE child_count >= 2;`,
    hints: [
      "Define the aggregate once inside `WITH child_counts AS ( ... )`, then `SELECT ... FROM child_counts` in the main query.",
      "You can filter on the aggregated column in the outer query: `WHERE child_count >= 2`.",
      "Full answer: `WITH child_counts AS (SELECT parent_id, COUNT(*) AS child_count FROM categories WHERE parent_id IS NOT NULL GROUP BY parent_id) SELECT parent_id, child_count FROM child_counts WHERE child_count >= 2;`",
    ],
  },
  {
    id: "drill-ctes-2",
    title: "Chain two CTEs",
    difficulty: "easy",
    topics: ["ctes"],
    description: `CTEs can build on each other: a later CTE may read from an earlier one.

Chain two CTEs. The first, \`child_counts\`, counts each parent's direct children. The second, \`named\`, joins those counts back to \`categories\` to look up the parent's \`name\`. Return each parent's \`name\` and its child count.`,
    setupSql: SCHEMA,
    solutionSql: `WITH child_counts AS (
  SELECT parent_id, COUNT(*) AS child_count
  FROM categories
  WHERE parent_id IS NOT NULL
  GROUP BY parent_id
),
named AS (
  SELECT c.name, cc.child_count
  FROM child_counts cc
  JOIN categories c ON c.id = cc.parent_id
)
SELECT name, child_count
FROM named;`,
    hints: [
      "Separate the two CTEs with a comma: `WITH child_counts AS ( ... ), named AS ( ... )`.",
      "Inside `named`, join `child_counts` to `categories` on `categories.id = child_counts.parent_id`.",
      "Full answer: `WITH child_counts AS (SELECT parent_id, COUNT(*) AS child_count FROM categories WHERE parent_id IS NOT NULL GROUP BY parent_id), named AS (SELECT c.name, cc.child_count FROM child_counts cc JOIN categories c ON c.id = cc.parent_id) SELECT name, child_count FROM named;`",
    ],
  },
  {
    id: "drill-ctes-3",
    title: "De-clutter a join with a CTE",
    difficulty: "easy",
    topics: ["ctes"],
    description: `A self-join plus \`GROUP BY\` reads much more clearly tucked inside a CTE.

Build a CTE \`child_counts\` that \`LEFT JOIN\`s each category to its children and counts them (so leaves score 0). The main query then simply returns every category's \`name\` and its \`child_count\`.`,
    setupSql: SCHEMA,
    solutionSql: `WITH child_counts AS (
  SELECT p.name, COUNT(ch.id) AS child_count
  FROM categories p
  LEFT JOIN categories ch ON ch.parent_id = p.id
  GROUP BY p.id, p.name
)
SELECT name, child_count
FROM child_counts;`,
    enforceColumnNames: true,
    hints: [
      "Alias the same table twice — `categories p` (the parent) `LEFT JOIN categories ch` (the child) `ON ch.parent_id = p.id`.",
      "`COUNT(ch.id)` counts only matched children, so a category with no children scores 0.",
      "Full answer: `WITH child_counts AS (SELECT p.name, COUNT(ch.id) AS child_count FROM categories p LEFT JOIN categories ch ON ch.parent_id = p.id GROUP BY p.id, p.name) SELECT name, child_count FROM child_counts;`",
    ],
  },
  {
    id: "drill-ctes-4",
    title: "Reference a CTE twice",
    difficulty: "medium",
    topics: ["ctes"],
    description: `Because a CTE is named, you can reference it more than once in the same statement — no need to repeat the query.

Define \`child_counts\` (direct children per parent), then return the \`parent_id\` and count for parents whose \`child_count\` is **above the average** child count. Reference \`child_counts\` once in the \`FROM\` and again in a subquery that computes \`AVG(child_count)\`.`,
    setupSql: SCHEMA,
    solutionSql: `WITH child_counts AS (
  SELECT parent_id, COUNT(*) AS child_count
  FROM categories
  WHERE parent_id IS NOT NULL
  GROUP BY parent_id
)
SELECT parent_id, child_count
FROM child_counts
WHERE child_count > (SELECT AVG(child_count) FROM child_counts);`,
    hints: [
      "Compute the threshold with a scalar subquery: `(SELECT AVG(child_count) FROM child_counts)`.",
      "The same CTE appears twice — once in the main `FROM`, once inside the subquery — but you only defined it once.",
      "Full answer: `WITH child_counts AS (SELECT parent_id, COUNT(*) AS child_count FROM categories WHERE parent_id IS NOT NULL GROUP BY parent_id) SELECT parent_id, child_count FROM child_counts WHERE child_count > (SELECT AVG(child_count) FROM child_counts);`",
    ],
  },
  {
    id: "drill-ctes-5",
    title: "Walk the tree (WITH RECURSIVE)",
    difficulty: "medium",
    topics: ["ctes"],
    description: `\`WITH RECURSIVE\` lets a CTE refer to itself, which is how you walk a hierarchy.

Write a recursive CTE \`tree\` that starts at the root (\`parent_id IS NULL\`) with \`depth\` 0, then \`UNION ALL\`s each category joined to its parent's row, adding 1 to \`depth\`. Return every category's \`name\` and its \`depth\`.`,
    setupSql: SCHEMA,
    solutionSql: `WITH RECURSIVE tree AS (
  SELECT id, name, 0 AS depth
  FROM categories
  WHERE parent_id IS NULL
  UNION ALL
  SELECT c.id, c.name, t.depth + 1
  FROM categories c
  JOIN tree t ON c.parent_id = t.id
)
SELECT name, depth
FROM tree;`,
    enforceColumnNames: true,
    hints: [
      "The anchor member selects the root(s); the recursive member joins `categories` to the CTE (`tree`) on `c.parent_id = t.id`.",
      "Carry `depth` through the recursion by selecting `t.depth + 1` in the recursive member.",
      "Full answer: `WITH RECURSIVE tree AS (SELECT id, name, 0 AS depth FROM categories WHERE parent_id IS NULL UNION ALL SELECT c.id, c.name, t.depth + 1 FROM categories c JOIN tree t ON c.parent_id = t.id) SELECT name, depth FROM tree;`",
    ],
  },
  {
    id: "drill-ctes-6",
    title: "Recursive descendants of a node",
    difficulty: "medium",
    topics: ["ctes"],
    description: `Recursion also finds every descendant beneath a given node.

Starting from the direct children of **Electronics** (\`parent_id = 1\`), use a recursive CTE \`descendants\` to collect that whole subtree, then return each descendant's \`name\`.`,
    setupSql: SCHEMA,
    solutionSql: `WITH RECURSIVE descendants AS (
  SELECT id, name, parent_id
  FROM categories
  WHERE parent_id = 1
  UNION ALL
  SELECT c.id, c.name, c.parent_id
  FROM categories c
  JOIN descendants d ON c.parent_id = d.id
)
SELECT name
FROM descendants;`,
    hints: [
      "The anchor member seeds the walk with the direct children: `WHERE parent_id = 1`.",
      "The recursive member joins `categories` to `descendants` on `c.parent_id = d.id`, pulling in the next level each step.",
      "Full answer: `WITH RECURSIVE descendants AS (SELECT id, name, parent_id FROM categories WHERE parent_id = 1 UNION ALL SELECT c.id, c.name, c.parent_id FROM categories c JOIN descendants d ON c.parent_id = d.id) SELECT name FROM descendants;`",
    ],
  },
];

const quiz: Problem[] = [
  {
    id: "quiz-ctes-1",
    title: "Parents with exactly two children",
    difficulty: "easy",
    topics: ["ctes"],
    description: `Using a CTE that counts each parent's direct children, return the \`parent_id\` and count for parents that have **exactly 2** children.`,
    setupSql: SCHEMA,
    solutionSql: `WITH child_counts AS (
  SELECT parent_id, COUNT(*) AS child_count
  FROM categories
  WHERE parent_id IS NOT NULL
  GROUP BY parent_id
)
SELECT parent_id, child_count
FROM child_counts
WHERE child_count = 2;`,
    hints: ["Filter the CTE's aggregated column in the main query with `WHERE child_count = 2`."],
  },
  {
    id: "quiz-ctes-2",
    title: "Names at depth 2",
    difficulty: "medium",
    topics: ["ctes"],
    description: `With a recursive CTE that tags each category with its \`depth\` from the root (root = 0), return the \`name\` of every category sitting at \`depth\` 2.`,
    setupSql: SCHEMA,
    solutionSql: `WITH RECURSIVE tree AS (
  SELECT id, name, 0 AS depth
  FROM categories
  WHERE parent_id IS NULL
  UNION ALL
  SELECT c.id, c.name, t.depth + 1
  FROM categories c
  JOIN tree t ON c.parent_id = t.id
)
SELECT name
FROM tree
WHERE depth = 2;`,
    hints: ["Build the depth-tagged `tree` recursively, then filter the main query with `WHERE depth = 2`."],
  },
  {
    id: "quiz-ctes-3",
    title: "Descendants of Computers",
    difficulty: "medium",
    topics: ["ctes"],
    description: `Starting from the direct children of **Computers** (\`parent_id = 2\`), use a recursive CTE to collect that subtree and return each descendant's \`name\`.`,
    setupSql: SCHEMA,
    solutionSql: `WITH RECURSIVE descendants AS (
  SELECT id, name, parent_id
  FROM categories
  WHERE parent_id = 2
  UNION ALL
  SELECT c.id, c.name, c.parent_id
  FROM categories c
  JOIN descendants d ON c.parent_id = d.id
)
SELECT name
FROM descendants;`,
    hints: ["Seed the anchor member with `WHERE parent_id = 2`, then recurse on `c.parent_id = d.id`."],
  },
  {
    id: "quiz-ctes-4",
    title: "Name each parent's child count",
    difficulty: "easy",
    topics: ["ctes"],
    description: `Chain two CTEs: count each parent's direct children, then join those counts back to \`categories\` to label them. Return each parent's \`name\` and its child count.`,
    setupSql: SCHEMA,
    solutionSql: `WITH child_counts AS (
  SELECT parent_id, COUNT(*) AS child_count
  FROM categories
  WHERE parent_id IS NOT NULL
  GROUP BY parent_id
),
named AS (
  SELECT c.name, cc.child_count
  FROM child_counts cc
  JOIN categories c ON c.id = cc.parent_id
)
SELECT name, child_count
FROM named;`,
    hints: ["Define both CTEs in one `WITH` (comma-separated); the second joins `child_counts` to `categories`."],
  },
  {
    id: "quiz-ctes-5",
    title: "Above-average child count",
    difficulty: "medium",
    topics: ["ctes"],
    description: `Define a CTE of direct-children counts per parent, then return the \`parent_id\` and count for parents whose count is **greater than the average**. Reference the CTE both in the \`FROM\` and in a subquery for the average.`,
    setupSql: SCHEMA,
    solutionSql: `WITH child_counts AS (
  SELECT parent_id, COUNT(*) AS child_count
  FROM categories
  WHERE parent_id IS NOT NULL
  GROUP BY parent_id
)
SELECT parent_id, child_count
FROM child_counts
WHERE child_count > (SELECT AVG(child_count) FROM child_counts);`,
    hints: ["Compare each row to `(SELECT AVG(child_count) FROM child_counts)` — the same CTE used twice."],
  },
];

export const ctes: Module = {
  id: "ctes",
  title: "CTEs",
  order: 13,
  summary: "Structuring queries with WITH, including recursion.",
  topics: ["ctes"],
  cheatsheetAnchor: "10-ctes",
  drills,
  quiz,
  quizPassThreshold: 4,
  comprehensiveProblemIds: ["recursive-category-tree"],
  comprehensivePathIds: ["ctes-and-dates"],
  status: "authored",
};
