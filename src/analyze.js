import { analyze } from "./engine.js";

const url = process.argv[2];

if (!url) {
  console.log("Usage: node src/analyze.js <url>");
  process.exit(1);
}

const report = await analyze(url);

console.log(`\nRTL Lint report for ${report.url}\n`);
for (const r of report.results) {
  const tag =
    r.issues.length === 0 ? "PASS" : r.severity === "error" ? "FAIL" : "WARN";
  console.log(`[${tag}] ${r.id}: ${r.message}`);
  for (const issue of r.issues) console.log(`       - ${issue}`);
}
console.log(`\nScore: ${report.score}/100\n`);