import { expect, test } from '@playwright/test'
test('verify information-page map links', async ({ page }) => {
  await page.goto('/en/networks'); await page.getByRole('button', { name: /SWIFT/ }).click(); await expect(page).toHaveURL(/\/en\/map\?network=swift/)
})
