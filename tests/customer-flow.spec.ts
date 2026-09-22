import { test, expect } from '@playwright/test'

for (const locale of ['ko', 'en'] as const) {
  const ko = locale === 'ko'
  test(`${locale}: learning and institution cards reveal a focused guide and lead to usable data`, async ({ page }) => {
    await page.goto(`/${locale}/learn`)
    await page.getByRole('button', { name: ko ? /메시지와 돈/ : /Messages vs money/ }).click()
    const detail = page.getByRole('region', { name: ko ? '메시지와 돈 · 상세 가이드' : 'Messages vs money · Detailed guide', exact: true })
    await expect(detail).toBeFocused()
    await expect(detail).toContainText(ko ? '은행 간 메시지 전달' : 'Interbank message delivery')
    await detail.getByRole('button', { name: ko ? '원문과 지표 보기' : 'View sources and metrics' }).click()
    await expect(page).toHaveURL(/map\?network=swift$/)
    await expect(page.getByRole('heading', { name: ko ? '흐름 이해하기' : 'Understand the flow' })).toBeVisible()
    await page.goto(`/${locale}/institutions/4`)
    const institution = page.getByRole('region', { name: ko ? '발행자와 수탁자 · 상세 가이드' : 'Issuers & custodians · Detailed guide', exact: true })
    await expect(institution).toBeVisible()
    await institution.getByRole('button', { name: ko ? '이 흐름으로 브리핑 작성' : 'Create a brief from this flow' }).click()
    await expect(page).toHaveURL(/workspace\?network=usdc$/)
    await page.getByRole('button', { name: ko ? '초안에 추가' : 'Add to draft', exact: true }).click()
    const preview = page.getByRole('region', { name: ko ? '브리핑 미리보기' : 'Brief preview', exact: true })
    await expect(preview).toContainText(ko ? '체인과 토큰 식별' : 'Identify the chain and token')
    await expect(preview.getByRole('link', { name: /Circle · USDC contract addresses/ })).toHaveAttribute('href', 'https://developers.circle.com/stablecoins/usdc-contract-addresses')
  })

  test(`${locale}: empty metrics keep their source and a useful process explanation`, async ({ page }) => {
    await page.route('**/data/metrics.json', route => route.fulfill({ json: [] }))
    await page.goto(`/${locale}/map?network=swift`)
    await expect(page.getByText(ko ? /수치 0을 뜻하지 않습니다/ : /does not mean a value of zero/)).toBeVisible()
    await expect(page.getByText(ko ? '은행 간 메시지 전달' : 'Interbank message delivery')).toBeVisible()
    await expect(page.getByRole('link', { name: ko ? 'SWIFT 원문 열기' : 'Open SWIFT primary source', exact: true })).toBeVisible()
    await expect(page.getByText(ko ? '연결된 원문이 없습니다.' : 'No linked primary sources.')).toHaveCount(0)
  })
}

test('slow loading never claims data is empty; malformed payload offers a working retry', async ({ page }) => {
  let release!: () => void
  const gate = new Promise<void>(resolve => { release = resolve })
  await page.route('**/data/metrics.json', async route => { await gate; await route.fulfill({ json: { error: 'unavailable' } }) })
  await page.goto('/en/map?network=swift', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: 'Loading source data…' })).toBeVisible()
  await expect(page.getByText(/No verified metrics/)).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'SWIFT source history' })).toHaveCount(0)
  release()
  await expect(page.getByRole('alert')).toContainText('Source data could not be loaded.')
  await page.unroute('**/data/metrics.json')
  await page.getByRole('button', { name: 'Retry', exact: true }).click()
  await expect(page.getByText('13.24M').first()).toBeVisible()
  await expect(page).toHaveURL(/network=swift/)
})

test('empty source registry has a recovery path and populated reload', async ({ page }) => {
  await page.route('**/data/sources.json', route => route.fulfill({ json: [] }))
  await page.goto('/en/data')
  await expect(page.getByRole('heading', { name: 'No sources to review yet' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Open learning guides' })).toBeEnabled()
  await page.unroute('**/data/sources.json')
  await page.getByRole('button', { name: 'Retry data load' }).click()
  await expect(page.getByRole('heading', { name: 'No sources to review yet' })).toHaveCount(0)
  await expect(page.locator('.source-row a').first()).toBeVisible()
})

test('asset deep links and modern surfaces reflow at 320px with keyboard focus', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 })
  await page.goto('/en/assets/4')
  const detail = page.getByRole('region', { name: 'On-chain tokens · Detailed guide', exact: true })
  await expect(detail).toBeFocused()
  await expect(detail.getByRole('button', { name: 'View sources and metrics' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.getByRole('button', { name: '한국어로 전환' }).click()
  await expect(page).toHaveURL(/\/ko\/assets\/4$/)
  await expect(page.getByRole('region', { name: '온체인 토큰 · 상세 가이드', exact: true })).toBeVisible()
})
