import { expect, test } from "@playwright/test";

test("anyone can write in the open book and it stays after a refresh", async ({ page }) => {
  await page.goto("/public");
  const name = `Wanderer ${Date.now() % 100000}`;
  await page.locator("input[name=name]").first().fill(name);
  await page.getByRole("button", { name: "Write it" }).first().click();
  await expect(page.getByTestId("public-entry").filter({ hasText: name })).toBeVisible();

  await page.reload();
  await expect(page.getByTestId("public-entry").filter({ hasText: name })).toBeVisible();
});

test("a shared note appears on the home page and opens its own page", async ({ page }) => {
  const name = `Madame Vey ${Date.now() % 100000}`;
  await page.goto("/notebook");
  await page.locator("input[name=name]").first().fill(name);
  await page.getByRole("button", { name: "Write it" }).first().click();

  const note = page.getByTestId("note").filter({ hasText: name });
  await note.hover();
  await note.getByRole("button", { name: /Share entry/ }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel(/Blot out the name/).uncheck();
  await dialog.getByRole("button", { name: "Publish this page" }).click();
  await expect(dialog.getByLabel("Share link")).toHaveValue(/\/n\/[A-Za-z0-9]{10}$/);

  // The home page is revalidated every 30s in production; dev/e2e renders fresh.
  await page.goto("/");
  const card = page.getByRole("link", { name: `Open shared page for ${name}` });
  await card.scrollIntoViewIfNeeded();
  await card.click();
  await expect(page).toHaveURL(/\/n\/[A-Za-z0-9]{10}$/);
  await expect(page.getByText(name).first()).toBeVisible();
});
