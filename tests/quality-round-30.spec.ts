import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

const snapshotVersion = JSON.parse(readFileSync(new URL('../public/data/manifest.json', import.meta.url), 'utf8')).version
test('verify source snapshot version', async ({ page }) => {
  await page.goto('/en/data'); await expect(page.getByText(snapshotVersion)).toBeVisible()
})
