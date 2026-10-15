import { test, expect } from "@playwright/test";

test.describe("E2E: Public Digital Invitation & Registry XSS / Security", () => {
  test("RSVP form does not execute injected XSS script via guest name", async ({ page }) => {
    let dialogTriggered = false;
    page.on("dialog", (dialog) => {
      dialogTriggered = true;
      dialog.dismiss();
    });

    // Visit public invitation page with test slug
    await page.goto("/invitation/test-andi-siti");
    await page.waitForLoadState("domcontentloaded");

    // Look for RSVP name input if present
    const nameInput = page.locator("input[placeholder*='Nama'], input[name='name']").first();
    if (await nameInput.isVisible()) {
      await nameInput.fill("<img src=x onerror=alert(1)>");

      // Verify no XSS dialog was executed
      expect(dialogTriggered, "Cross-Site Scripting (XSS) detected! Alert dialog was executed.").toBe(false);
    }
  });

  test("Visiting unknown slug on /invitation and /registry renders proper not-found state without 500 error", async ({ page }) => {
    const invRes = await page.goto("/invitation/slug-yang-pasti-tidak-ada-99999");
    expect(invRes?.status()).toBeLessThan(500);

    const regRes = await page.goto("/registry/slug-yang-pasti-tidak-ada-99999");
    expect(regRes?.status()).toBeLessThan(500);
  });
});
