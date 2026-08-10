import { expect, test } from '@playwright/test'
test('verify skip link focus target', async ({ page }) => {
  await page.goto('/en/map'); await page.getByRole('link', { name: 'Skip to main content' }).focus(); await page.keyboard.press('Enter'); await expect(page.locator('#main-content')).toBeFocused()
})
