import { expect, test } from '@playwright/test'
import { NETWORKS } from '../src/data'

for (const locale of ['ko', 'en'] as const) {
  const ko = locale === 'ko'
  test(`${locale}: everyday questions find networks without replacing the current selection`, async ({ page }) => {
    await page.goto(`/${locale}/map?network=swift&ref=discovery`)
    const search = page.getByRole('searchbox', { name: ko ? '금융 네트워크 검색' : 'Search financial networks' })
    const buttons = page.locator('.network-list button')
    for (const [query, label] of [
      ['해외송금', 'SWIFT'],
      ['international transfer', 'SWIFT'],
      ['카드 결제', 'Visa'],
      ['CARD PAYMENT', 'Visa'],
      ['스테이블코인', 'Circle USDC'],
      ['digital dollar', 'Circle USDC'],
      ['ETF', 'ETF'],
    ]) {
      await search.fill(query)
      await expect(buttons).toHaveCount(1)
      await expect(buttons.first()).toContainText(label)
      await expect(page.locator('#source-data-board-title')).toHaveText('SWIFT')
      await expect(page).toHaveURL(`/${locale}/map?network=swift&ref=discovery`)
    }
    await expect(page.locator('.network-sidebar .selection-filter-notice')).toContainText('SWIFT')
    await search.fill(ko ? '카드 결제' : 'card payment')
    await buttons.first().click()
    await expect(page.locator('#source-data-board-title')).toHaveText('Visa')
    await expect(page).toHaveURL(`/${locale}/map?network=visa&ref=discovery`)
    await expect(buttons.first()).toHaveAttribute('aria-pressed', 'true')
    await search.fill('no-such-network')
    await expect(buttons).toHaveCount(0)
    await expect(page.locator('.network-sidebar .selection-filter-notice')).toContainText('Visa')
    await page.getByRole('button', { name: ko ? '네트워크 검색어 지우기' : 'Clear network search', exact: true }).click()
    await expect(search).toBeFocused()
    await expect(search).toHaveValue('')
    await expect(buttons).toHaveCount(NETWORKS.length)
    await expect(page.locator('#source-data-board-title')).toHaveText('Visa')
  })
}
