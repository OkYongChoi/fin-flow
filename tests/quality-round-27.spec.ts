import { expect, test } from '@playwright/test'
test('verify selected rail semantics', async ({ page }) => {
  await page.goto('/en/map?network=usdc'); await expect(page.getByRole('button', { name: /Circle USDC/ })).toHaveAttribute('aria-pressed', 'true')
})
