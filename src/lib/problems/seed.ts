import type { Problem } from "./types";
import { activeUsers } from "@/data/problems/active-users";
import { signups2023 } from "@/data/problems/signups-2023";
import { countOrdersPerCustomer } from "@/data/problems/count-orders-per-customer";
import { productsNeverOrdered } from "@/data/problems/products-never-ordered";
import { top5ExpensiveProducts } from "@/data/problems/top-5-expensive-products";
import { avgPriceByCategory } from "@/data/problems/avg-price-by-category";
import { customersOver3Orders } from "@/data/problems/customers-over-3-orders";
import { employeesAboveDeptAvg } from "@/data/problems/employees-above-dept-avg";
import { secondHighestSalary } from "@/data/problems/second-highest-salary";
import { monthlyRevenue } from "@/data/problems/monthly-revenue";
import { boughtANotB } from "@/data/problems/bought-a-not-b";
import { runningTotalDailySales } from "@/data/problems/running-total-daily-sales";
import { rankProductsWithinCategory } from "@/data/problems/rank-products-within-category";
import { movingAverage3day } from "@/data/problems/moving-average-3day";
import { secondOrderPerCustomer } from "@/data/problems/second-order-per-customer";
import { highestPaidPerDepartment } from "@/data/problems/highest-paid-per-department";
import { recursiveCategoryTree } from "@/data/problems/recursive-category-tree";
import { gapsInSequence } from "@/data/problems/gaps-in-sequence";
// Interview classics
import { managerVsEmployee } from "@/data/problems/manager-vs-employee";
import { duplicateEmails } from "@/data/problems/duplicate-emails";
import { customersNeverOrder } from "@/data/problems/customers-never-order";
import { customerReferee } from "@/data/problems/customer-referee";
import { rankScores } from "@/data/problems/rank-scores";
import { risingTemperature } from "@/data/problems/rising-temperature";
import { consecutiveNumbers } from "@/data/problems/consecutive-numbers";
import { treeNodeType } from "@/data/problems/tree-node-type";
import { exchangeSeats } from "@/data/problems/exchange-seats";
import { avgSellingPrice } from "@/data/problems/avg-selling-price";
import { departmentTop3Salaries } from "@/data/problems/department-top-3-salaries";
import { stadiumTraffic } from "@/data/problems/stadium-traffic";
import { medianSalary } from "@/data/problems/median-salary";

// The built-in problem set. Add new problems by importing their data file here.
export const SEED_PROBLEMS: Problem[] = [
  // Easy
  activeUsers,
  signups2023,
  countOrdersPerCustomer,
  productsNeverOrdered,
  top5ExpensiveProducts,
  // Medium
  avgPriceByCategory,
  customersOver3Orders,
  employeesAboveDeptAvg,
  secondHighestSalary,
  monthlyRevenue,
  boughtANotB,
  // Hard
  runningTotalDailySales,
  rankProductsWithinCategory,
  movingAverage3day,
  secondOrderPerCustomer,
  highestPaidPerDepartment,
  recursiveCategoryTree,
  gapsInSequence,

  // Interview classics — Easy
  managerVsEmployee,
  duplicateEmails,
  customersNeverOrder,
  customerReferee,
  // Interview classics — Medium
  rankScores,
  risingTemperature,
  consecutiveNumbers,
  treeNodeType,
  exchangeSeats,
  avgSellingPrice,
  // Interview classics — Hard
  departmentTop3Salaries,
  stadiumTraffic,
  medianSalary,
];
