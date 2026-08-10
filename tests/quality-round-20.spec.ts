import { expect, test } from '@playwright/test'
test('verify data-page title', async ({ page }) => {
  await page.goto('/en/data'); await expect(page).toHaveTitle('Data · Flow of Money')
})
