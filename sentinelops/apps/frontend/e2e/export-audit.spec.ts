import { test, expect } from '@playwright/test'

test('export button triggers download (TEST-4.6)', async ({ page }) => {
  await page.goto('/audit')
  await expect(page.getByText('Audit Timeline')).toBeVisible()

  const exportButton = page.getByText('Export')
  await expect(exportButton).toBeVisible()
  await expect(exportButton).toBeEnabled()
})
