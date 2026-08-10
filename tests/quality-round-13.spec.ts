import { expect, test } from '@playwright/test'
test('verify inspector document sources', async ({ page }) => {
  await page.goto('/en/map?network=usdc'); await page.getByRole('tab', { name: 'Documents' }).click(); await expect(page.getByRole('link', { name: /Circle/ })).toHaveCount(2)
})
