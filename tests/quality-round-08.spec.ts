import { expect, test } from '@playwright/test'
test('verify source registry source links', async ({ page }) => {
  await page.goto('/en/data'); await expect(page.locator('.source-row a').first()).toHaveAttribute('target', '_blank')
})
