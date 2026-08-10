import { expect, test } from '@playwright/test'
test('verify simulation default state', async ({ page }) => {
  await page.goto('/en/map'); await expect(page.getByRole('button', { name: 'Play simulation' })).toHaveAttribute('aria-pressed', 'false')
})
