import type { Module } from "@/lib/modules/types";
import type { Problem } from "@/lib/problems/types";
import { selectBasics } from "@/data/modules/select-basics";
import { whereFiltering } from "@/data/modules/where-filtering";
import { nullHandling } from "@/data/modules/null-handling";
import { orderByLimit } from "@/data/modules/order-by-limit";
import { aggregation } from "@/data/modules/aggregation";
import { groupByHaving } from "@/data/modules/group-by-having";
import { joins } from "@/data/modules/joins";
import { subqueries } from "@/data/modules/subqueries";
import { setOperations } from "@/data/modules/set-operations";
import { caseExpressions } from "@/data/modules/case-expressions";
import { stringFunctions } from "@/data/modules/string-functions";
import { dateTime } from "@/data/modules/date-time";
import { ctes } from "@/data/modules/ctes";
import { windowFunctions } from "@/data/modules/window-functions";

// Ordered curriculum. `order` drives both display order and "recommended next".
export const MODULES: Module[] = [
  selectBasics, // 1
  whereFiltering, // 2
  nullHandling, // 3
  orderByLimit, // 4
  aggregation, // 5
  groupByHaving, // 6
  joins, // 7
  subqueries, // 8
  setOperations, // 9
  caseExpressions, // 10
  stringFunctions, // 11
  dateTime, // 12
  ctes, // 13
  windowFunctions, // 14
];

export function getModuleById(id: string): Module | undefined {
  return MODULES.find((m) => m.id === id);
}

/**
 * Every drill + quiz problem across all modules. Used by `getProblemById` (so
 * the shared workspace can open a drill) and by the dev self-check (so every
 * drill/quiz solution is validated). Never merged into the `/problems` list.
 */
export const MODULE_PROBLEMS: Problem[] = MODULES.flatMap((m) => [
  ...m.drills,
  ...m.quiz,
]);
