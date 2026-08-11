import { expect, test } from '@playwright/test'

test('bond issuance timeline uses primary-market stages', async ({ page }) => {
  await page.goto('/en/map?network=bond-issuance')
  const timeline = page.locator('.flow-timeline')
  await expect(timeline.getByText('Lead and underwrite')).toHaveCount(1)
  await expect(timeline.getByText('Allocation and delivery versus payment')).toHaveCount(1)
})
