import { expect, test } from '@playwright/test'
test('verify localized map availability', async ({ page }) => {
  await page.goto('/en/map'); await expect(page.locator('#main-content')).toBeVisible()
})
