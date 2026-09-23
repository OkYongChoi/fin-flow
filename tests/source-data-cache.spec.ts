import { test, expect } from '@playwright/test'

test('public source files are shared across pages and revalidated after five minutes', async ({ page }) => {
  const requested: string[] = []
  page.on('request', request => {
    const path = new URL(request.url()).pathname
    if (/^\/data\/(manifest|metrics|sources)\.json$/.test(path)) requested.push(path)
  })
  await page.goto('/en/workspace')
  await expect(page.getByRole('button', { name: 'Export Markdown', exact: true })).toBeEnabled()
  await page.getByLabel('Your perspective and questions').fill('Keep these notes while reviewing sources')
  expect(requested).toHaveLength(3)
  await page.getByRole('button', { name: 'Review data and sources', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Data coverage by network', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Review SWIFT', exact: true }).click()
  await page.getByRole('button', { name: 'Create a brief with this network', exact: true }).click()
  await expect(page.getByLabel('Your perspective and questions')).toHaveValue('Keep these notes while reviewing sources')
  await expect(page.getByRole('button', { name: 'Export Markdown', exact: true })).toBeEnabled()
  expect(requested).toHaveLength(3)

  await page.clock.setFixedTime(new Date(Date.now() + 5 * 60 * 1000 + 1_000))
  await page.getByRole('button', { name: 'Review data and sources', exact: true }).click()
  await expect.poll(() => requested.length).toBe(6)
  await expect(page.getByRole('heading', { name: 'Data coverage by network', exact: true })).toBeVisible()
  for (const file of ['manifest', 'sources', 'metrics']) expect(requested.filter(path => path === `/data/${file}.json`)).toHaveLength(2)
})
