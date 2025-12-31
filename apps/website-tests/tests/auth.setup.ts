import { expect, test as setup } from "@playwright/test";
import path from "path";
import { config } from "./config";

const authFile = path.join("playwright/.auth/user.json");

setup("authentication", async ({ page }) => {
  await page.goto(`${config.baseUrl}/signin`);
  await page.getByRole("textbox", { name: "Email" }).fill(config.orgOwner.email);
  await page.getByRole("textbox", { name: "Password" }).fill(config.orgOwner.password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(async () => {
    expect(page.url()).toEqual(`${config.baseUrl}/app/crossworks`);
  }).toPass({ intervals: [2000, 4000, 8000] });
  await page.context().storageState({ path: authFile });
});
