import { expect, test } from '@playwright/test'

test('DataPage: search and filters narrow sources and announced in status', async ({ page }) => {
  await page.goto('/en/data')

  // Initially 23 source rows (+1 header row)
  const rows = page.locator('.source-table .source-row')
  await expect(rows).toHaveCount(24) // 1 head + 23 sources

  // Search for SWIFT
  const searchInput = page.getByRole('searchbox', { name: 'Search sources' })
  await searchInput.fill('SWIFT')
  await expect(page.locator('.source-table .source-row')).toHaveCount(2) // 1 head + 1 row
  await expect(page.getByText(/1 of 23 sources/)).toBeVisible()

  // Clear search via clear button
  await page.getByRole('button', { name: 'Clear search' }).click()
  await expect(rows).toHaveCount(24)

  // Filter by provider
  const providerSelect = page.getByRole('combobox', { name: 'Filter by provider' })
  await providerSelect.selectOption('Visa')
  await expect(page.locator('.source-table .source-row')).toHaveCount(2) // 1 head + 1 row (visa)
  await expect(page.getByText('Reset filters')).toBeVisible()

  // Reset filters
  await page.getByRole('button', { name: 'Reset filters' }).click()
  await expect(rows).toHaveCount(24)

  // Verify published and retrieved dates in table head and rows
  await expect(page.locator('.source-head')).toContainText('Published')
  await expect(page.locator('.source-head')).toContainText('Retrieved')
  await expect(page.locator('.source-row time').first()).toBeVisible()
})

test('DataPage: network coverage filters by status', async ({ page }) => {
  await page.goto('/ko/data')
  const coverageRegion = page.getByRole('region', { name: '네트워크별 데이터 수록 현황' })

  // Initially all 19
  await expect(coverageRegion.locator('article')).toHaveCount(19)

  // Filter by with-metrics
  await page.getByRole('button', { name: /검증 지표 있음/ }).click()
  await expect(coverageRegion.locator('article')).toHaveCount(19)

  // Filter by process guide only (0 with complete dataset)
  await page.getByRole('button', { name: /절차 가이드 중심/ }).click()
  await expect(coverageRegion.locator('article')).toHaveCount(0)

  // Return to All
  await page.getByRole('button', { name: /전체 \(19\)/ }).click()
  await expect(coverageRegion.locator('article')).toHaveCount(19)
})

test('InfoPage: network slug deep link renders guide detail and action links', async ({ page }) => {
  await page.goto('/en/networks/swift')
  const guide = page.locator('#guide-swift')
  await expect(guide).toBeVisible()
  await expect(guide).toContainText('Interbank message delivery')
  await expect(guide.getByRole('button', { name: 'View sources and metrics' })).toBeVisible()
  await expect(guide.getByRole('button', { name: 'Create a brief from this flow' })).toBeVisible()
})

test('Metric kind badges: rendered on SourceDataBoard, SourceDetails, and BriefComparison', async ({ page }) => {
  // Check on map in Korean
  await page.goto('/ko/map?network=swift')
  await expect(page.locator('.metric-kind-badge').first()).toBeVisible()
  await expect(page.locator('.metric-kind-badge.kind-statistic').first()).toContainText('통계')

  // Check on map in English with a rule metric (bond-issuance has T+1 rule)
  await page.goto('/en/map?network=bond-issuance')
  await expect(page.locator('.metric-kind-badge.kind-rule').first()).toContainText('Rule')

  // Check Workspace BriefComparison
  await page.goto('/en/workspace?network=swift')
  await expect(page.locator('.brief-evidence-cards .metric-kind-badge').first()).toBeVisible()
  await expect(page.locator('.brief-evidence-cards .metric-kind-badge').first()).toContainText('Statistic')
})

