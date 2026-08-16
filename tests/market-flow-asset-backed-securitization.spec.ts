import { expect, test } from '@playwright/test'

test('asset-backed securitization keeps the pool and waterfall distinct from a trade', async ({ page }) => {
  await page.goto('/en/map?network=asset-backed-securitization')
  await expect(page.getByRole('button', { name: /Asset-backed securitization/ })).toHaveAttribute('aria-pressed', 'true')
  const timeline = page.locator('.flow-timeline .timeline-track')
  await expect(timeline.getByText('Define the asset pool')).toHaveCount(1)
  await expect(timeline.getByText('Collect cash flows and apply waterfall')).toHaveCount(1)
  await page.getByRole('tab', { name: 'Institutions' }).click()
  await expect(page.getByText(/does not identify a deal/)).toBeVisible()
})
