import { expect, test } from "@playwright/test";

test("sign up", async ({ page }) => {
  await page.goto("http://localhost:4173/signup?return_url=/app/dashboard");

  const name = "Aung Thu Win";
  const email = "oungseik.learning@gmail.com";
  const password = "Oung123@";

  await page.getByRole("textbox", { name: "Name" }).click();
  await page.getByRole("textbox", { name: "Name" }).fill(name);
  await page.getByRole("textbox", { name: "Name" }).press("Tab");
  await page.getByRole("textbox", { name: "Email" }).fill(email);
  await page.getByRole("textbox", { name: "Email" }).press("Tab");
  await page.getByRole("textbox", { name: "Password" }).fill(password);
  await page.getByRole("button", { name: "Sign up" }).click();

  expect(page.url()).toEqual("http://localhost:4173/signin?return_url=/app/dashboard");
});
