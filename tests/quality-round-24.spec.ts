import { expect, test } from '@playwright/test'
import { NETWORKS } from '../src/data'
test('verify network selector validity', async ({ page }) => {
  await page.goto('/en/map'); await expect(page.getByLabel('Network', { exact: true }).locator('option')).toHaveCount(NETWORKS.length)
})
