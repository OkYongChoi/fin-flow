import { expect, test } from '@playwright/test'
test('verify network metrics visibility', async ({ page }) => {
  await page.goto('/en/map?network=visa'); await expect(page.locator('.metric-table')).toContainText('Payments volume')
})
