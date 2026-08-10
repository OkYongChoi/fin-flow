import { expect, test } from '@playwright/test'
test('verify invalid paths recover', async ({ page }) => {
  await page.goto('/en/not-a-page'); await expect(page).toHaveURL('/en/map')
})
