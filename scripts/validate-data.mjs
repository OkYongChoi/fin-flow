import { readFile } from 'node:fs/promises'

const root = new URL('../public/data/', import.meta.url)
const [manifest, sources, metrics] = await Promise.all([
  readFile(new URL('manifest.json', root), 'utf8').then(JSON.parse),
  readFile(new URL('sources.json', root), 'utf8').then(JSON.parse),
  readFile(new URL('metrics.json', root), 'utf8').then(JSON.parse),
])

const fail = (message) => { throw new Error(`Data validation failed: ${message}`) }
if (!/^\d{4}\.\d{2}\.\d{2}$/.test(manifest.version)) fail('manifest.version must be YYYY.MM.DD')
if (typeof manifest.generatedAt !== 'string' || Number.isNaN(Date.parse(manifest.generatedAt))) fail('manifest.generatedAt must be a valid timestamp')
if (typeof manifest.coverageNotice !== 'string' || !manifest.coverageNotice.trim()) fail('manifest.coverageNotice must be a non-empty string')
if (!Array.isArray(sources) || sources.length === 0) fail('sources must not be empty')
if (!Array.isArray(metrics) || metrics.length === 0) fail('metrics must not be empty')

const sourceIds = new Set()
const sourceUrls = new Set()
for (const source of sources) {
  for (const key of ['id', 'provider', 'title', 'url', 'publishedAt', 'retrievedAt', 'coveragePeriod', 'cadence']) if (!source[key]) fail(`source ${source.id ?? '?'} missing ${key}`)
  if (!source.url.startsWith('https://')) fail(`source ${source.id} must use HTTPS`)
  try { if (!new URL(source.url).hostname) fail(`source ${source.id} must have a hostname`) } catch { fail(`source ${source.id} must use a valid URL`) }
  if (Number.isNaN(Date.parse(source.publishedAt)) || Number.isNaN(Date.parse(source.retrievedAt))) fail(`source ${source.id} has an invalid publication or retrieval date`)
  if (new Date(source.retrievedAt) < new Date(source.publishedAt)) fail(`source ${source.id} was retrieved before publication`)
  if (source.retrievedAt.slice(0, 10) > manifest.generatedAt.slice(0, 10)) fail(`source ${source.id} was retrieved after the snapshot was generated`)
  if (sourceIds.has(source.id)) fail(`duplicate source ${source.id}`)
  if (sourceUrls.has(source.url)) fail(`duplicate source URL ${source.url}`)
  sourceIds.add(source.id)
  sourceUrls.add(source.url)
}

const networkIds = new Set(['swift', 'visa', 'chips-fedwire', 'derivatives', 'usdc'])
const metricIds = new Set()
for (const metric of metrics) {
  for (const key of ['id', 'networkId', 'labelKo', 'labelEn', 'display', 'unit', 'coveragePeriod', 'sourceId']) if (!metric[key]) fail(`metric ${metric.id ?? '?'} missing ${key}`)
  if (metricIds.has(metric.id)) fail(`duplicate metric ${metric.id}`)
  metricIds.add(metric.id)
  if (!networkIds.has(metric.networkId)) fail(`metric ${metric.id} references unknown network ${metric.networkId}`)
  if (!metric.labelKo.trim() || !metric.labelEn.trim() || !metric.display.trim()) fail(`metric ${metric.id} has an empty display label`)
  if (!Number.isFinite(metric.value)) fail(`metric ${metric.id} has a non-numeric value`)
  if (!sourceIds.has(metric.sourceId)) fail(`metric ${metric.id} references unknown source ${metric.sourceId}`)
}

console.log(`Validated ${metrics.length} metrics against ${sources.length} official sources (${manifest.version}).`)
