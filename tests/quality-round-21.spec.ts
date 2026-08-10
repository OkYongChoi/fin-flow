import { expect, test } from '@playwright/test'
test('verify guide deep links', async ({ page }) => {
  await page.goto('/en/learn'); await page.getByRole('button', { name: /Messages vs money/ }).click(); await expect(page.getByRole('button', { name: /Messages vs money/ })).toHaveAttribute('aria-current', 'page')
})
