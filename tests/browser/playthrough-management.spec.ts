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
  await page
    .getByRole("button", { name: "Playthrough menu", exact: true })
    .click();
  await page.getByLabel("New playthrough name").fill("Second run");
  await page
    .locator("fieldset")
    .filter({ hasText: "Initial characters for the new run" })
    .getByLabel("Gustave")
    .uncheck();
  await page
    .getByRole("button", { name: "Create independent playthrough" })
    .click();
  await page
    .getByRole("button", { name: "Playthrough menu", exact: true })
    .click();
  await page.getByRole("button", { name: "First run", exact: true }).click();
  await page.reload();
  await expect(page.getByText("First run", { exact: true })).toBeVisible();
});
test("keeps same-name runs distinct and closes menu with Escape", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Create playthrough" }).click();
  await page
    .getByRole("button", { name: "Playthrough menu", exact: true })
    .click();
  await page.getByLabel("New playthrough name").fill("Same");
  await page
    .getByRole("button", { name: "Create independent playthrough" })
    .click();
  await page.getByRole("button", { name: "Playthrough menu" }).click();
  await page.getByLabel("New playthrough name").fill("Same");
  await page
    .getByRole("button", { name: "Create independent playthrough" })
    .click();
  await expect(page.getByText("Same", { exact: true })).toHaveCount(1);
  await page.getByRole("button", { name: "Playthrough menu" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
test("isolates progressed runs through removal, reset, reload, and restoration", async ({
  page,
}) => {
  await page.getByLabel("Playthrough name").fill("Alpha");
  await page.getByLabel("Lune").uncheck();
  await page.getByRole("button", { name: "Create playthrough" }).click();
  await page.getByRole("button", { name: "Update progress" }).first().click();
  await page.getByLabel("Current level").fill("7");
  await page.getByLabel("Available attribute points").fill("4");
  await page.getByLabel("Vitality").fill("5");
  await page.getByRole("button", { name: "Save progress" }).click();
  await page.getByRole("button", { name: "Playthrough menu" }).click();
  await page.getByLabel("New playthrough name").fill("Beta");
  await page
    .locator("fieldset")
    .filter({ hasText: "Initial characters for the new run" })
    .getByLabel("Gustave")
    .uncheck();
  await page
    .locator("fieldset")
    .filter({ hasText: "Initial characters for the new run" })
    .getByLabel("Lune")
    .check();
  await page
    .getByRole("button", { name: "Create independent playthrough" })
    .click();
  await page.getByRole("button", { name: "Update progress" }).first().click();
  await page.getByLabel("Current level").fill("9");
  await page.getByLabel("Available attribute points").fill("2");
  await page.getByLabel("Might").fill("8");
  await page.getByRole("button", { name: "Save progress" }).click();
  await page.getByRole("button", { name: "Playthrough menu" }).click();
  await expect(
    page.getByRole("button", { name: "Alpha", exact: true }),
  ).toHaveCount(1);
  await expect(
    page.getByRole("button", { name: "Beta", exact: true }),
  ).toHaveCount(1);
  await page.getByRole("button", { name: "Alpha", exact: true }).click();
  await page.getByRole("button", { name: "Remove" }).click();
  await page.reload();
  await page
    .getByRole("button", { name: "Playthrough menu", exact: true })
    .click();
  await page.getByRole("button", { name: /Restore Gustave/ }).click();
  await expect(page.getByText("LV 7")).toBeVisible();
  await expect(page.getByText("5", { exact: true })).toBeVisible();
  await expect(page.getByText("4 attribute points available")).toBeVisible();
  await page
    .getByRole("button", { name: "Playthrough menu", exact: true })
    .click();
  await page.getByRole("button", { name: "Reset this playthrough" }).click();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Start this playthrough again" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Begin fresh setup" }).click();
  await page.getByRole("button", { name: "Playthrough menu" }).click();
  await expect(
    page.getByRole("button", { name: /Restore Gustave/ }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Beta", exact: true }).click();
  await expect(page.getByText("LV 9")).toBeVisible();
  await expect(page.getByText("2 attribute points available")).toBeVisible();
  await expect(page.getByText("8", { exact: true })).toBeVisible();
});
