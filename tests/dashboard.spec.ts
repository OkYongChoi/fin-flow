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


test('network filter, inspector tabs, and timeline controls are interactive', async ({ page }) => {
  await page.goto('/en/map?network=swift')
  await page.getByLabel('Network', { exact: true }).selectOption('usdc')
  await expect(page).toHaveURL(/network=usdc/)
  await page.getByRole('tab', { name: 'Statistics' }).click()
  await expect(page.getByText('USDC in circulation')).toBeVisible()
  await page.getByRole('tab', { name: 'Documents' }).click()
  await expect(page.getByRole('link', { name: /Circle 2026-07-27/ })).toBeVisible()
  await page.getByLabel('Playback speed 1x').click()
  await expect(page.getByLabel('Playback speed 2x')).toBeVisible()
})

test('mobile menu exposes primary navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/en/map')
  await page.getByRole('button', { name: 'Open menu' }).click()
  await page.getByRole('button', { name: 'Data' }).click()
  await expect(page).toHaveURL(/\/en\/data/)
})


test('tabs expose their selected state and reset with a new network', async ({ page }) => {
  await page.goto('/en/map?network=swift')
  const documents = page.getByRole('tab', { name: 'Documents' })
  await documents.click()
  await expect(documents).toHaveAttribute('aria-selected', 'true')
  await page.getByRole('button', { name: /Circle USDC/ }).click()
  await expect(page.getByRole('tab', { name: 'Path' })).toHaveAttribute('aria-selected', 'true')
})

test('mobile menu closes with Escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/en/map')
  const menu = page.getByRole('button', { name: 'Open menu' })
  await menu.click()
  await expect(page.getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Open menu' })).toHaveAttribute('aria-expanded', 'false')
})
