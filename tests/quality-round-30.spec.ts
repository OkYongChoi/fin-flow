import { expect, test } from '@playwright/test'
test('verify source snapshot version', async ({ page }) => {
  await page.goto('/en/data'); await expect(page.getByText('2026.08.10')).toBeVisible()
})
