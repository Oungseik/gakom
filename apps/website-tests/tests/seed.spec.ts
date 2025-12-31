import { test } from "@playwright/test";
import { config } from "./config";

test("seed the environment and login", async ({ page }) => {
  const url = new URL("/dashboard", config.baseUrl);
  await page.goto(url.toString());
});
