import { expect, test } from '@playwright/test'

test('dashboard exposes sourced metrics and updates selected network', async ({ page }) => {
  await page.goto('/ko/map')
  await expect(page.getByText('Flow of Money')).toBeVisible()
  await expect(page.getByText('구조도 · 실거래 위치 아님')).toBeVisible()
  await page.getByRole('button', { name: /Circle USDC/ }).click()
  await expect(page).toHaveURL(/network=usdc/)
  await expect(page.getByText('USDC 유통량')).toBeVisible()
  await expect(page.getByText('$72.3B')).toBeVisible()
})

test('simulation playback stays explicitly labelled', async ({ page }) => {
  await page.goto('/ko/map?network=chips-fedwire')
  await expect(page.locator('.simulation-badge')).toContainText('시뮬레이션')
  await page.getByRole('button', { name: '시뮬레이션 재생' }).click()
  await expect(page.getByRole('button', { name: '일시정지' })).toBeVisible()
})

test('locale switch preserves route and selection', async ({ page }) => {
  await page.goto('/ko/map?network=swift')
  await page.getByRole('button', { name: 'EN', exact: true }).click()
  await expect(page).toHaveURL(/\/en\/map\?network=swift/)
  await expect(page.getByText('Schematic · not transaction locations')).toBeVisible()
})

test('data registry links every rendered metric to primary sources', async ({ page }) => {
  await page.goto('/ko/data')
  await expect(page.getByRole('heading', { name: '출처 레지스트리' })).toBeVisible()
  await expect(page.getByText('Federal Reserve Financial Services')).toBeVisible()
  await expect(page.locator('.source-row a')).toHaveCount(7)
})
