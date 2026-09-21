import { test, expect } from '@playwright/test'

test('free briefing survives reload, compares networks and exports cited Markdown', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/en/workspace')
  await expect(page).toHaveTitle('Briefing workspace · Flow of Money')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('One clear briefing')
  await page.getByLabel('Brief title').fill('Payments onboarding')
  await page.getByLabel('Your perspective and questions').fill('Compare messaging with settlement.')
  await page.getByRole('checkbox', { name: 'Visa', exact: true }).check()
  await page.getByRole('checkbox', { name: 'Bond issuance', exact: true }).check()
  await expect(page.getByRole('checkbox', { name: 'Circle USDC', exact: true })).toBeDisabled()
  await page.reload()
  await expect(page.getByLabel('Brief title')).toHaveValue('Payments onboarding')
  await expect(page.getByLabel('Your perspective and questions')).toHaveValue('Compare messaging with settlement.')
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export Markdown', exact: true }).click()
  const file = await download
  expect(file.suggestedFilename()).toBe('Payments_onboarding.md')
  const stream = await file.createReadStream()
  let content = ''
  for await (const chunk of stream!) content += chunk.toString()
  expect(content).toContain('Compare messaging with settlement.')
  expect(content).toContain('Source review due')
  expect(content).toContain('https://')
  await expect(page.getByRole('button', { name: 'Save to account' })).toBeDisabled()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(errors).toEqual([])
})

test('plans preserve free entry and explain unavailable sales in both languages', async ({ page }) => {
  await page.goto('/ko/pricing?checkout=returned')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('금융 지식')
  await expect(page.getByRole('button', { name: '판매 준비 중' })).toBeDisabled()
  await page.getByRole('button', { name: 'Switch to English' }).click()
  await expect(page).toHaveURL(/\/en\/pricing\?checkout=returned/)
  await expect(page.getByRole('button', { name: 'Sales opening soon' })).toBeDisabled()
  await page.getByRole('button', { name: 'Create a free brief' }).click()
  await expect(page).toHaveURL(/\/en\/workspace$/)
  await expect(page.getByLabel('Brief title')).toBeVisible()
})

test('invalid stored draft and unavailable source data remain recoverable', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('fin-flow:brief-draft:v1', '{broken'))
  await page.route('**/data/sources.json', route => route.fulfill({ status: 503, body: 'unavailable' }))
  await page.goto('/en/workspace')
  await expect(page.getByLabel('Brief title')).toHaveValue('Financial flow comparison')
  await expect(page.getByRole('alert')).toContainText('Sources could not load')
  await expect(page.getByRole('button', { name: 'Export Markdown', exact: true })).toBeDisabled()
})
