import { test, expect } from "@playwright/test";

test.describe("E2E: Direct Route Access as Guest (Private Route Handling)", () => {
  const PRIVATE_ROUTES = [
    "/account",
    "/activity",
    "/administration",
    "/alignment",
    "/budget",
    "/ceremony",
    "/guests",
    "/post-wedding",
    "/rundown",
    "/savings",
    "/seserahan",
    "/timeline",
    "/vendors",
  ];

  for (const route of PRIVATE_ROUTES) {
    test(`Visiting ${route} as guest does not crash or throw unhandled JavaScript exceptions`, async ({ page }) => {
      const pageErrors: Error[] = [];
      page.on("pageerror", (err) => pageErrors.push(err));

      const response = await page.goto(route);
      await page.waitForLoadState("domcontentloaded");

      // Verify page responds with valid HTTP status (not 500 or broken route)
      expect(response?.status()).toBeLessThan(500);

      // Verify no unhandled client-side runtime crashes
      expect(
        pageErrors,
        `Page ${route} threw unhandled client exceptions: ${pageErrors.map((e) => e.message).join("; ")}`
      ).toHaveLength(0);
    });
  }
});
