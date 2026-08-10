import { expect, test } from '@playwright/test'
test('verify alternate rail route label', async ({ page }) => {
  await page.goto('/en/map?network=chips-fedwire'); await expect(page.getByText('Alternative rails · not sequential')).toBeVisible()
})
