import { expect, test } from '@playwright/test'
test('verify network selector validity', async ({ page }) => {
  await page.goto('/en/map'); await expect(page.getByLabel('Network', { exact: true }).locator('option')).toHaveCount(6)
})
