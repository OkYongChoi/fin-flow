import { expect, test } from '@playwright/test'

test('securities issuance library is visible and switches procedures', async ({ page }) => {
  await page.goto('/en/map?network=securities-issuance')
  await expect(page.getByRole('heading', { name: 'Choose a security type to compare the issuance path' })).toBeVisible()
  const selector = page.getByLabel('Issuance type')
  await expect(selector).toHaveValue('agency-mbs')
  await selector.selectOption('us-treasury-bills')
  await expect(page.getByText('Treasury bills with one year or less to maturity are issued through announcement, bidding, award, and issue-date steps.')).toBeVisible()
})
