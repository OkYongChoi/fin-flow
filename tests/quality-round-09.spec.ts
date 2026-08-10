import { expect, test } from '@playwright/test'
test('verify source registry loading state', async ({ page }) => {
  await page.goto('/en/data'); await expect(page.getByRole('table', { name: 'Source registry' })).toHaveAttribute('aria-busy', 'false')
})
