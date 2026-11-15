const ARABIC = /[\u0600-\u06FF]/;

export const rules = [
  {
    id: "html-dir",
    severity: "error",
    message: 'The <html> element should have dir="rtl"',
    async check(page) {
      const dir = await page.evaluate(() => document.documentElement.dir);
      return dir === "rtl" ? [] : [`dir is "${dir || "missing"}"`];
    },
  },
  {
    id: "html-lang",
    severity: "error",
    message: 'The <html> element should have lang="ar"',
    async check(page) {
      const lang = await page.evaluate(() => document.documentElement.lang);
      return lang.toLowerCase().startsWith("ar")
        ? []
        : [`lang is "${lang || "missing"}"`];
    },
  },
  {
    id: "text-align-left",
    severity: "warning",
    message: "Arabic text is forced to text-align: left",
    async check(page) {
      return page.evaluate((pattern) => {
        const arabic = new RegExp(pattern);
        const found = [];
        for (const el of document.querySelectorAll("body *")) {
          const ownText = [...el.childNodes]
            .filter((n) => n.nodeType === 3)
            .map((n) => n.textContent)
            .join("");
          if (!arabic.test(ownText)) continue;
                              const cs = getComputedStyle(el);
          if (cs.display.startsWith("inline")) continue;
          if (cs.direction === "rtl" && cs.textAlign === "left") {
            const cls =
              typeof el.className === "string" && el.className.trim()
                ? "." + el.className.trim().split(/\s+/)[0]
                : "";
            found.push(el.tagName.toLowerCase() + cls);
          }
        }
        return found.slice(0, 10);
      }, ARABIC.source);
    },
  },
];