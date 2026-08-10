import { expect, test } from '@playwright/test'
test('verify reset restores default rail', async ({ page }) => {
  await page.goto('/en/map?network=usdc&mode=basic'); await page.getByRole('button', { name: 'Reset filters' }).click(); await expect(page).toHaveURL(/network=chips-fedwire/)
})
