import { chromium } from "playwright";
import { rules } from "./rules.js";

const url = process.argv[2];

if (!url) {
  console.log("Usage: node src/analyze.js <url>");
  process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(url, { waitUntil: "domcontentloaded" });

const results = [];
for (const rule of rules) {
  const issues = await rule.check(page);
  results.push({ ...rule, issues });
}
await browser.close();

const penalty = { error: 30, warning: 10 };
let score = 100;
for (const r of results) {
  if (r.issues.length) score -= penalty[r.severity];
}
score = Math.max(0, score);

console.log(`\nRTL Lint report for ${url}\n`);
for (const r of results) {
  const tag =
    r.issues.length === 0 ? "PASS" : r.severity === "error" ? "FAIL" : "WARN";
  console.log(`[${tag}] ${r.id}: ${r.message}`);
  for (const issue of r.issues) console.log(`       - ${issue}`);
}
console.log(`\nScore: ${score}/100\n`);