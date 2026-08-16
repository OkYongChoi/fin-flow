import { expect, test } from '@playwright/test'

test('bond servicing separates post-issuance entitlements from bond issuance', async ({ page }) => {
  await page.goto('/en/map?network=bond-servicing')
  await expect(page.getByRole('button', { name: /Bond servicing/ })).toHaveAttribute('aria-pressed', 'true')
  const timeline = page.locator('.flow-timeline .timeline-track')
  await expect(timeline.getByText('Announce payment terms and date')).toHaveCount(1)
  await expect(timeline.getByText('Allocate payment and reduce position')).toHaveCount(1)
  await page.getByRole('tab', { name: 'Institutions' }).click()
  await expect(page.getByText(/does not depict every coupon/)).toBeVisible()
})
