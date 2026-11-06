import { expect, test } from "@playwright/test";

test("a guest writes a name and it survives a refresh", async ({ page }) => {
  await page.goto("/notebook");
  await expect(page.getByText("Your notes live only in this browser.")).toBeVisible();

  const name = `Ashen Visitor ${Date.now() % 10000}`;
  await page.locator("input[name=name]").first().fill(name);
  await page.locator("input[name=cause]").first().fill("Lost in the fog");
  await page.getByRole("button", { name: "Write it" }).first().click();

  const entry = page.getByTestId("note").filter({ hasText: name });
  await expect(entry).toBeVisible();
  await expect(page.getByRole("timer")).toBeVisible();

  await page.reload();
  await expect(page.getByTestId("note").filter({ hasText: name })).toBeVisible();
});

test("the notebook refuses real-world threats", async ({ page }) => {
  await page.goto("/notebook");
  await page.locator("input[name=name]").first().fill("I will kill you");
  await page.getByRole("button", { name: "Write it" }).first().click();
  await expect(page.getByRole("alert").filter({ hasText: "real threat" })).toBeVisible();
});
