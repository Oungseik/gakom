import { expect, test } from "@playwright/test";

test("sign in with not verified account", async ({ page }) => {
  await test.step("access protected routes", async () => {
    await page.goto("http://localhost:4173/app/dashboard");

    expect(page.url()).toEqual("http://localhost:4173/signin?return_url=/app/dashboard");
  });

  const email = "mhemaungthuwin@gmail.com";
  const password = "Oung123@";

  await test.step("immediate sign in without verify account", async () => {
    await page.getByRole("textbox", { name: "Email" }).fill(email);
    await page.getByRole("textbox", { name: "Password" }).fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();

    expect(page.url()).toEqual("http://localhost:4173/verify-account?return_url=/app/dashboard");
    expect(page.getByRole("textbox", { name: "Email" })).toHaveValue(email);
  });

  await test.step("resend verification email", async () => {
    const resentButton = page.getByRole("button", { name: "Resend Verification Email" });
    await resentButton.click();

    expect(resentButton).toBeDisabled();
    expect(resentButton.textContent()).toEqual("Resending...");
    expect(page.getByText("Verification email sent!")).toBeVisible();
    expect(resentButton).not.toBeDisabled();
  });

  await test.step("access protected route before verify account", async () => {
    await page.goto("http://localhost:4173/app/dashboard", { waitUntil: "domcontentloaded" });
    expect(page.url()).toEqual("http://localhost:4173/verify-account?return_url=/app/dashboard");

    await page.goto("http://localhost:4173/app/settings", { waitUntil: "domcontentloaded" });
    expect(page.url()).toEqual("http://localhost:4173/verify-account?return_url=/app/settings");
  });
});

test("sign in with verified account", async ({ page }) => {});
