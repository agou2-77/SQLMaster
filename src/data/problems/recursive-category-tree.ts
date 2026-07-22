import type { Problem } from "@/lib/problems/types";

export const recursiveCategoryTree: Problem = {
  id: "recursive-category-tree",
  title: "Category tree depth (recursive)",
  difficulty: "hard",
  topics: ["ctes"],
  description: `\`categories\` form a tree: each row's \`parent_id\` points to its parent, or is
\`NULL\` for a root.

Return each category's \`name\` and its **depth** in the tree, where root categories
have depth **1**, their children depth 2, and so on.`,
  setupSql: `
CREATE TABLE categories (
  id        int PRIMARY KEY,
  name      text NOT NULL,
  parent_id int REFERENCES categories(id)
);

INSERT INTO categories (id, name, parent_id) VALUES
  (1, 'Electronics', NULL),
  (2, 'Computers',   1),
  (3, 'Laptops',     2),
  (4, 'Phones',      1),
  (5, 'Books',       NULL);
`,
  solutionSql: `WITH RECURSIVE tree AS (
  SELECT id, name, 1 AS depth
  FROM categories
  WHERE parent_id IS NULL
  UNION ALL
  SELECT c.id, c.name, t.depth + 1
  FROM categories c
  JOIN tree t ON c.parent_id = t.id
)
SELECT name, depth
FROM tree;`,
  hints: [
    "This needs a recursive CTE: a base case for roots, and a recursive case that joins children to their parent.",
    "Base: `SELECT id, name, 1 AS depth FROM categories WHERE parent_id IS NULL`. Recursive: join `categories` to the CTE on `parent_id = tree.id` and add 1 to depth.",
  ],
};
