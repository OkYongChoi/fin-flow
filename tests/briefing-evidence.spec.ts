import { test, expect, type Download, type Page } from '@playwright/test'

async function downloadedText(download: Download) {
  const stream = await download.createReadStream()
  expect(stream).not.toBeNull()
  let contents = ''
  for await (const chunk of stream!) contents += chunk.toString()
  return contents
}

async function backup(page: Page) {
  const downloading = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download editable backup', exact: true }).click()
  const download = await downloading
  expect(download.suggestedFilename()).toMatch(/\.fin-flow\.json$/)
  return downloadedText(download)
}

async function restore(page: Page, contents: string) {
  await page.getByLabel('Open editable backup', { exact: true }).setInputFiles({
    name: 'saved-brief.fin-flow.json', mimeType: 'application/json', buffer: Buffer.from(contents),
  })
}

for (const locale of ['en', 'ko'] as const) {
  test(`${locale}: an everyday question becomes a readable comparison and an evidence-backed export`, async ({ page }) => {
    const ko = locale === 'ko'
    await page.goto(`/${locale}/map`)
    await page.getByRole('button', { name: ko ? '궁금한 질문으로 시작' : 'Start with a question', exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`/${locale}/workspace$`))
    await page.getByRole('button', { name: ko ? /카드 결제와 계좌이체는 어떻게 다를까/ : /How do cards and bank transfers differ/ }).click()
    await expect(page.getByRole('checkbox', { name: 'Visa', exact: true })).toBeChecked()
    await expect(page.getByRole('checkbox', { name: 'CHIPS · Fedwire', exact: true })).toBeChecked()
    await expect(page.getByRole('checkbox', { name: 'SWIFT', exact: true })).not.toBeChecked()
    await expect(page.getByLabel(ko ? '내 관점과 질문' : 'Your perspective and questions')).toContainText(ko ? '내 말로 설명하기:' : 'In my own words:')
    const preview = page.getByRole('region', { name: ko ? '브리핑 미리보기' : 'Brief preview', exact: true })
    await preview.getByText(ko ? '처음이라면: 비교표 읽는 법' : 'New here? Read the comparison', { exact: true }).click()
    await expect(preview.getByText(ko ? /확인일이 최근이어도 자료의 대상 기간까지 최근이라는 뜻은 아닙니다/ : /A recent retrieval date does not mean the information covers a recent period/)).toBeVisible()
    const table = preview.getByRole('table')
    await expect(table.getByRole('columnheader', { name: 'Visa', exact: true })).toBeVisible()
    await expect(table.getByRole('columnheader', { name: 'CHIPS · Fedwire', exact: true })).toBeVisible()
    await expect(table.getByRole('rowheader', { name: ko ? '누가 참여하나요?' : 'Who takes part?', exact: true })).toBeVisible()
    const visa = preview.getByRole('region', { name: ko ? 'Visa 근거' : 'Visa evidence', exact: true })
    const volume = visa.getByRole('listitem').filter({ hasText: ko ? '결제 규모' : 'Payments volume' })
    await expect(volume).toContainText('$14.2T')
    await expect(volume).toContainText(ko ? '단위: USD · 대상 기간: FY2025' : 'Unit: USD · Period: FY2025')
    await expect(volume.getByRole('link')).toHaveAttribute('href', 'https://annualreport.visa.com/financials/default.aspx')
    await expect(volume.getByRole('link')).toContainText('2026-08-02')
    const downloading = page.waitForEvent('download')
    await page.getByRole('button', { name: ko ? 'Markdown 내보내기' : 'Export Markdown', exact: true }).click()
    const markdown = await downloadedText(await downloading)
    expect(markdown).toContain(ko ? '| 비교 항목 | Visa | CHIPS · Fedwire |' : '| Compare | Visa | CHIPS · Fedwire |')
    expect(markdown).toContain(ko ? '| 결제 규모 | $14.2T | USD | FY2025 |' : '| Payments volume | $14.2T | USD | FY2025 |')
    expect(markdown).toContain('https://annualreport.visa.com/financials/default.aspx')
    expect(markdown).toContain('2026-08-02')
    expect(markdown).not.toContain('13.24M')
    expect(markdown).toContain(ko ? '작성자 메모' : 'Author notes')
  })
}

