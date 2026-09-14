import { expect, test } from '@playwright/test'

test('securities issuance explorer filters, selects, and restores a shared path', async ({ page }) => {
  await page.goto('/en/map?network=securities-issuance')
  await expect(page.getByRole('heading', { name: 'Find and compare issuance paths side by side' })).toBeVisible()
  await expect(page.getByText('29', { exact: true }).first()).toBeVisible()
  await page.getByLabel('Category').selectOption('treasury')
  await page.getByLabel('Search procedures').fill('bills')
  await expect(page.getByText('Matching paths').locator('..').getByText('2', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: /U.S. Treasury bills/ }).click()
  await expect(page).toHaveURL(/issuance=us-treasury-bills/)
  await expect(page.getByText('Treasury bills with one year or less to maturity are issued through announcement, bidding, award, and issue-date steps.')).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'U.S. Treasury bills' })).toBeVisible()
})

test('securities issuance explorer offers quick category filters and a focused jump target', async ({ page }) => {
  await page.goto('/ko/map?network=securities-issuance')
  await page.getByRole('button', { name: '29개 발행 경로 탐색' }).click()
  await expect(page.locator('#issuance-library')).toBeFocused()
  await page.getByRole('group', { name: '빠른 분류 필터' }).getByRole('button', { name: /미국 국채/ }).click()
  await expect(page.getByText('검색 결과').locator('..').getByText('9', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: '필터 초기화' }).click()
  await expect(page.getByText('검색 결과').locator('..').getByText('29', { exact: true })).toBeVisible()
})

test('securities issuance explorer compares two source-backed paths', async ({ page }) => {
  await page.goto('/en/map?network=securities-issuance&issuance=us-equity-ipo')
  await page.getByRole('button', { name: 'Compare' }).click()
  await expect(page).toHaveURL(/compareIssuance=adr-depository-issuance/)
  await expect(page.getByText('Both paths use 4 stages')).toBeVisible()
  await expect(page.getByText('Different source providers')).toBeVisible()
  await page.getByLabel('Choose comparison path').selectOption('us-equity-follow-on')
  await expect(page).toHaveURL(/compareIssuance=us-equity-follow-on/)
  await expect(page.getByRole('region', { name: 'Comparison path' }).getByRole('heading', { name: 'U.S. follow-on common-stock offering' })).toBeVisible()
})

test('securities issuance explorer copies its shareable URL state', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/en/map?network=securities-issuance&issuance=us-equity-ipo&compareIssuance=adr-depository-issuance')
  await page.getByRole('button', { name: 'Copy current view link' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Current view link copied.' })).toBeVisible()
  const copiedUrl = await page.evaluate(() => navigator.clipboard.readText())
  expect(copiedUrl).toContain('issuance=us-equity-ipo')
  expect(copiedUrl).toContain('compareIssuance=adr-depository-issuance')
})
