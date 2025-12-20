import { expect, test } from "@playwright/test";
import { config } from "../config";

test("forgot password", async ({ page }) => {
  const forgotPasswordURL = `${config.BASE_URL}/forgot-password`;

  await page.goto(forgotPasswordURL);
  expect(page.url()).toEqual(forgotPasswordURL);


});
