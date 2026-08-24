import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { NETWORKS } from '../src/data'

const manifest = JSON.parse(readFileSync(new URL('../public/data/manifest.json', import.meta.url), 'utf8'))
const sourceCount = JSON.parse(readFileSync(new URL('../public/data/sources.json', import.meta.url), 'utf8')).length

test('dashboard shows source-backed metrics and changes the selected network', async ({ page }) => {
  await page.goto('/ko/map')
  await expect(page.locator('.source-data-heading > div > span')).toHaveText('출처 기반 데이터')
  await expect(page.getByText('2025', { exact: true }).first()).toBeVisible()
  await expect(page.getByRole('heading', { name: 'CHIPS · Fedwire', exact: true }).first()).toBeVisible()
  await expect(page.getByText('다음 검토', { exact: true })).toBeVisible()
  await expect(page.getByText(new Date(manifest.reviewDueAt + 'T00:00:00Z').toLocaleDateString('ko-KR', { dateStyle: 'medium', timeZone: 'UTC' }))).toBeVisible()
  await page.getByRole('button', { name: /Circle USDC/ }).click()
  await expect(page).toHaveURL(/network=usdc/)
  await expect(page.getByText('USDC 유통량', { exact: true }).first()).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Circle USDC 출처 발행 이력' })).toBeVisible()
})

test('network selection is exposed as a labelled navigation landmark', async ({ page }) => {
  await page.goto('/en/map')
  await expect(page.getByRole('complementary', { name: 'Financial networks' })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Financial networks' }).getByRole('button')).toHaveCount(NETWORKS.length)
})

test('source-data failure has a localized retry action', async ({ page }) => {
  await page.route('**/data/metrics.json', (route) => route.fulfill({ status: 503, body: 'unavailable' }))
  await page.goto('/ko/map')
  const alert = page.getByRole('alert')
  await expect(alert).toContainText('출처 데이터를 불러올 수 없습니다.')
  await expect(alert.getByRole('button', { name: '다시 시도' })).toBeVisible()
})

test('locale switch preserves the selected source snapshot', async ({ page }) => {
  await page.goto('/ko/map?network=swift')
  await page.getByRole('button', { name: 'Switch to English' }).click()
  await expect(page).toHaveURL(/\/en\/map\?network=swift/)
  await expect(page.locator('.source-data-heading > div > span')).toHaveText('Source-backed data')
})

test('source controls expose dynamically loaded coverage and documents', async ({ page }) => {
  await page.goto('/en/map?network=swift')
  await expect(page.getByText('2025', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('Next review', { exact: true })).toBeVisible()
  await expect(page.getByText(new Date(manifest.reviewDueAt + 'T00:00:00Z').toLocaleDateString('en-US', { dateStyle: 'medium', timeZone: 'UTC' }))).toBeVisible()
  await page.getByLabel('Network', { exact: true }).selectOption('usdc')
  await expect(page).toHaveURL(/network=usdc/)
  await expect(page.getByRole('heading', { name: 'Circle USDC source history' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Open Circle primary source' })).toBeVisible()
})

test('data registry displays the current snapshot and all linked primary sources', async ({ page }) => {
  await page.goto('/en/data')
  await expect(page.getByRole('heading', { name: 'Source registry' })).toBeVisible()
  await expect(page.getByRole('status')).toContainText(manifest.generatedAt.slice(0, 10))
  await expect(page.locator('.source-row a')).toHaveCount(sourceCount)
})

test('mobile menu exposes primary navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/en/map')
  await page.getByRole('button', { name: 'Open menu' }).click()
  await page.getByRole('button', { name: 'Data', exact: true }).click()
  await expect(page).toHaveURL(/\/en\/data/)
})

test('source history shows the selected network retrieval records', async ({ page }) => {
  await page.goto('/en/map?network=usdc')
  await expect(page.getByRole('heading', { name: 'Circle USDC source history' })).toBeVisible()
  await expect(page.getByText(`Snapshot ${manifest.generatedAt.slice(0, 10)}`)).toBeVisible()
  await expect(page.getByRole('link', { name: 'Open Circle primary source' })).toBeVisible()
})

test('ETF view explains leveraged and inverse product construction with its official source', async ({ page }) => {
  await page.goto('/ko/map?network=etf-primary-market')
  const structure = page.getByRole('region', { name: '상품 구성 방식' })
  await expect(structure).toBeVisible()
  await expect(structure.getByRole('heading', { name: '레버리지 ETF' })).toBeVisible()
  await expect(structure).toContainText('스왑·선물·기타 파생상품')
  await expect(structure).toContainText('매 거래일 목표 노출로 재조정')
  await expect(structure.getByRole('heading', { name: '인버스 ETF' })).toBeVisible()
  await expect(page.getByText('1 trading day').first()).toBeVisible()
  await expect(page.getByText('Updated Investor Bulletin: Leveraged and Inverse ETFs').first()).toBeVisible()
})

test('leveraged ETF construction remains readable in the mobile source board', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/en/map?network=etf-primary-market')
  const structure = page.getByRole('region', { name: 'How the products are constructed' })
  await expect(structure).toBeVisible()
  await expect(structure.getByRole('heading', { name: 'Leveraged ETF' })).toBeVisible()
  await expect(structure).toContainText('Reset to target exposure each trading day')
})
