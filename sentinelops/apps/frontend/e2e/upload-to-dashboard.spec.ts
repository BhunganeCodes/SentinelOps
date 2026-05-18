import { test, expect } from '@playwright/test'

test('navigates from upload to dashboard (TEST-4.4, TEST-4.5)', async ({ page }) => {
  // Navigate to upload page
  await page.goto('/upload')
  await expect(page.getByText('Upload Center')).toBeVisible()

  // Navigate to dashboard
  await page.goto('/dashboard')
  await expect(page.getByText('Command Dashboard')).toBeVisible()
})
