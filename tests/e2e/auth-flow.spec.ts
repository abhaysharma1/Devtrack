import { test, expect } from "@playwright/test"

test.describe("Authentication Flow", () => {
  test("should show login page", async ({ page }) => {
    await page.goto("/auth/login")
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible()
  })

  test("should show forgot password link", async ({ page }) => {
    await page.goto("/auth/login")
    await expect(page.getByText(/forgot password/i)).toBeVisible()
  })

  test("should validate empty login form", async ({ page }) => {
    await page.goto("/auth/login")
    await page.getByRole("button", { name: /sign in/i }).click()
    await expect(page.locator("text=Email")).toBeVisible()
  })
})
