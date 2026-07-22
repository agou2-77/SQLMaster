/**
 * Unit assertions for the result comparator's edge cases.
 * Run with: npm run check:compare
 */
import { compareResults, normalizeCell } from "@/lib/validation/compareResults";
import type { RunResult } from "@/lib/problems/types";

let failures = 0;
function assert(name: string, cond: boolean) {
  if (cond) {
    console.log(`✓ ${name}`);
  } else {
    console.error(`✗ ${name}`);
    failures++;
  }
}

const R = (columns: string[], rows: unknown[][], error?: string): RunResult => ({
  columns,
  rows,
  error,
});

// --- normalizeCell coercions ---
assert('numeric string "2.50" == number 2.5', normalizeCell("2.50") === normalizeCell(2.5));
assert('numeric string "10" == number 10', normalizeCell("10") === normalizeCell(10));
assert("NULL != empty string", normalizeCell(null) !== normalizeCell(""));
assert("NULL != 0", normalizeCell(null) !== normalizeCell(0));
assert("null == undefined", normalizeCell(null) === normalizeCell(undefined));
assert("bigint 10n == number 10", normalizeCell(BigInt(10)) === normalizeCell(10));
assert("boolean true != string 'true'", normalizeCell(true) !== normalizeCell("true"));
assert("non-numeric string stays distinct", normalizeCell("abc") !== normalizeCell("abd"));

// --- unordered multiset: identical data, different row order → pass ---
assert(
  "unordered: same rows different order pass",
  compareResults(
    R(["a"], [[1], [2], [3]]),
    R(["a"], [[3], [1], [2]]),
  ).pass,
);

// --- unordered: duplicate rows must match by multiplicity ---
assert(
  "unordered: duplicate multiplicity matters (fail)",
  !compareResults(
    R(["a"], [[1], [1], [2]]),
    R(["a"], [[1], [2], [2]]),
  ).pass,
);
assert(
  "unordered: duplicates equal (pass)",
  compareResults(
    R(["a"], [[1], [1], [2]]),
    R(["a"], [[2], [1], [1]]),
  ).pass,
);

// --- numeric-as-string vs number across sides → pass ---
assert(
  "numeric string result matches numeric expected",
  compareResults(
    R(["price"], [["2.50"], ["10.00"]]),
    R(["price"], [[2.5], [10]]),
  ).pass,
);

// --- ordered: order matters ---
assert(
  "ordered: correct order passes",
  compareResults(R(["a"], [[1], [2]]), R(["a"], [[1], [2]]), { ordered: true }).pass,
);
assert(
  "ordered: wrong order fails",
  !compareResults(R(["a"], [[1], [2]]), R(["a"], [[2], [1]]), { ordered: true }).pass,
);

// --- column count mismatch ---
assert(
  "column count mismatch fails",
  !compareResults(R(["a", "b"], [[1, 2]]), R(["a"], [[1]])).pass,
);

// --- row count mismatch ---
assert(
  "row count mismatch fails",
  !compareResults(R(["a"], [[1], [2]]), R(["a"], [[1]])).pass,
);

// --- enforceColumnNames ---
assert(
  "enforceColumnNames: mismatched name fails",
  !compareResults(R(["total"], [[1]]), R(["cnt"], [[1]]), { enforceColumnNames: true }).pass,
);
assert(
  "enforceColumnNames: case-insensitive match passes",
  compareResults(R(["Total"], [[1]]), R(["total"], [[1]]), { enforceColumnNames: true }).pass,
);
assert(
  "default (no enforce): names ignored, values match → pass",
  compareResults(R(["total"], [[1]]), R(["whatever"], [[1]])).pass,
);

// --- user error surfaces as fail ---
assert(
  "actual.error → fail",
  !compareResults(R(["a"], [[1]]), R([], [], "syntax error")).pass,
);

// --- NULL handling in rows ---
assert(
  "rows with NULLs compare equal",
  compareResults(R(["a"], [[null], [1]]), R(["a"], [[1], [null]])).pass,
);

if (failures > 0) {
  console.error(`\n${failures} comparator assertion(s) failed.`);
  process.exit(1);
}
console.log("\nAll comparator assertions passed.");
