import { expect, test } from "@playwright/test";

test.describe("sponsor modal", () => {
  test.skip(process.env.OXAPAY_ENABLED !== "true", "Sponsoring is disabled in this environment");

  test("recommended and custom amounts update the live charity split", async ({ page }) => {
    await page.goto("/supporters");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /Sponsor the project/ }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("From this sponsor amount, 70% will go to charity.");

    await expect(dialog.getByRole("button", { name: /^\$10/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(dialog.getByText("Most chosen")).toBeVisible();
    await expect(page.getByTestId("split")).toContainText("$10.00");
    await expect(page.getByTestId("split")).toContainText("$7.00");

    await dialog.getByRole("button", { name: "$25" }).click();
    await expect(page.getByTestId("split")).toContainText("$17.50");

    await dialog.getByRole("button", { name: "Custom" }).click();
    await dialog.getByLabel("Custom amount in US dollars").fill("12.34");
    await expect(page.getByTestId("split")).toContainText("$12.34");
    await expect(page.getByTestId("split")).toContainText("$8.63");

    await dialog.getByLabel("Custom amount in US dollars").fill("0.5");
    await expect(page.getByTestId("split")).toContainText("Enter an amount");
    await expect(dialog.getByRole("button", { name: /^Sponsor/ })).toBeDisabled();
  });
});
