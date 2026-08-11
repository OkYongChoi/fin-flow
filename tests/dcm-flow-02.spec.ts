import { expect, test } from '@playwright/test'

test('bond issuance timeline uses primary-market stages', async ({ page }) => {
  await page.goto('/en/map?network=bond-issuance')
  await expect(page.getByText('Lead and underwrite')).toBeVisible()
  await expect(page.getByText('Allocation and delivery versus payment')).toBeVisible()
})
