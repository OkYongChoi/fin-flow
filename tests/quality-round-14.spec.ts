import { expect, test } from '@playwright/test'
test('verify inspector tab reset', async ({ page }) => {
  await page.goto('/en/map?network=swift'); await page.getByRole('tab', { name: 'Documents' }).click(); await page.getByRole('button', { name: /Visa/ }).click(); await expect(page.getByRole('tab', { name: 'Path' })).toHaveAttribute('aria-selected', 'true')
})
