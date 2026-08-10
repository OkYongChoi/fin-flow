import { expect, test } from '@playwright/test'
test('verify mobile menu escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto('/en/map'); await page.getByRole('button', { name: 'Open menu' }).click(); await page.keyboard.press('Escape'); await expect(page.getByRole('button', { name: 'Open menu' })).toHaveAttribute('aria-expanded', 'false')
})
