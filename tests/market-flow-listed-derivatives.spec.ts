import { expect, test } from '@playwright/test'

test('listed derivatives use a lifecycle distinct from bilateral OTC', async ({ page }) => {
  await page.goto('/en/map?network=listed-derivatives')
  await expect(page.getByRole('button', { name: /Listed derivatives/ })).toHaveAttribute('aria-pressed', 'true')
  const timeline = page.locator('.flow-timeline')
  await expect(timeline.getByText('Exchange execution')).toHaveCount(1)
  await expect(timeline.locator('.timeline-track').getByText('Daily mark-to-market and margin')).toHaveCount(1)
  await page.getByRole('tab', { name: 'Institutions' }).click()
  await expect(page.getByText(/not an OTC lifecycle/)).toBeVisible()
})
