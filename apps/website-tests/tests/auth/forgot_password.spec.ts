import { expect, test } from "@playwright/test";
import { config } from "../config";

test("forgot password", async ({ page }) => {
  const forgotPasswordURL = `${config.baseUrl}/forgot-password`;

  await page.goto(forgotPasswordURL);
  expect(page.url()).toEqual(forgotPasswordURL);
});
