/**
 * Real-browser smoke test of the core loop against a running dev server.
 * Start `npm run dev` first, then: npm run e2e
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PROBLEM = "avg-price-by-category";
const WRONG =
  "SELECT c.name, AVG(p.price) FROM categories c JOIN products p ON p.category_id = c.id GROUP BY c.name";
const RIGHT =
  "SELECT c.name, ROUND(AVG(p.price), 2) FROM categories c JOIN products p ON p.category_id = c.id GROUP BY c.name";

let failed = false;
function check(name, cond) {
  console.log(`${cond ? "✓" : "✗"} ${name}`);
  if (!cond) failed = true;
}

async function waitRunEnabled(page) {
  await page.waitForFunction(() => {
    const run = [...document.querySelectorAll("button")].find((b) =>
      /^Run/.test(b.textContent || ""),
    );
    return run && !run.disabled;
  }, { timeout: 30000 });
}

async function setEditor(page, text) {
  const content = page.locator(".cm-content");
  await content.click();
  // Select-all + delete. (Only Meta+A on macOS — Control+A is "line start" in CodeMirror.)
  await page.keyboard.press("Meta+A");
  await page.keyboard.press("Backspace");
  await page.keyboard.insertText(text);
  await page.waitForTimeout(100);
}

async function runQuery(page) {
  await page.locator("button", { hasText: /^Run/ }).first().click();
}

async function bannerText(page) {
  const banner = page.locator('[role="status"]');
  await banner.waitFor({ timeout: 15000 });
  return (await banner.textContent()) ?? "";
}

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.goto(`${BASE}/problems/${PROBLEM}`, { waitUntil: "networkidle" });
  await page.waitForSelector(".cm-content", { timeout: 30000 });
  await waitRunEnabled(page);
  check("PGlite booted (Run button enabled)", true);

  // Wrong query → fail
  await setEditor(page, WRONG);
  await runQuery(page);
  await page.waitForFunction(
    () => /[✓✗]/.test(document.querySelector('[role="status"]')?.textContent || ""),
    { timeout: 15000 },
  );
  const failText = await bannerText(page);
  check(`wrong query shows a failure banner (${failText.slice(0, 60)}…)`, failText.includes("✗"));

  // Correct query → pass
  await setEditor(page, RIGHT);
  await runQuery(page);
  await page.waitForFunction(
    () => /✓/.test(document.querySelector('[role="status"]')?.textContent || ""),
    { timeout: 15000 },
  );
  const passText = await bannerText(page);
  check(`correct query shows a pass banner (${passText.slice(0, 60)}…)`, passText.includes("✓"));

  // Solved pill appears
  await page.getByText("Solved ✓").first().waitFor({ timeout: 10000 });
  check("solved pill appears after passing", true);

  // Persistence: reload → still solved
  await page.reload({ waitUntil: "networkidle" });
  await page.getByText("Solved ✓").first().waitFor({ timeout: 15000 });
  check("still solved after reload (IndexedDB persistence)", true);

  check("no uncaught page errors", errors.length === 0);
  if (errors.length) console.error(errors.join("\n"));
} catch (e) {
  console.error("E2E threw:", e);
  failed = true;
} finally {
  await browser.close();
}

if (failed) {
  console.error("\nE2E smoke test FAILED.");
  process.exit(1);
}
console.log("\nE2E smoke test passed.");
