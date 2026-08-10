import { expect, test } from '@playwright/test'
test('verify timeline end navigation', async ({ page }) => {
  await page.goto('/en/map'); await page.getByRole('tab', { name: 'Timeline' }).focus(); await page.keyboard.press('End'); await expect(page.getByRole('tab', { name: 'Institution flows' })).toBeFocused()
})
