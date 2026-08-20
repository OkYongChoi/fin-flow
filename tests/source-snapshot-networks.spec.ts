import { expect, test } from '@playwright/test'

test('specialised networks render their cited public metrics instead of simulated stages', async ({ page }) => {
  const cases = [
    ['bond-issuance', 'Bond issuance', 'U.S. securities standard settlement cycle', 'T+1'],
    ['bond-servicing', 'Bond servicing', 'DTC redemption processing', 'DTC'],
    ['asset-backed-securitization', 'Asset-backed securitization', 'ABS disclosure framework', 'Reg AB'],
    ['credit-derivatives', 'Credit derivatives credit event', 'ISDA credit-event auction settlement', 'ISDA'],
    ['listed-derivatives', 'Listed derivatives', 'Listed-derivatives daily mark-to-market', 'Daily'],
    ['triparty-collateral', 'Tri-party collateral management', 'FICC ACS Triparty', 'ACS'],
    ['derivatives', 'OTC derivatives', 'OTC statistics release', '반기'],
  ] as const

  for (const [network, heading, metric, display] of cases) {
    await page.goto(`/en/map?network=${network}`)
    await expect(page.getByRole('heading', { name: heading, exact: true }).first()).toBeVisible()
    await expect(page.getByText(metric, { exact: true }).first()).toBeVisible()
    await expect(page.getByText(display, { exact: true }).first()).toBeVisible()
  }
})