test('editable backup restores document language and notes with cancel and undo protection', async ({ page }) => {
  await page.goto('/en/workspace')
  await page.getByLabel('Brief title').fill('Research to keep')
  await page.getByLabel('Your perspective and questions').fill('My own notes, not a source claim.\nNext question?')
  await page.getByLabel('Document language').selectOption('ko')
  await page.getByRole('checkbox', { name: 'Visa', exact: true }).check()
  const contents = await backup(page)
  const portable = JSON.parse(contents)
  expect(Object.keys(portable).sort()).toEqual(['draft', 'format', 'version'])
  expect(portable.draft).toEqual({ title: 'Research to keep', notes: 'My own notes, not a source claim.\nNext question?', networks: ['swift', 'chips-fedwire', 'visa'], locale: 'ko' })
  await page.getByLabel('Brief title').fill('Current work')
  await page.getByLabel('Your perspective and questions').fill('Do not lose these edits')
  await page.getByLabel('Document language').selectOption('en')
  await restore(page, contents)
  const dialog = page.getByRole('dialog', { name: 'Replace your current draft?' })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'Keep editing', exact: true }).click()
  await expect(page.getByLabel('Brief title')).toHaveValue('Current work')
  await restore(page, contents)
  await dialog.getByRole('button', { name: 'Replace draft', exact: true }).click()
  await expect(page.getByLabel('Brief title')).toHaveValue('Research to keep')
  await expect(page.getByLabel('Document language')).toHaveValue('ko')
  await expect(page.getByLabel('Your perspective and questions')).toHaveValue('My own notes, not a source claim.\nNext question?')
  await expect(page.getByRole('region', { name: 'Brief preview', exact: true })).toHaveAttribute('lang', 'ko')
  await page.getByRole('button', { name: 'Undo draft replacement', exact: true }).click()
  await expect(page.getByLabel('Brief title')).toHaveValue('Current work')
  await expect(page.getByLabel('Your perspective and questions')).toHaveValue('Do not lose these edits')
  await expect(page.getByLabel('Document language')).toHaveValue('en')
  await page.reload()
  await expect(page.getByLabel('Brief title')).toHaveValue('Current work')
})

test('invalid backup files explain the problem and preserve the current draft', async ({ page }) => {
  await page.goto('/en/workspace')
  await page.getByLabel('Brief title').fill('Untouched research')
  await page.getByLabel('Your perspective and questions').fill('Keep this after every rejected file')
  const valid = { format: 'flow-of-money-brief', version: 1, draft: { title: 'Imported', notes: '', networks: ['swift'], locale: 'en' } }
  const invalid = [
    ['{broken', 'The backup is not valid JSON.'],
    [JSON.stringify({ ...valid, format: 'another-app' }), 'Choose an editable backup saved by Flow of Money.'],
    [JSON.stringify({ ...valid, version: 2 }), 'This backup version is not supported.'],
    [JSON.stringify({ ...valid, draft: { ...valid.draft, networks: ['unknown'] } }), 'The backup contains an invalid title, notes, language or network selection.'],
    [' '.repeat(102401), 'Choose a briefing backup no larger than 100KB.'],
  ]
  for (const [contents, message] of invalid) {
    await restore(page, contents)
    await expect(page.getByRole('alert')).toContainText(message)
    await expect(page.getByRole('alert')).toContainText('Your current draft is preserved.')
    await expect(page.getByLabel('Brief title')).toHaveValue('Untouched research')
    await expect(page.getByLabel('Your perspective and questions')).toHaveValue('Keep this after every rejected file')
    await expect(page.getByRole('dialog')).not.toBeVisible()
  }
})

test('an unfinished draft can be backed up and restored without becoming exportable', async ({ page }) => {
  await page.goto('/en/workspace')
  await page.getByLabel('Brief title').fill('')
  await page.getByRole('checkbox', { name: 'SWIFT', exact: true }).uncheck()
  await page.getByRole('checkbox', { name: 'CHIPS · Fedwire', exact: true }).uncheck()
  await page.getByLabel('Your perspective and questions').fill('An unfinished question worth keeping')
  await expect(page.getByRole('button', { name: 'Export Markdown', exact: true })).toBeDisabled()
  const contents = await backup(page)
  expect(JSON.parse(contents).draft).toEqual({ title: '', notes: 'An unfinished question worth keeping', networks: [], locale: 'en' })
  await page.getByLabel('Brief title').fill('Temporary complete brief')
  await page.getByRole('checkbox', { name: 'Visa', exact: true }).check()
  await restore(page, contents)
  await page.getByRole('dialog').getByRole('button', { name: 'Replace draft', exact: true }).click()
  await expect(page.getByLabel('Brief title')).toHaveValue('')
  await expect(page.getByRole('checkbox', { checked: true })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Export Markdown', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Print / PDF', exact: true })).toBeDisabled()
  await expect(page.getByRole('region', { name: 'Brief preview', exact: true }).getByText('Choose at least one network.', { exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByLabel('Brief title')).toHaveValue('')
  await expect(page.getByLabel('Your perspective and questions')).toHaveValue('An unfinished question worth keeping')
})

