import type { Problem } from "@/lib/problems/types";

export const avgSellingPrice: Problem = {
  id: "avg-selling-price",
  title: "Average selling price",
  difficulty: "medium",
  topics: ["joins", "aggregation", "date-time"],
  description: `\`prices\` gives each product's price during a date range; \`units_sold\` records how
many units sold on a given day. For each \`product_id\`, compute the
**weighted average selling price**:

\`\`\`
SUM(price × units) / SUM(units)
\`\`\`

using the price whose date range contains each sale's \`purchase_date\`. Round the
result to **2 decimal places** and return \`product_id\` and \`average_price\`.`,
  setupSql: `
CREATE TABLE prices (
  product_id int  NOT NULL,
  start_date date NOT NULL,
  end_date   date NOT NULL,
  price      numeric(10, 2) NOT NULL
);
CREATE TABLE units_sold (
  product_id    int  NOT NULL,
  purchase_date date NOT NULL,
  units         int  NOT NULL
);

INSERT INTO prices (product_id, start_date, end_date, price) VALUES
  (1, '2024-01-01', '2024-01-31', 5.00),
  (1, '2024-02-01', '2024-02-28', 10.00),
  (2, '2024-01-01', '2024-01-31', 3.00);

INSERT INTO units_sold (product_id, purchase_date, units) VALUES
  (1, '2024-01-15', 10),   -- @ 5.00
  (1, '2024-02-10', 5),    -- @ 10.00  → (50+50)/15 = 6.67
  (2, '2024-01-20', 4);    -- @ 3.00   → 12/4 = 3.00
`,
  solutionSql: `SELECT p.product_id,
       ROUND(SUM(p.price * u.units) / SUM(u.units), 2) AS average_price
FROM prices p
JOIN units_sold u
  ON u.product_id = p.product_id
 AND u.purchase_date BETWEEN p.start_date AND p.end_date
GROUP BY p.product_id;`,
  hints: [
    "Join each sale to the price row whose range covers it: `ON u.product_id = p.product_id AND u.purchase_date BETWEEN p.start_date AND p.end_date`.",
    "A weighted average is `SUM(price * units) / SUM(units)`, grouped by product. Wrap it in `ROUND(..., 2)`.",
  ],
};
