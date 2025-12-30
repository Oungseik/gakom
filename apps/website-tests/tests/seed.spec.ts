import { expect, test } from "@playwright/test";
import { config } from "./config";

test("seed the environment and login", async ({ page }) => {
  await page.goto(`${config.baseUrl}/signin`);
  await page.getByRole("textbox", { name: "Email" }).fill(config.accountWithOrg.email);
  await page.getByRole("textbox", { name: "Password" }).fill(config.accountWithOrg.password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(async () => {
    expect(page.url()).toEqual(`${config.baseUrl}/app/crossworks`);
  }).toPass({ intervals: [2000, 4000, 8000] });
  await page.context().storageState({ path: ".auth/user.json" });
});
