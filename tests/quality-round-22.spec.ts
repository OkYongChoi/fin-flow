import { expect, test } from '@playwright/test'
test('verify asset deep links', async ({ page }) => {
  await page.goto('/en/assets'); await page.getByRole('button', { name: /Bank deposits/ }).click(); await expect(page.getByRole('button', { name: /Bank deposits/ })).toHaveAttribute('aria-current', 'page')
})
