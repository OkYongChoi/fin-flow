import { chromium } from '@playwright/test'
import { writeFile } from 'node:fs/promises'

// Run against a production preview. Keep timings out of CI assertions: they
// depend on the host; decoded bytes and request counts are the stable measures.
const base = process.argv[2] ?? 'http://127.0.0.1:4174'
const output = process.argv[3]
const browser = await chromium.launch({ headless: true })
const results = { samples: [], errors: [], navigationRequests: [], editing: null }
const median = values => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]

try {
  for (let i = 0; i < 5; i++) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const page = await context.newPage()
    page.on('pageerror', error => results.errors.push(error.message))
    const session = await context.newCDPSession(page)
    await session.send('Emulation.setCPUThrottlingRate', { rate: 4 })
    await session.send('Network.setCacheDisabled', { cacheDisabled: true })
    await page.goto(`${base}/en/workspace`)
    await page.getByRole('button', { name: 'Export Markdown', exact: true }).waitFor()
    await page.waitForFunction(() => document.querySelector('.brief-evidence-card a'))
    results.samples.push(await page.evaluate(() => {
      const scripts = performance.getEntriesByType('resource').filter(entry => new URL(entry.name).pathname.endsWith('.js'))
      return {
        observedReadyMs: performance.now(),
        decodedJsBytes: scripts.reduce((n, entry) => n + entry.decodedBodySize, 0),
        jsFiles: scripts.map(entry => new URL(entry.name).pathname.split('/').at(-1)),
      }
    }))

    if (i === 4) {
      await page.getByRole('checkbox', { name: 'Visa', exact: true }).check()
      await page.getByRole('checkbox', { name: 'Bond issuance', exact: true }).check()
      await page.getByLabel('Your perspective and questions').fill('A large working note. '.repeat(250))
      await page.evaluate(() => {
        window.typingSamples = []
        document.querySelector('textarea').addEventListener('input', () => {
          const start = performance.now()
          requestAnimationFrame(() => window.typingSamples.push(performance.now() - start))
        })
      })
      await page.getByLabel('Your perspective and questions').pressSequentially(' Typing a useful financial comparison with four selected networks.', { delay: 24 })
      results.editing = await page.evaluate(() => {
        const samples = [...window.typingSamples].sort((a, b) => a - b)
        return { inputCount: samples.length, medianNextFrameMs: samples[Math.floor(samples.length / 2)], p95NextFrameMs: samples[Math.floor(samples.length * .95)] }
      })
      const countRequests = () => page.evaluate(() => performance.getEntriesByType('resource').filter(entry => /^\/data\/(manifest|metrics|sources)\.json$/.test(new URL(entry.name).pathname)).length)
      results.navigationRequests.push(await countRequests())
      await page.getByRole('button', { name: 'Network data', exact: true }).click()
      await page.locator('#source-data-board-title').waitFor()
      results.navigationRequests.push(await countRequests())
      await page.getByRole('button', { name: 'Briefings', exact: true }).click()
      await page.waitForFunction(() => document.querySelector('.brief-evidence-card a'))
      results.navigationRequests.push(await countRequests())
      await page.getByRole('button', { name: 'Data', exact: true }).click()
      await page.getByRole('heading', { name: 'The source comes before the number.', exact: true }).waitFor()
      results.navigationRequests.push(await countRequests())
      await page.getByRole('button', { name: 'Briefings', exact: true }).click()
      await page.waitForFunction(() => document.querySelector('.brief-evidence-card a'))
      results.navigationRequests.push(await countRequests())
    }
    await context.close()
  }
} finally {
  await browser.close()
}

const report = {
  baseURL: base,
  conditions: '5 fresh desktop contexts, CPU 4x slowdown, browser cache disabled, no network throttling; decoded bytes are not compressed transfer size; readiness and next-frame timings are not Core Web Vitals',
  medianObservedReadyMs: median(results.samples.map(sample => sample.observedReadyMs)),
  medianDecodedJsBytes: median(results.samples.map(sample => sample.decodedJsBytes)),
  ...results,
}
if (output) await writeFile(output, JSON.stringify(report, null, 2) + '\n')
console.log(JSON.stringify(report, null, 2))
if (results.errors.length > 0) process.exitCode = 1
