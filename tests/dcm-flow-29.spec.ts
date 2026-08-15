import { expect, test } from '@playwright/test'

test('issuance and derivatives map tables expose localized lifecycle scope', async ({ page, isMobile }) => {
  test.skip(isMobile, 'The desktop map data table is intentionally hidden on mobile.')
  await page.goto('/en/map?network=bond-issuance')
  await page.getByRole('button', { name: 'Basic' }).click()
  await page.getByText('View map data as a table').click()
  await expect(page.getByRole('table', { name: 'Primary-market bond issuance schematic' })).toBeVisible()
  await expect(page.getByRole('cell', { name: 'Issuance' }).first()).toBeVisible()

  await page.goto('/ko/map?network=derivatives')
  await page.getByRole('button', { name: '기본' }).click()
  await page.getByText('지도 데이터 표로 보기').click()
  await expect(page.getByRole('table', { name: 'OTC 파생상품 청산 경로 구조도' })).toBeVisible()
  await expect(page.getByRole('cell', { name: '청산' }).first()).toBeVisible()
})