test('four-flow comparisons and backup controls fit a 320px screen', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 })
  await page.goto('/en/workspace')
  await page.getByRole('checkbox', { name: 'Visa', exact: true }).check()
  await page.getByRole('checkbox', { name: 'Asset-backed securitization', exact: true }).check()
  await page.getByLabel('Your perspective and questions').fill('A long unbroken note: ' + 'evidence'.repeat(65))
  await page.getByRole('button', { name: 'View preview', exact: true }).click()
  const preview = page.getByRole('region', { name: 'Brief preview', exact: true })
  await expect(preview.getByRole('columnheader')).toHaveCount(5)
  await expect(preview.getByRole('region', { name: 'Asset-backed securitization evidence', exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  const scrollRegion = page.getByRole('region', { name: 'Network comparison, scroll horizontally', exact: true })
  expect(await scrollRegion.evaluate(element => element.scrollWidth > element.clientWidth)).toBe(true)
  await scrollRegion.evaluate(element => { element.scrollLeft = element.scrollWidth })
  expect(await scrollRegion.evaluate(element => element.scrollLeft)).toBeGreaterThan(0)
  for (const control of [page.getByRole('button', { name: 'Download editable backup', exact: true }), page.getByLabel('Open editable backup', { exact: true })]) {
    const bounds = await control.boundingBox()
    expect(bounds).not.toBeNull()
    expect(bounds!.x).toBeGreaterThanOrEqual(0)
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320)
  }
})

test('printing preserves the document language, includes evidence, and restores disclosure state', async ({ page }) => {
  await page.route('**/data/manifest.json', async route => {
    const response = await route.fetch()
    const manifest = await response.json()
    await route.fulfill({ response, json: { ...manifest, reviewDueAt: '2000-01-01' } })
  })
  await page.goto('/en/workspace')
  await expect(page.getByRole('button', { name: 'Print / PDF', exact: true })).toBeEnabled()
  await page.getByLabel('Document language').selectOption('ko')
  await expect(page.getByLabel('Document language')).toHaveValue('ko')
  await expect(page.getByLabel('Brief title', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Your perspective and questions', { exact: true })).toBeVisible()
  const preview = page.getByRole('region', { name: 'Brief preview', exact: true })
  await expect(preview).toHaveAttribute('lang', 'ko')
  const snapshot = preview.getByText(/^데이터 스냅샷 .*출처 검토 기한 2000-01-01$/)
  const reviewWarning = preview.getByText('출처 검토 기한이 지났습니다. 사용 전 원문을 확인하세요.', { exact: true })
  await expect(preview.getByText('브리핑 미리보기', { exact: true })).toBeVisible()
  await expect(snapshot).toBeVisible()
  await expect(reviewWarning).toBeVisible()
  await expect(preview.getByRole('heading', { name: '작성자 메모', exact: true })).toBeVisible()
  await preview.getByText('처음이라면: 비교표 읽는 법', { exact: true }).click()
  const details = preview.locator('details')
  const originalState = await details.evaluateAll(elements => elements.map(element => (element as HTMLDetailsElement).open))
  expect(originalState).toContain(false)
  expect(originalState).toContain(true)
  await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')))
  expect(await details.evaluateAll(elements => elements.every(element => (element as HTMLDetailsElement).open))).toBe(true)
  await page.emulateMedia({ media: 'print' })
  await expect(page.getByRole('region', { name: 'Brief editor', exact: true })).not.toBeVisible()
  await expect(page.getByRole('button', { name: 'Download editable backup', exact: true })).not.toBeVisible()
  await expect(preview).toBeVisible()
  await expect(preview.getByText('고객의 지급 요청', { exact: false })).toBeVisible()
  await expect(preview.getByText('브리핑 미리보기', { exact: true })).toBeVisible()
  await expect(snapshot).toBeVisible()
  await expect(reviewWarning).toBeVisible()
  await expect(preview.getByRole('heading', { name: '작성자 메모', exact: true })).toBeVisible()
  const source = preview.getByRole('region', { name: 'SWIFT 근거', exact: true }).getByRole('link', { name: /SWIFT · 확인일/ }).first()
  expect(await source.evaluate(element => getComputedStyle(element, '::after').content)).toContain('https://www.swift.com/swift-resource/252570/download')
  await page.emulateMedia({ media: 'screen' })
  await page.evaluate(() => window.dispatchEvent(new Event('afterprint')))
  expect(await details.evaluateAll(elements => elements.map(element => (element as HTMLDetailsElement).open))).toEqual(originalState)
  await expect(page.getByRole('region', { name: 'Brief editor', exact: true })).toBeVisible()
})
