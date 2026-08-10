import { expect, test } from '@playwright/test'
test('verify data coverage notice', async ({ page }) => {
  await page.goto('/en/data'); await expect(page.getByRole('note')).toBeVisible()
})
