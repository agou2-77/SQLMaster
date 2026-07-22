# The Practical SQL Cheatsheet

A comprehensive, example-driven reference — organized so you learn **when to reach for each tool**, not just its syntax.

**Dialect:** PostgreSQL-first (matches the SQL Master practice app). A [Dialect Differences](#22-dialect-differences) section at the end covers MySQL, SQL Server, SQLite, and Oracle. Anything Postgres-specific is flagged **`PG`**.

---

## Table of contents

1. [The one thing to understand first: logical execution order](#1-logical-execution-order)
2. [The example schema (used throughout)](#2-example-schema)
3. [SELECT — the basics](#3-select-basics)
4. [WHERE — filtering rows](#4-where-filtering-rows)
5. [NULL — the three-valued logic trap](#5-null-handling)
6. [ORDER BY & LIMIT — sorting and paging](#6-order-by--limit)
7. [Aggregation — GROUP BY & HAVING](#7-aggregation)
8. [JOINs — combining tables](#8-joins)
9. [Subqueries & derived tables](#9-subqueries)
10. [CTEs — WITH (incl. recursive)](#10-ctes)
11. [Window functions](#11-window-functions)
12. [Set operations — UNION / INTERSECT / EXCEPT](#12-set-operations)
13. [CASE & conditional logic](#13-case)
14. [Strings](#14-strings)
15. [Numbers & math](#15-numbers)
16. [Dates & times](#16-dates)
17. [Data types & casting](#17-types)
18. [Modifying data — INSERT / UPDATE / DELETE / UPSERT](#18-dml)
19. [Defining tables — DDL, constraints, indexes, views](#19-ddl)
20. [Transactions](#20-transactions)
21. [Performance & indexing](#21-performance)
22. [Dialect differences](#22-dialect-differences)
23. [Classic problem recipes](#23-recipes)
24. [Top gotchas (quick list)](#24-gotchas)

---

<a name="1-logical-execution-order"></a>
## 1. The one thing to understand first: logical execution order

You *write* a query in one order, but the database *evaluates* it in another. Knowing the evaluation order explains almost every "why can't I do that here?" question.

| Step | Clause | What it does |
|-----:|--------|--------------|
| 1 | `FROM` / `JOIN` | Pick and combine the source tables |
| 2 | `WHERE` | Filter **rows** (before grouping) |
| 3 | `GROUP BY` | Collapse rows into groups |
| 4 | `HAVING` | Filter **groups** (after grouping) |
| 5 | `SELECT` | Choose/compute the output columns; assign aliases |
| 6 | `DISTINCT` | Remove duplicate output rows |
| 7 | `ORDER BY` | Sort the result |
| 8 | `LIMIT` / `OFFSET` | Keep a slice |

**Consequences you'll hit constantly:**

- `WHERE` **cannot** reference a `SELECT` alias (WHERE runs before SELECT). `ORDER BY` **can** (it runs after).
  ```sql
  SELECT amount * 0.1 AS tax FROM orders
  WHERE tax > 5;        -- ❌ error: "tax" doesn't exist yet
  WHERE amount * 0.1 > 5 -- ✅ repeat the expression
  ORDER BY tax;          -- ✅ alias is fine here
  ```
- Use `WHERE` to filter **individual rows**; use `HAVING` to filter **aggregated groups**. (See §7.)
- A window function (§11) is computed at the `SELECT` step, so it **can't** appear in `WHERE` — wrap the query in a subquery/CTE to filter on it.

---

<a name="2-example-schema"></a>
## 2. The example schema (used throughout)

```sql
categories(id, name)
products(id, name, category_id → categories.id, price)
customers(id, name, city, signup_date)
orders(id, customer_id → customers.id, order_date, amount, status)  -- status: 'paid' | 'pending' | 'cancelled'
departments(id, name)
employees(id, name, department_id → departments.id, salary, manager_id → employees.id, hire_date)
```

`employees.manager_id` points back to `employees.id` (a self-reference — used for the org-chart examples).

---

<a name="3-select-basics"></a>
## 3. SELECT — the basics

```sql
SELECT id, name FROM customers;          -- specific columns (preferred)
SELECT * FROM customers;                 -- all columns (fine ad-hoc; avoid in production code)
SELECT name AS customer_name FROM customers;   -- alias a column (AS is optional but clearer)
SELECT DISTINCT city FROM customers;     -- unique values
SELECT DISTINCT ON (customer_id) *       -- PG: first row per customer_id
  FROM orders ORDER BY customer_id, order_date DESC;
```

- **`AS` alias:** rename a column or expression. Quote it if it has spaces/caps: `AS "Total Spent"`.
- **`SELECT *` — when to avoid:** in stored queries/views/app code it breaks when columns change and fetches more than you need. Great for quick exploration only.
- **`DISTINCT` vs `GROUP BY`:** `DISTINCT` just dedupes; `GROUP BY` dedupes *and* lets you aggregate per group. If you're only removing duplicates, use `DISTINCT`.
- **`DISTINCT ON (cols)` `PG`:** keeps the first row per group given an `ORDER BY` — a concise "latest row per key" (see §23).

---

<a name="4-where-filtering-rows"></a>
## 4. WHERE — filtering rows

```sql
SELECT * FROM orders
WHERE status = 'paid'                          -- equality
  AND amount BETWEEN 50 AND 200                -- inclusive range
  AND order_date >= DATE '2024-01-01'          -- comparison
  AND customer_id IN (1, 2, 3)                 -- membership
  AND status <> 'cancelled';                   -- not-equal (also !=)
```

| Operator | Use for | Example |
|----------|---------|---------|
| `= <> < <= > >=` | Comparisons (`<>` = not equal) | `price > 100` |
| `AND / OR / NOT` | Combine conditions (mind precedence — parenthesize `OR`) | `a AND (b OR c)` |
| `BETWEEN x AND y` | Inclusive range (`x <= v <= y`) | `amount BETWEEN 10 AND 20` |
| `IN (...)` | Value is one of a small list / subquery | `city IN ('NYC','LA')` |
| `LIKE` / `ILIKE` `PG` | Pattern match: `%`=any run, `_`=one char (`ILIKE`=case-insensitive) | `name ILIKE 'a%'` |
| `~` / `~*` `PG` | Regex match (`*` = case-insensitive) | `name ~ '^[A-C]'` |
| `IS NULL` / `IS NOT NULL` | Test for NULL (never use `= NULL`) | `manager_id IS NULL` |

**When to use `IN` vs `EXISTS` vs a `JOIN`** (to test "does a related row exist?"):
- `IN (subquery)` — readable for small result sets. **Danger:** `NOT IN` breaks if the subquery can return NULL (§5).
- `EXISTS (correlated subquery)` — best for "does at least one match exist"; stops at the first hit; NULL-safe. Prefer `NOT EXISTS` over `NOT IN`.
- `JOIN` — use when you also need **columns** from the other table. Can multiply rows if the match isn't unique (dedupe with `DISTINCT` or use `EXISTS` instead).

```sql
-- customers who have at least one paid order
SELECT * FROM customers c
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'paid');
```

---

<a name="5-null-handling"></a>
## 5. NULL — the three-valued logic trap

`NULL` means **unknown**, not "zero" or "empty string". Any comparison with NULL yields `NULL` (treated as *not true*).

```sql
NULL = NULL      -- → NULL (NOT true!)  ->  use  a IS NULL  /  a IS NOT DISTINCT FROM b
1 = NULL         -- → NULL
NULL + 5         -- → NULL (arithmetic propagates NULL)
```

**The #1 NULL bug — `NOT IN` with a NULL in the list returns *no rows*:**
```sql
-- If ANY value returned here is NULL, the whole NOT IN is never true → 0 rows.
SELECT * FROM products WHERE category_id NOT IN (SELECT category_id FROM discontinued);
-- ✅ Fix: use NOT EXISTS instead
SELECT * FROM products p
WHERE NOT EXISTS (SELECT 1 FROM discontinued d WHERE d.category_id = p.category_id);
```

**NULL-handling functions:**

| Function | Returns | Use for |
|----------|---------|---------|
| `COALESCE(a, b, c, ...)` | first non-NULL argument | default/fallback values: `COALESCE(nickname, name, 'Anon')` |
| `NULLIF(a, b)` | NULL if `a = b`, else `a` | avoid divide-by-zero: `x / NULLIF(y, 0)` |
| `a IS DISTINCT FROM b` `PG` | NULL-safe `<>` (treats NULLs as comparable) | comparing nullable columns |
| `a IS NOT DISTINCT FROM b` `PG` | NULL-safe `=` | join/filter where NULL should match NULL |

- **Aggregates ignore NULLs:** `AVG(salary)` skips NULL salaries; `COUNT(col)` counts non-NULLs, but `COUNT(*)` counts all rows.
- **`ORDER BY`:** NULLs sort last by default on `DESC` in Postgres; control with `NULLS FIRST` / `NULLS LAST`.

---

<a name="6-order-by--limit"></a>
## 6. ORDER BY & LIMIT — sorting and paging

```sql
SELECT name, salary FROM employees
ORDER BY salary DESC, name ASC       -- multi-key: salary desc, ties broken by name
LIMIT 10 OFFSET 20;                  -- rows 21–30 (page 3 of 10)
```

- **No `ORDER BY` = no guaranteed order.** Row order is undefined unless you ask for one.
- `NULLS FIRST` / `NULLS LAST` controls NULL placement: `ORDER BY manager_id NULLS FIRST`.
- **Sort by a column position or expression:** `ORDER BY 2` (2nd select column) — handy, but fragile if you reorder columns.
- **Pagination:** `LIMIT n OFFSET m`. For deep pages, **keyset pagination** is faster than large OFFSETs:
  ```sql
  -- next page after the last seen (id) — no OFFSET scan
  SELECT * FROM orders WHERE id > :last_seen_id ORDER BY id LIMIT 20;
  ```
- Standard-SQL equivalent of LIMIT: `FETCH FIRST 10 ROWS ONLY` (also Postgres). SQL Server uses `TOP` / `OFFSET…FETCH`.

---

<a name="7-aggregation"></a>
## 7. Aggregation — GROUP BY & HAVING

Aggregates collapse many rows into one summary value.

```sql
SELECT c.name, d.name AS dept,
       COUNT(*)              AS n_employees,
       ROUND(AVG(salary), 2) AS avg_salary,
       MAX(salary)           AS top_salary
FROM employees e
JOIN departments d ON d.id = e.department_id
GROUP BY d.name;
```

| Function | Notes |
|----------|-------|
| `COUNT(*)` | counts **rows** (incl. NULLs) |
| `COUNT(col)` | counts non-NULL values of `col` |
| `COUNT(DISTINCT col)` | distinct non-NULL values |
| `SUM / AVG / MIN / MAX(col)` | ignore NULLs |
| `STRING_AGG(col, ', ')` `PG` | concatenate group values into text |
| `ARRAY_AGG(col)` `PG` | collect group values into an array |

**The golden rule of `GROUP BY`:** every column in `SELECT` must be either **inside an aggregate** or **listed in `GROUP BY`**. Otherwise you get an error (or, in lax MySQL, arbitrary results).

**`WHERE` vs `HAVING` — the classic distinction:**
- `WHERE` filters **rows before** grouping (can't use aggregates).
- `HAVING` filters **groups after** aggregation (uses aggregates).

```sql
SELECT customer_id, COUNT(*) AS orders, SUM(amount) AS total
FROM orders
WHERE status = 'paid'          -- keep only paid rows first
GROUP BY customer_id
HAVING COUNT(*) > 3            -- then keep customers with >3 paid orders
ORDER BY total DESC;
```

**`FILTER` — conditional aggregation** `PG` (cleaner than `SUM(CASE WHEN …)`):
```sql
SELECT
  COUNT(*)                                   AS all_orders,
  COUNT(*) FILTER (WHERE status = 'paid')    AS paid,
  SUM(amount) FILTER (WHERE status = 'paid') AS paid_revenue
FROM orders;
```

---

<a name="8-joins"></a>
## 8. JOINs — combining tables

```sql
SELECT o.id, c.name, o.amount
FROM orders o
JOIN customers c ON c.id = o.customer_id;   -- INNER JOIN (JOIN = INNER JOIN)
```

| Join | Keeps | Use when |
|------|-------|----------|
| `INNER JOIN` | rows with a match in **both** tables | you only care about matched pairs |
| `LEFT JOIN` | **all left** rows + matches (NULLs where none) | "all X, and their Y if any" (e.g. all customers + orders) |
| `RIGHT JOIN` | all right rows + matches | rare; usually rewrite as LEFT |
| `FULL OUTER JOIN` | all rows from **both**, matched where possible | reconciling two sets, finding rows missing on either side |
| `CROSS JOIN` | every combination (Cartesian product) | generating grids/combinations; deliberate only |
| self-join | a table joined to itself | hierarchies, comparing rows to other rows |

**`ON` vs `USING`:** `USING (customer_id)` is shorthand when the join column has the **same name** in both tables (and merges it to one output column). `ON` is explicit and general. **Avoid `NATURAL JOIN`** — it silently joins on *all* same-named columns and breaks when schemas change.

**LEFT JOIN as an anti-join** — "rows in A with no match in B":
```sql
SELECT c.*
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.id IS NULL;         -- no order matched → customer never ordered
```
(Equivalent to `NOT EXISTS`; both are idiomatic.)

**⚠️ Row multiplication:** if one left row matches many right rows, the left row is repeated. If you `SUM` after such a join you can double-count. Aggregate the many-side in a subquery first, or use a correlated subquery.

**Filter placement matters on OUTER joins:** a condition on the *right* table in `WHERE` turns a LEFT JOIN back into an INNER JOIN (because NULLs fail the test). Put such conditions in the `ON` clause instead:
```sql
LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'paid'   -- keeps customers with 0 paid orders
```

---

<a name="9-subqueries"></a>
## 9. Subqueries & derived tables

A query nested inside another. Three flavors:

**1. Scalar subquery** — returns a single value, usable anywhere a value is:
```sql
SELECT name, salary,
       salary - (SELECT AVG(salary) FROM employees) AS diff_from_avg
FROM employees;
```

**2. In a predicate** — `IN`, `EXISTS`, `= ANY`, `> ALL`:
```sql
SELECT * FROM products
WHERE price > (SELECT AVG(price) FROM products);        -- above-average price
```

**3. Derived table** (subquery in `FROM`) — treat a result set as a table (must alias it):
```sql
SELECT dept, avg_salary
FROM (
  SELECT department_id AS dept, AVG(salary) AS avg_salary
  FROM employees GROUP BY department_id
) t
WHERE avg_salary > 60000;
```

**Correlated vs uncorrelated:**
- *Uncorrelated* — the subquery is independent; runs once. (e.g. `AVG(price)` above.)
- *Correlated* — references the outer row; conceptually re-runs per outer row. Used with `EXISTS` / per-row calculations:
  ```sql
  SELECT e.name FROM employees e
  WHERE e.salary > (SELECT AVG(e2.salary) FROM employees e2
                    WHERE e2.department_id = e.department_id);  -- above own-dept average
  ```

**`LATERAL`** `PG` — lets a subquery in `FROM` reference earlier tables (a "for-each" join). Great for **top-N per group**:
```sql
SELECT c.name, top.id, top.amount
FROM customers c
CROSS JOIN LATERAL (
  SELECT id, amount FROM orders o
  WHERE o.customer_id = c.id
  ORDER BY amount DESC LIMIT 3          -- top 3 orders per customer
) top;
```

**Subquery vs JOIN vs CTE:** use a **JOIN** when you need columns from both tables; a **subquery** for a single computed value or existence test; a **CTE** (§10) when the same subquery is reused or the query is getting hard to read.

---

<a name="10-ctes"></a>
## 10. CTEs — `WITH` (Common Table Expressions)

A named, temporary result set defined at the top of a query. **Use them to make complex queries readable** and to reuse a subresult.

```sql
WITH paid AS (
  SELECT customer_id, SUM(amount) AS total
  FROM orders WHERE status = 'paid'
  GROUP BY customer_id
),
big_spenders AS (
  SELECT * FROM paid WHERE total > 1000
)
SELECT c.name, b.total
FROM big_spenders b
JOIN customers c ON c.id = b.customer_id
ORDER BY b.total DESC;
```

- **When to use:** the query has multiple stages, or you reference the same subquery twice, or you just want top-to-bottom readability. Functionally similar to derived tables but far cleaner to read.
- **Materialization** `PG`: since PG12 CTEs are inlined (optimized) by default. Force it with `WITH x AS MATERIALIZED (…)` / prevent it with `NOT MATERIALIZED`.

**Recursive CTE** — for hierarchies (org charts, category trees, graph walks). Structure: a **base case**, `UNION ALL`, then a **recursive case** that references the CTE itself.
```sql
WITH RECURSIVE chain AS (
  -- base: the top manager (no manager)
  SELECT id, name, manager_id, 1 AS level
  FROM employees WHERE manager_id IS NULL
  UNION ALL
  -- recursive: employees reporting to someone already in `chain`
  SELECT e.id, e.name, e.manager_id, c.level + 1
  FROM employees e
  JOIN chain c ON e.manager_id = c.id
)
SELECT level, name FROM chain ORDER BY level, name;
```

---

<a name="11-window-functions"></a>
## 11. Window functions

Compute a value **across a set of related rows without collapsing them** — you keep every detail row *and* get the aggregate/rank alongside it. This is the key difference from `GROUP BY`.

```sql
SELECT name, department_id, salary,
       AVG(salary)  OVER (PARTITION BY department_id)                       AS dept_avg,
       RANK()       OVER (PARTITION BY department_id ORDER BY salary DESC)  AS dept_rank,
       salary - LAG(salary) OVER (ORDER BY hire_date)                       AS vs_prev_hire
FROM employees;
```

Anatomy: `func() OVER (PARTITION BY … ORDER BY … <frame>)`
- **`PARTITION BY`** — split rows into groups (like GROUP BY, but rows stay). Omit = whole result is one partition.
- **`ORDER BY`** (inside OVER) — orders rows within the partition; required for ranking and running calculations.
- **frame** — which rows around the current one to include (see below).

| Category | Functions | Use for |
|----------|-----------|---------|
| Ranking | `ROW_NUMBER()`, `RANK()`, `DENSE_RANK()`, `NTILE(n)` | numbering, top-N per group, percentiles/buckets |
| Offset | `LAG(col, n)`, `LEAD(col, n)`, `FIRST_VALUE`, `LAST_VALUE`, `NTH_VALUE` | compare to previous/next row, deltas |
| Aggregate | `SUM/AVG/COUNT/MIN/MAX OVER (…)` | running totals, moving averages |

**ROW_NUMBER vs RANK vs DENSE_RANK** (ties on the ORDER BY value):
```
salary: 100  90  90  80
ROW_NUMBER:  1   2   3   4     -- always unique
RANK:        1   2   2   4     -- ties share, next skips
DENSE_RANK:  1   2   2   3     -- ties share, next does NOT skip
```

**Running total & moving average — frames:**
```sql
SELECT sale_date, amount,
  SUM(amount) OVER (ORDER BY sale_date)                                       AS running_total,
  AVG(amount) OVER (ORDER BY sale_date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS moving_avg_3
FROM daily_sales;
```
- **Frame gotcha:** with `ORDER BY` present, the default frame is `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`. That means `LAST_VALUE(...) OVER (ORDER BY x)` returns the *current* row, not the partition's last — because the frame ends at the current row. Fix by widening the frame: `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`.
- **Filtering on a window result:** window functions run at SELECT time, so they can't go in `WHERE`. Wrap in a CTE/subquery:
  ```sql
  WITH ranked AS (
    SELECT *, ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC) AS rn
    FROM employees)
  SELECT * FROM ranked WHERE rn <= 3;   -- top 3 earners per department
  ```
- **`WINDOW` clause** to name and reuse a window spec: `… OVER w … WINDOW w AS (PARTITION BY … ORDER BY …)`.

---

<a name="12-set-operations"></a>
## 12. Set operations — UNION / INTERSECT / EXCEPT

Combine the results of two queries **with the same column count & compatible types**.

```sql
SELECT name FROM customers
UNION            -- rows in either, DUPLICATES REMOVED (sorts to dedupe → costlier)
SELECT name FROM employees;

SELECT name FROM customers
UNION ALL        -- rows in either, KEEP duplicates (faster — use unless you need dedup)
SELECT name FROM employees;

SELECT city FROM customers INTERSECT SELECT city FROM stores;   -- in both
SELECT city FROM customers EXCEPT    SELECT city FROM stores;   -- in first but not second
```

- **`UNION` vs `UNION ALL`:** `UNION` de-duplicates (extra work); `UNION ALL` doesn't. Default to `UNION ALL` unless you specifically need duplicates gone.
- Column **names** come from the first query; column **order/type** must line up across all queries.
- Sort the *combined* result with a single `ORDER BY` at the very end.

---

<a name="13-case"></a>
## 13. CASE & conditional logic

`CASE` is SQL's if/else — usable in `SELECT`, `WHERE`, `ORDER BY`, `GROUP BY`, and inside aggregates.

```sql
SELECT name, salary,
  CASE                              -- "searched" CASE (arbitrary conditions)
    WHEN salary >= 100000 THEN 'senior'
    WHEN salary >= 60000  THEN 'mid'
    ELSE 'junior'
  END AS band
FROM employees;

SELECT CASE status                  -- "simple" CASE (compare one expression to values)
         WHEN 'paid' THEN 'Done' WHEN 'pending' THEN 'Waiting' ELSE 'Other'
       END
FROM orders;
```

**Conditional aggregation / pivoting** — turn rows into columns:
```sql
SELECT
  customer_id,
  SUM(CASE WHEN status = 'paid'      THEN amount ELSE 0 END) AS paid,
  SUM(CASE WHEN status = 'cancelled' THEN amount ELSE 0 END) AS cancelled
FROM orders GROUP BY customer_id;
```
(Postgres also has `crosstab()` via the `tablefunc` extension for true pivots.)

**Shorthands:** `COALESCE` (first non-NULL), `NULLIF`, `GREATEST(a,b,…)` / `LEAST(a,b,…)` (max/min across columns of one row).

---

<a name="14-strings"></a>
## 14. Strings

```sql
'Hello' || ' ' || 'World'        -- PG concatenation → 'Hello World'  (|| ; MySQL: CONCAT())
CONCAT('a', NULL, 'b')           -- → 'ab'   (CONCAT ignores NULL; || yields NULL if any arg NULL)
LENGTH(name)                     -- character count
LOWER(x) / UPPER(x)              -- case
TRIM(x) / LTRIM / RTRIM          -- strip whitespace (or given chars)
SUBSTRING(name FROM 1 FOR 3)     -- first 3 chars  (also SUBSTRING(name, 1, 3))
POSITION('@' IN email)           -- index of substring (0 if absent)
REPLACE(x, 'a', 'b')             -- replace all occurrences
SPLIT_PART('a-b-c', '-', 2)      -- PG: → 'b'  (nth field by delimiter)
LEFT(x, 3) / RIGHT(x, 3)         -- ends
name ILIKE '%son'                -- PG case-insensitive LIKE
name ~* 'jo.n'                   -- PG regex (case-insensitive)
TO_CHAR(order_date, 'YYYY-MM')   -- format value to text
```

- **Concatenation trap:** `||` returns NULL if *any* operand is NULL; use `CONCAT()` (or `COALESCE`) to treat NULLs as empty.
- **Case-insensitive search:** `ILIKE` `PG`, or `LOWER(col) = LOWER(:val)` (portable, but wrap the column in an index if it's hot — see §21).
- Strings are 1-indexed in SQL.

---

<a name="15-numbers"></a>
## 15. Numbers & math

```sql
ROUND(3.14159, 2)   -- 3.14
CEIL(4.2)  FLOOR(4.8)  TRUNC(4.78, 1)  -- 5, 4, 4.7
ABS(-5)   MOD(10, 3)   POWER(2, 10)   SQRT(9)
```

**⚠️ Integer division truncates:** `5 / 2 = 2` when both are integers. Force decimals by casting one side:
```sql
SELECT 5 / 2;                 -- → 2
SELECT 5.0 / 2;               -- → 2.5
SELECT count_a::numeric / count_b;   -- ratio (also guard count_b with NULLIF(count_b,0))
```

**Divide-by-zero guard:** `x / NULLIF(y, 0)` returns NULL instead of erroring.

**Float vs exact:** `float`/`double` are approximate — never test them with `=`. Use `numeric`/`decimal` for money and exact math.

---

<a name="16-dates"></a>
## 16. Dates & times

```sql
CURRENT_DATE            -- today (date)
NOW()  /  CURRENT_TIMESTAMP    -- now (timestamptz)
DATE '2024-01-15'       -- literal
order_date + INTERVAL '7 days'          -- date arithmetic
NOW() - INTERVAL '1 month'
EXTRACT(YEAR  FROM order_date)          -- pull a field → number
EXTRACT(DOW   FROM order_date)          -- day of week (0=Sun)
DATE_TRUNC('month', order_date)         -- PG: floor to start of month/day/hour/…
AGE(NOW(), hire_date)                   -- PG: human interval, e.g. '3 years 2 mons'
TO_CHAR(order_date, 'YYYY-MM-DD')       -- format to text
generate_series(DATE '2024-01-01', DATE '2024-12-01', INTERVAL '1 month')  -- PG: a calendar
```

**Common patterns:**
```sql
-- rows from the last 30 days
WHERE order_date >= CURRENT_DATE - INTERVAL '30 days'

-- monthly revenue (bucket by month)
SELECT DATE_TRUNC('month', order_date)::date AS month, SUM(amount)
FROM orders GROUP BY 1 ORDER BY 1;

-- filter one calendar year (sargable: range, not a function on the column)
WHERE order_date >= '2024-01-01' AND order_date < '2025-01-01'
```
- **Prefer a date *range* over `EXTRACT(YEAR FROM col) = 2024`** in `WHERE` — wrapping the column in a function prevents index use (§21).
- `date` vs `timestamp` vs `timestamptz`: use `timestamptz` when storing real-world event times (it's timezone-aware).

---

<a name="17-types"></a>
## 17. Data types & casting

**Common Postgres types:** `integer`/`bigint`, `numeric(p,s)`/`decimal` (exact), `real`/`double precision` (approx), `text`/`varchar(n)`, `boolean`, `date`/`timestamp`/`timestamptz`, `uuid`, `json`/`jsonb`, arrays (`int[]`).

**Casting:**
```sql
'42'::integer            -- PG shorthand
CAST('42' AS integer)    -- standard SQL
amount::numeric(10,2)
'2024-01-01'::date
```
- Cast to control division (§15), format output, or compare across types.
- `text` vs `varchar(n)`: in Postgres there's no performance difference; use `text` unless you need the length constraint.

---

<a name="18-dml"></a>
## 18. Modifying data — INSERT / UPDATE / DELETE / UPSERT

```sql
-- INSERT (single, multi, and from a query)
INSERT INTO categories (name) VALUES ('Books');
INSERT INTO categories (name) VALUES ('Books'), ('Toys'), ('Games');
INSERT INTO archive_orders SELECT * FROM orders WHERE status = 'cancelled';

-- UPDATE (⚠️ WHERE or you update EVERY row)
UPDATE orders SET status = 'paid' WHERE id = 42;

-- UPDATE using another table (PG: UPDATE … FROM)
UPDATE orders o
SET amount = amount * 1.1
FROM customers c
WHERE o.customer_id = c.id AND c.city = 'NYC';

-- DELETE (⚠️ WHERE or you delete EVERYTHING)
DELETE FROM orders WHERE status = 'cancelled';

-- UPSERT — insert, or update if the key already exists (PG)
INSERT INTO inventory (product_id, qty) VALUES (7, 100)
ON CONFLICT (product_id) DO UPDATE SET qty = inventory.qty + EXCLUDED.qty;
--                        DO NOTHING;   -- alternative: ignore duplicates

-- RETURNING — get the affected rows back (PG), e.g. the new id
INSERT INTO customers (name) VALUES ('Zoe') RETURNING id;
```

- **Always run the `WHERE` as a `SELECT` first** to confirm which rows you'll touch.
- `EXCLUDED` in `ON CONFLICT` refers to the row you *tried* to insert.
- `TRUNCATE table;` empties a table fast (no per-row triggers/WHERE) — irreversible without a transaction.

---

<a name="19-ddl"></a>
## 19. Defining tables — DDL, constraints, indexes, views

```sql
CREATE TABLE employees (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,  -- auto id (PG10+; older: serial)
  name          text        NOT NULL,
  email         text        UNIQUE,
  department_id integer     REFERENCES departments(id) ON DELETE SET NULL,
  salary        numeric(10,2) CHECK (salary >= 0),
  manager_id    integer     REFERENCES employees(id),
  hire_date     date        NOT NULL DEFAULT CURRENT_DATE
);
```

| Constraint | Guarantees | Use for |
|------------|-----------|---------|
| `PRIMARY KEY` | unique + not null; the row's identity | every table should have one |
| `FOREIGN KEY` (`REFERENCES`) | value exists in the parent table | referential integrity |
| `UNIQUE` | no duplicate values | natural keys (email, SKU) |
| `NOT NULL` | value required | mandatory fields |
| `CHECK (expr)` | row satisfies a rule | domain rules (`price >= 0`) |
| `DEFAULT expr` | value when none supplied | timestamps, flags |

**`ON DELETE`:** `CASCADE` (delete children too), `SET NULL`, `RESTRICT`/`NO ACTION` (block).

```sql
ALTER TABLE employees ADD COLUMN active boolean NOT NULL DEFAULT true;
ALTER TABLE employees ALTER COLUMN salary TYPE numeric(12,2);
ALTER TABLE employees DROP COLUMN active;
DROP TABLE IF EXISTS temp_data;

-- Indexes: speed up lookups/joins/sorts on the indexed columns
CREATE INDEX idx_orders_customer ON orders (customer_id);
CREATE UNIQUE INDEX idx_users_email ON users (lower(email));   -- expression index
CREATE INDEX idx_orders_paid ON orders (order_date) WHERE status = 'paid';  -- partial index (PG)

-- Views: a saved query you can select from like a table
CREATE VIEW paid_orders AS SELECT * FROM orders WHERE status = 'paid';
-- Materialized view: stores the result; refresh manually (PG)
CREATE MATERIALIZED VIEW monthly_rev AS SELECT DATE_TRUNC('month', order_date) m, SUM(amount) FROM orders GROUP BY 1;
REFRESH MATERIALIZED VIEW monthly_rev;
```

- **View** = live query (always current, no storage). **Materialized view** = cached result (fast reads, can go stale until refreshed). Use a materialized view for expensive aggregates you read often and can tolerate slight staleness.

---

<a name="20-transactions"></a>
## 20. Transactions

Group statements so they **all succeed or all fail** (atomicity).

```sql
BEGIN;
  UPDATE accounts SET balance = balance - 100 WHERE id = 1;
  UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;        -- make it permanent
-- ROLLBACK;   -- undo everything since BEGIN

BEGIN;
  UPDATE ...;
  SAVEPOINT sp1;
  UPDATE ...;              -- if this is wrong:
  ROLLBACK TO sp1;         -- undo just back to the savepoint
COMMIT;
```

- **Use for:** any multi-statement change that must be consistent (money transfers, order + line items, migrations).
- **Isolation levels** (default `READ COMMITTED`): raise to `REPEATABLE READ` / `SERIALIZABLE` to prevent anomalies when transactions run concurrently — at the cost of more contention/retries.
- Keep transactions **short**; long-open transactions hold locks and bloat the database.

---

<a name="21-performance"></a>
## 21. Performance & indexing (the 80/20)

- **Read the plan:** `EXPLAIN ANALYZE <query>;` shows how the DB executes it and where the time goes. `Seq Scan` on a large table you filter/join on = a missing index.
- **Index what you filter, join, and sort on** — `WHERE`, `JOIN … ON`, and `ORDER BY` columns. Especially foreign keys (they're not auto-indexed in Postgres).
- **Keep predicates "sargable"** (index-usable): compare the *bare column* to a value. Wrapping the column in a function or math defeats the index:
  ```sql
  WHERE EXTRACT(YEAR FROM order_date) = 2024   -- ❌ can't use a plain index on order_date
  WHERE order_date >= '2024-01-01' AND order_date < '2025-01-01'  -- ✅ range, index-friendly
  WHERE lower(email) = 'a@b.com'   -- ❌ unless you build an expression index on lower(email)
  ```
- **`SELECT` only the columns you need** — less I/O, and enables index-only scans.
- **Composite index column order matters:** an index on `(a, b)` helps `WHERE a = …` and `WHERE a = … AND b = …`, but not `WHERE b = …` alone.
- **Indexes aren't free:** they speed reads but slow writes and use space. Don't index everything.
- **`EXISTS` over `IN`/`COUNT`** for "is there at least one?" — it can stop at the first match.
- **Filter early, aggregate late:** cut rows in `WHERE`/join conditions before grouping.

---

<a name="22-dialect-differences"></a>
## 22. Dialect differences

| Feature | PostgreSQL | MySQL | SQL Server | SQLite | Oracle |
|---------|-----------|-------|-----------|--------|--------|
| Limit rows | `LIMIT n OFFSET m` | `LIMIT m, n` | `TOP n` / `OFFSET…FETCH` | `LIMIT n OFFSET m` | `FETCH FIRST n ROWS ONLY` |
| String concat | `\|\|` or `CONCAT` | `CONCAT()` (`\|\|`=OR) | `+` or `CONCAT` | `\|\|` | `\|\|` |
| Case-insensitive LIKE | `ILIKE` | `LIKE` (collation) | `LIKE` (collation) | `LIKE` (ASCII) | `LIKE`+`LOWER` |
| NULL fallback | `COALESCE` | `IFNULL`/`COALESCE` | `ISNULL`/`COALESCE` | `IFNULL`/`COALESCE` | `NVL`/`COALESCE` |
| Auto id | `IDENTITY`/`serial` | `AUTO_INCREMENT` | `IDENTITY` | `AUTOINCREMENT` | `IDENTITY`/sequence |
| Current time | `NOW()` | `NOW()` | `GETDATE()` | `datetime('now')` | `SYSDATE` |
| Identifier quoting | `"col"` | `` `col` `` | `[col]` | `"col"` | `"col"` |
| Boolean type | native `boolean` | `TINYINT(1)` | `BIT` | `0/1` | `0/1`/`CHAR` |
| Upsert | `ON CONFLICT` | `ON DUPLICATE KEY UPDATE` | `MERGE` | `ON CONFLICT` | `MERGE` |
| String agg | `STRING_AGG` | `GROUP_CONCAT` | `STRING_AGG` | `GROUP_CONCAT` | `LISTAGG` |
| "No FROM" table | (none needed) | (none needed) | (none needed) | (none needed) | `DUAL` |

`COALESCE`, `CASE`, standard JOINs, `GROUP BY`/`HAVING`, and window functions (modern versions) are portable everywhere.

---

<a name="23-recipes"></a>
## 23. Classic problem recipes

**Second-highest value:**
```sql
SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees);
-- or: SELECT DISTINCT salary FROM employees ORDER BY salary DESC LIMIT 1 OFFSET 1;
```

**Top-N per group** (highest-paid per department):
```sql
WITH r AS (SELECT *, ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC) rn
           FROM employees)
SELECT * FROM r WHERE rn = 1;
```

**Latest row per key** (most recent order per customer):
```sql
SELECT DISTINCT ON (customer_id) *          -- PG idiom
FROM orders ORDER BY customer_id, order_date DESC;
```

**Deduplicate, keeping one** (lowest id per email):
```sql
DELETE FROM users a USING users b
WHERE a.email = b.email AND a.id > b.id;
```

**Running total / moving average:** see §11.

**Rows with no match (anti-join)** — customers who never ordered: §8 (`LEFT JOIN … IS NULL`) or `NOT EXISTS`.

**Gaps in a sequence:**
```sql
WITH s AS (SELECT id, LEAD(id) OVER (ORDER BY id) AS next_id FROM seq)
SELECT id + 1 AS gap_start, next_id - 1 AS gap_end
FROM s WHERE next_id - id > 1;
```

**Pivot (rows → columns):** conditional aggregation, §13.

**Hierarchy / tree walk:** recursive CTE, §10.

**Percent of total** (each dept's share of payroll):
```sql
SELECT department_id, SUM(salary),
       ROUND(100.0 * SUM(salary) / SUM(SUM(salary)) OVER (), 1) AS pct
FROM employees GROUP BY department_id;
```

---

<a name="24-gotchas"></a>
## 24. Top gotchas (quick list)

1. **`NOT IN` + a NULL** in the list → **zero rows**. Use `NOT EXISTS`. (§5)
2. **`= NULL` never matches.** Use `IS NULL`. (§5)
3. **`WHERE` can't see `SELECT` aliases** (order of evaluation). `ORDER BY` can. (§1)
4. **`WHERE` vs `HAVING`:** rows vs groups. Aggregates belong in `HAVING`. (§7)
5. **`GROUP BY` needs every non-aggregated SELECT column.** (§7)
6. **Integer division truncates:** `5/2 = 2`. Cast to get `2.5`. (§15)
7. **Window functions can't go in `WHERE`** — wrap in a CTE/subquery. (§11)
8. **A `WHERE` filter on the right table cancels a `LEFT JOIN`** — put it in `ON`. (§8)
9. **JOINs can multiply rows** and inflate `SUM`/`COUNT` — aggregate first or use `EXISTS`. (§8)
10. **No `ORDER BY` = no guaranteed order.** (§6)
11. **`UNION` de-duplicates (slow); `UNION ALL` doesn't.** Pick deliberately. (§12)
12. **Functions on a filtered column kill index use.** Prefer ranges. (§16, §21)
13. **`||` yields NULL if any operand is NULL.** Use `CONCAT`/`COALESCE`. (§14)
14. **`UPDATE`/`DELETE` without `WHERE`** hits every row. Preview with `SELECT` first. (§18)
15. **Don't test floats with `=`.** Use `numeric` for exact values. (§15)

---

*Tip: pair this with the SQL Master app — pick a problem, then find the matching section here to see the pattern in context.*
