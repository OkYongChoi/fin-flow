import { expect, test } from '@playwright/test'

test('dashboard exposes sourced metrics and updates selected network', async ({ page }) => {
  await page.goto('/ko/map')
  await expect(page.getByText('Flow of Money')).toBeVisible()
  await expect(page.getByText('구조도 · 실거래 위치 아님')).toBeVisible()
  await page.getByRole('button', { name: /Circle USDC/ }).click()
  await expect(page).toHaveURL(/network=usdc/)
  await page.getByRole('tab', { name: '통계', exact: true }).click()
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

test('mobile menu opens and navigates to another section', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Mobile navigation is only rendered at the mobile breakpoint')

  await page.goto('/en/map')
  const menuButton = page.getByRole('button', { name: 'Open menu' })
  await menuButton.click()
  await expect(page.getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true')

  const navigation = page.getByRole('navigation', { name: 'Primary' })
  await expect(navigation).toBeVisible()
  await navigation.getByRole('button', { name: 'Networks', exact: true }).click()
  await expect(page).toHaveURL(/\/en\/networks$/)
  await expect(page.getByRole('heading', { name: 'Financial networks', level: 1 })).toBeVisible()
})

test('About opens the Learn section', async ({ page, isMobile }) => {
  test.skip(isMobile, 'The compact mobile header exposes Learn through its menu')

  await page.goto('/en/map')
  await page.getByRole('button', { name: 'About the project' }).click()
  await expect(page).toHaveURL(/\/en\/learn$/)
  await expect(page.getByRole('heading', { name: 'Learn', level: 1 })).toBeVisible()
})

test('inspector tabs replace the route with distinct panels', async ({ page }) => {
  await page.goto('/en/map?network=chips-fedwire')

  const pathTab = page.getByRole('tab', { name: 'Path', exact: true })
  await expect(pathTab).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('tabpanel')).toContainText('Originating bank')

  await page.getByRole('tab', { name: 'Institutions', exact: true }).click()
  await expect(page.getByRole('tabpanel', { name: 'Institutions' })).toContainText('Participating institutions')
  await expect(page.getByRole('tabpanel', { name: 'Path' })).toHaveCount(0)

  await page.getByRole('tab', { name: 'Statistics', exact: true }).click()
  await expect(page.getByRole('tabpanel', { name: 'Statistics' })).toContainText('CHIPS average daily value')
  await expect(page.getByRole('tabpanel', { name: 'Institutions' })).toHaveCount(0)

  await page.getByRole('tab', { name: 'Documents', exact: true }).click()
  await expect(page.getByRole('tabpanel', { name: 'Documents' })).toContainText('The Clearing House')
  await expect(page.getByRole('tabpanel', { name: 'Statistics' })).toHaveCount(0)
})

test('network filter updates the selected network', async ({ page }) => {
  await page.goto('/en/map?network=chips-fedwire')
  await page.getByRole('combobox', { name: 'Network' }).selectOption('usdc')
  await expect(page).toHaveURL(/network=usdc/)
  await expect(page.getByRole('heading', { name: 'Circle USDC' })).toBeVisible()
  await expect(page.getByRole('button', { name: /Circle USDC/ })).toHaveAttribute('aria-pressed', 'true')
})

test('advanced filters persist in the URL and change displayed routes and statistics', async ({ page }) => {
  await page.goto('/en/map?network=usdc')
  await page.getByRole('combobox', { name: 'Currency' }).selectOption('token')
  await page.getByRole('combobox', { name: 'Region' }).selectOption('apac')
  await expect(page).toHaveURL(/currency=token/)
  await expect(page).toHaveURL(/region=apac/)

  const rows = page.locator('.map-data-table tbody tr')
  await expect(rows).toHaveCount(3)

  await page.getByRole('combobox', { name: 'Period' }).selectOption('2025')
  await page.getByRole('tab', { name: 'Statistics', exact: true }).click()
  await expect(page.getByRole('tabpanel', { name: 'Statistics' })).toContainText('—')

  await page.reload()
  await expect(page.getByRole('combobox', { name: 'Currency' })).toHaveValue('token')
  await expect(page.getByRole('combobox', { name: 'Period' })).toHaveValue('2025')
})

test('filters expose an empty state and reset to the default view', async ({ page }) => {
  await page.goto('/en/map?network=swift')
  await page.getByRole('combobox', { name: 'Currency' }).selectOption('token')
  await expect(page.locator('.map-empty')).toContainText('The selected network does not match the current filters.')
  await page.getByRole('button', { name: 'Reset filters' }).click()
  await expect(page).toHaveURL(/network=chips-fedwire/)
  await expect(page.getByRole('combobox', { name: 'Currency' })).toHaveValue('all')
})

test('timeline content follows the selected network and speed control works', async ({ page }) => {
  await page.goto('/en/map?network=usdc')
  const timeline = page.locator('.flow-timeline')
  await expect(timeline.getByText('Fiat deposit', { exact: true }).first()).toBeVisible()
  const speed = page.getByRole('button', { name: 'Playback speed 1x' })
  await speed.click()
  await expect(page.getByRole('button', { name: 'Playback speed 2x' })).toBeVisible()
  await page.locator('.network-sidebar').getByRole('button', { name: /SWIFT/ }).click()
  await expect(timeline.getByText('Instruction', { exact: true }).first()).toBeVisible()
  await expect(timeline.getByText('Fiat deposit', { exact: true })).toHaveCount(0)
})

test('English institution and asset pages have translated, distinct content', async ({ page }) => {
  await page.goto('/en/institutions')
  await expect(page.getByRole('heading', { name: 'Institutions', level: 1 })).toBeVisible()
  const institutionPage = page.getByRole('main')
  await expect(institutionPage).not.toContainText(/[가-힣]/)
  const institutionCards = await institutionPage.getByRole('heading', { level: 2 }).allTextContents()

  await page.goto('/en/assets')
  await expect(page.getByRole('heading', { name: 'Asset flows', level: 1 })).toBeVisible()
  const assetPage = page.getByRole('main')
  await expect(assetPage).not.toContainText(/[가-힣]/)
  const assetCards = await assetPage.getByRole('heading', { level: 2 }).allTextContents()

  expect(assetCards).not.toEqual(institutionCards)
})

test('editorial cards navigate to stable deep links', async ({ page }) => {
  await page.goto('/en/networks')
  const swiftCard = page.getByRole('link').filter({ has: page.getByRole('heading', { name: 'SWIFT', level: 2 }) })
  await swiftCard.click()
  await expect(page).toHaveURL(/\/en\/networks\/swift$/)
  await expect(swiftCard).toHaveAttribute('aria-current', 'page')
})
