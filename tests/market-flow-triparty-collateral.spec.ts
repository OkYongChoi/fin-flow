import { expect, test } from '@playwright/test'

test('tri-party collateral keeps custody controls distinct from universal clearing claims', async ({ page }) => {
  await page.goto('/en/map?network=triparty-collateral')
  await expect(page.getByRole('button', { name: /Tri-party collateral management/ })).toHaveAttribute('aria-pressed', 'true')
  const timeline = page.locator('.flow-timeline .timeline-track')
  await expect(timeline.getByText('Agree eligibility and account-control arrangements')).toHaveCount(1)
  await expect(timeline.getByText('Settle the start and end legs')).toHaveCount(1)
  await page.getByRole('tab', { name: 'Institutions' }).click()
  await expect(page.getByText(/does not claim coverage for every tri-party repo market/)).toBeVisible()
})
