import { chromium } from "playwright";
import { rules } from "./rules.js";
import { assertPublicUrl } from "./guard.js";

const PENALTY = { error: 30, warning: 10 };

export async function analyze(url) {
  await assertPublicUrl(url);

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();

    // Block redirects and subrequests that point to internal addresses
    await page.route("**/*", async (route) => {
      const reqUrl = route.request().url();
      if (!/^https?:/.test(reqUrl)) return route.continue();
      try {
        await assertPublicUrl(reqUrl);
        await route.continue();
      } catch {
        await route.abort();
      }
    });

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

    const results = [];
    for (const rule of rules) {
      const issues = await rule.check(page);
      results.push({
        id: rule.id,
        severity: rule.severity,
        message: rule.message,
        issues,
      });
    }

    let score = 100;
    for (const r of results) {
      if (r.issues.length) score -= PENALTY[r.severity];
    }

    return { url, score: Math.max(0, score), results };
  } finally {
    await browser.close();
  }
}
