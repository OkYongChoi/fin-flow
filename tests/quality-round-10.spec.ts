import { expect, test } from '@playwright/test'
test('verify map landmark disclaimer', async ({ page }) => {
  await page.goto('/en/map'); await expect(page.getByRole('region', { name: 'Global map' })).toHaveAttribute('aria-describedby', 'map-disclaimer')
})
