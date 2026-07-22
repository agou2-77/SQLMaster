import type { Problem } from "@/lib/problems/types";

export const treeNodeType: Problem = {
  id: "tree-node-type",
  title: "Classify tree nodes",
  difficulty: "medium",
  topics: ["subqueries"],
  description: `Each row in \`tree\` is a node with a \`parent_id\`. Return every node's \`id\` and
its \`type\`:

- **\`Root\`** — the node has no parent (\`parent_id IS NULL\`).
- **\`Inner\`** — the node has a parent **and** is itself the parent of other nodes.
- **\`Leaf\`** — the node has a parent but no children.`,
  setupSql: `
CREATE TABLE tree (
  id        int PRIMARY KEY,
  parent_id int REFERENCES tree(id)
);

INSERT INTO tree (id, parent_id) VALUES
  (1, NULL),   -- Root
  (2, 1),      -- has children (4,5) → Inner
  (3, 1),      -- no children → Leaf
  (4, 2),      -- Leaf
  (5, 2);      -- Leaf
`,
  solutionSql: `SELECT id,
       CASE
         WHEN parent_id IS NULL THEN 'Root'
         WHEN id IN (SELECT parent_id FROM tree WHERE parent_id IS NOT NULL) THEN 'Inner'
         ELSE 'Leaf'
       END AS type
FROM tree
ORDER BY id;`,
  hints: [
    "Three cases → a `CASE` expression. The Root test is easy: `parent_id IS NULL`.",
    "A node is `Inner` if its `id` appears in the set of parent_ids: `id IN (SELECT parent_id FROM tree WHERE parent_id IS NOT NULL)`. Everything else with a parent is a `Leaf`. Check Root first so the order of WHEN branches is correct.",
  ],
};
