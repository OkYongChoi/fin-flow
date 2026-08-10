import { expect, test } from '@playwright/test'
test('verify inspector home navigation', async ({ page }) => {
  await page.goto('/en/map'); await page.getByRole('tab', { name: 'Documents' }).focus(); await page.keyboard.press('Home'); await expect(page.getByRole('tab', { name: 'Path' })).toBeFocused()
})
