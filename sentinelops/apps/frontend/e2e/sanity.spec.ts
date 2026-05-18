import { test, expect } from '@playwright/test'

test('page title contains SentinelOPS', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/SentinelOPS/)
})
