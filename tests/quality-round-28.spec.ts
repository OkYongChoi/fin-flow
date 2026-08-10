import { expect, test } from '@playwright/test'
test('verify localized path title', async ({ page }) => {
  await page.goto('/ko/networks'); await expect(page).toHaveTitle('네트워크 · Flow of Money')
})
