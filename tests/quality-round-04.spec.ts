import { expect, test } from '@playwright/test'
test('verify basic view url state', async ({ page }) => {
  await page.goto('/en/map?network=swift&mode=basic'); await page.reload(); await expect(page.getByRole('button', { name: 'Basic' })).toHaveAttribute('aria-pressed', 'true')
})
