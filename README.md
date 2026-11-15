\# RTL Lint

**Live demo:** https://YOUR-LINK.onrender.com (free tier: the first request may take about a minute while the service wakes up)



Automated checker for Arabic and right-to-left (RTL) support on websites. Give it a URL, and it loads the page in a real browser, runs a set of rules, and prints a report with a 0-100 score.



\## Why this exists



Many websites claim Arabic support but break in subtle ways: wrong `dir` or `lang` attributes, text forced to the left, and layouts built on physical `left`/`right` CSS that don't mirror correctly. Developers usually find these bugs by eye. RTL Lint turns them into repeatable, automated checks.



\## What it checks



| Rule | Severity | What it detects |

|------|----------|-----------------|

| `html-dir` | error | `<html>` is missing `dir="rtl"` |

| `html-lang` | error | `<html>` is missing `lang="ar"` |

| `text-align-left` | warning | Arabic block text forced to `text-align: left` |

| `physical-properties` | warning | CSS using `margin-left`, `padding-right`, `float`, etc. instead of logical properties (`margin-inline-start`, ...) |



\## Quick start



```bash

git clone https://github.com/engjenanhelmy-dot/rtl-lint.git

cd rtl-lint

npm install

npx playwright install chromium

node src/analyze.js https://ar.wikipedia.org

```



\## Example output



```

RTL Lint report for https://ar.wikipedia.org



\[PASS] html-dir: The <html> element should have dir="rtl"

\[PASS] html-lang: The <html> element should have lang="ar"

\[PASS] text-align-left: Arabic text is forced to text-align: left

\[WARN] physical-properties: CSS uses physical left/right properties instead of logical ones

&#x20;      - margin-left: 58 declarations

&#x20;      - padding-right: 71 declarations

&#x20;      ...



Score: 90/100

```



\## Results on real sites



Measured on 2026-11-15:



| Site | Score | Notes |

|------|-------|-------|

| ar.wikipedia.org | 90/100 | Correct `dir` and `lang`; 333 physical-property declarations |

| aljazeera.net | 90/100 | Correct `dir` and `lang`; 1,132 physical-property declarations |

| wikipedia.org | 30/100 | English portal: missing `dir`, `lang="en"`, 239 physical-property declarations |



\## How it works



1\. Playwright launches headless Chromium and loads the page.

2\. Each rule in `src/rules.js` inspects the live DOM and computed styles.

3\. Results are aggregated into a report and a score.



Rules are independent objects with an `id`, `severity`, and `check(page)` function, so adding a new rule is a single entry in the list.



\## Design notes



\- \*\*False-positive handling:\*\* an early version of `text-align-left` flagged inline elements (`<bdi>`), where `text-align` has no effect. The rule now skips inline elements and only checks elements whose computed `direction` is `rtl`.

\- \*\*Physical properties are context-dependent:\*\* on an Arabic-only site, `margin-left` is not necessarily a bug. It matters most on bilingual sites that switch direction at runtime.



\## Known limitations



\- The score uses a flat penalty per failed rule, not weighted by how many violations exist.

\- Cross-origin stylesheets can't be read by the page and are skipped.

\- Only the single URL given is analyzed, not the whole site.



\## Roadmap



\- \[ ] Web interface (Next.js) with visual reports

\- \[ ] Rules for directional icons, fonts, line height, and bidi text

\- \[ ] Weighted scoring

\- \[ ] Multi-page crawling

\- \[ ] GitHub Action to check pull requests

\- \[ ] Chrome extension



\## Tech stack



Node.js, Playwright



\## Author



Jenan Helmy Jarada


