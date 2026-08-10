import { expect, test } from '@playwright/test'
test('verify locale switching keeps selected network', async ({ page }) => {
  await page.goto('/ko/map?network=visa'); await page.getByRole('button', { name: 'Switch to English' }).click(); await expect(page).toHaveURL(/\/en\/map\?network=visa/)
})
