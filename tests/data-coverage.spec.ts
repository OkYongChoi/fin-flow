import { test, expect } from '@playwright/test'

for (const locale of ['ko', 'en']) {
  test(`${locale}: coverage exposes missing source records and recovers`, async ({ page }) => {
    const ko = locale === 'ko'
    await page.route('**/data/sources.json', route => route.fulfill({ json: [] }))
    await page.goto(`/${locale}/data`)
    const coverage = page.getByRole('region', { name: ko ? '네트워크별 데이터 수록 현황' : 'Data coverage by network' })
    await expect(coverage.locator('article')).toHaveCount(19)
    await expect(coverage.locator('article').first()).toContainText(ko ? '출처 레코드 누락: 지표 2개' : 'Missing source records for 2 metrics')
    await coverage.getByRole('button', { name: ko ? 'SWIFT 확인' : 'Review SWIFT', exact: true }).click()
    await expect(page.getByText(ko ? /2개 지표의 출처 레코드/ : /2 metrics have missing source records/)).toBeVisible()
    await expect(page.locator('.network-list button').first()).toContainText(ko ? '출처 미수록' : 'No sources recorded')
    await page.getByRole('button', { name: ko ? '데이터 수록 현황 확인' : 'Check data coverage' }).click()
    await page.unroute('**/data/sources.json')
    await page.getByRole('button', { name: ko ? '누락 데이터 다시 확인' : 'Retry missing data' }).click()
    await expect(coverage.locator('article').first()).toContainText(ko ? '지표 2개 · 출처 1개' : '2 metrics · 1 sources')
    await expect(page.getByRole('button', { name: ko ? '누락 데이터 다시 확인' : 'Retry missing data' })).toHaveCount(0)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })
}
