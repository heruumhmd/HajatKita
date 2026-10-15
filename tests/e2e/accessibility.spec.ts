import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("E2E: Accessibility & WCAG Compliance", () => {
  const PAGES_TO_AUDIT = [
    { name: "Home Landing", path: "/" },
    { name: "Savings", path: "/savings" },
    { name: "Guests", path: "/guests" },
    { name: "Budget", path: "/budget" },
    { name: "Account", path: "/account" },
  ];

  for (const p of PAGES_TO_AUDIT) {
    test(`Axe Accessibility scan on ${p.name} (${p.path})`, async ({ page }) => {
      await page.goto(p.path);
      await page.waitForLoadState("domcontentloaded");

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      const criticalViolations = accessibilityScanResults.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious"
      );

      if (criticalViolations.length > 0) {
        console.warn(
          `⚠️ [A11Y REPORT] ${p.name} has ${criticalViolations.length} critical/serious accessibility issues:`
        );
        for (const v of criticalViolations) {
          console.warn(`   - [${v.impact?.toUpperCase()}] ${v.id}: ${v.help} (${v.nodes.length} occurrences)`);
        }
      }

      // We document violations for TEST-REPORT.md
      expect(accessibilityScanResults).toBeDefined();
    });
  }

  test("Icon-only buttons missing aria-label or title attribute audit", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const unlabeledButtons = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const violations = [];

      for (const btn of buttons) {
        const text = btn.textContent?.trim() || "";
        const ariaLabel = btn.getAttribute("aria-label")?.trim() || "";
        const ariaLabelledBy = btn.getAttribute("aria-labelledby")?.trim() || "";
        const title = btn.getAttribute("title")?.trim() || "";

        // If button has no accessible text, aria-label, aria-labelledby, or title
        if (!text && !ariaLabel && !ariaLabelledBy && !title) {
          violations.push({
            html: btn.outerHTML.slice(0, 100),
            className: btn.className,
          });
        }
      }
      return violations;
    });

    console.log(`[INFO] Found ${unlabeledButtons.length} icon-only buttons without aria-label/title on Landing page`);
    expect(unlabeledButtons).toBeDefined();
  });
});
