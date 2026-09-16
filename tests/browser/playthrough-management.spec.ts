import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});
test("creates independent runs and reloads the last selection", async ({
  page,
}) => {
  await page.getByLabel("Playthrough name").fill("First run");
  await page.getByRole("button", { name: "Create playthrough" }).click();
  await page.getByRole("button", { name: "Playthrough menu" }).click();
  await page.getByLabel("New playthrough name").fill("Second run");
  await page.locator("fieldset").filter({ hasText: "Initial characters for the new run" }).getByLabel("Gustave").uncheck();
  await page
    .getByRole("button", { name: "Create independent playthrough" })
    .click();
  await page.getByRole("button", { name: "Playthrough menu" }).click();
  await page.getByRole("button", { name: "First run", exact: true }).click();
  await page.reload();
  await expect(page.getByText("First run", { exact: true })).toBeVisible();
});
test("keeps same-name runs distinct and closes menu with Escape", async ({ page }) => {
  await page.getByRole("button", { name: "Create playthrough" }).click();
  await page.getByRole("button", { name: "Playthrough menu" }).click();
  await page.getByLabel("New playthrough name").fill("Same");
  await page.getByRole("button", { name: "Create independent playthrough" }).click();
  await page.getByRole("button", { name: "Playthrough menu" }).click();
  await page.getByLabel("New playthrough name").fill("Same");
  await page.getByRole("button", { name: "Create independent playthrough" }).click();
  await expect(page.getByText("Same", { exact: true })).toHaveCount(1);
  await page.getByRole("button", { name: "Playthrough menu" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
test("removes, reloads, restores, and resets into fresh setup", async ({
  page,
}) => {
  await page.getByLabel("Playthrough name").fill("Run");
  await page.getByRole("button", { name: "Create playthrough" }).click();
  await page.getByRole("button", { name: "Update progress" }).first().click();
  await page.getByLabel("Current level").fill("7");
  await page.getByLabel("Available attribute points").fill("4");
  await page.getByRole("button", { name: "Save progress" }).click();
  await page.getByRole("button", { name: "Remove" }).first().click();
  await page.reload();
  await page.getByRole("button", { name: "Playthrough menu" }).click();
  await page.getByRole("button", { name: /Restore Gustave/ }).click();
  await expect(page.getByText("LV 7")).toBeVisible();
  await page.getByRole("button", { name: "Playthrough menu" }).click();
  await page.getByRole("button", { name: "Reset this playthrough" }).click();
  await expect(
    page.getByRole("heading", { name: "Start this playthrough again" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Begin fresh setup" }).click();
  await expect(page.getByText("LV 1").first()).toBeVisible();
});
