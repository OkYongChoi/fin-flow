import { expect, test } from '@playwright/test'

test('credit derivatives keep event determination separate from a realised default claim', async ({ page }) => {
  await page.goto('/en/map?network=credit-derivatives')
  await expect(page.getByRole('button', { name: /Credit derivatives credit event/ })).toHaveAttribute('aria-pressed', 'true')
  const timeline = page.locator('.flow-timeline .timeline-track')
  await expect(timeline.getByText('Submit a credit-event request and check documentation')).toHaveCount(1)
  await expect(timeline.getByText('Publish auction settlement terms if an auction is held')).toHaveCount(1)
  await page.getByRole('tab', { name: 'Institutions' }).click()
  await expect(page.getByText(/does not state that a debtor event occurred/)).toBeVisible()
})
