import { expect, test } from '@playwright/test'
test('verify playback speed toggle', async ({ page }) => {
  await page.goto('/en/map'); await page.getByRole('button', { name: 'Playback speed 1x' }).click(); await expect(page.getByRole('button', { name: 'Playback speed 2x' })).toHaveAttribute('aria-pressed', 'true')
})
