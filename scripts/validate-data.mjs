import { readFile } from 'node:fs/promises'

const root = new URL('../public/data/', import.meta.url)
const [manifest, sources, metrics] = await Promise.all([
  readFile(new URL('manifest.json', root), 'utf8').then(JSON.parse),
  readFile(new URL('sources.json', root), 'utf8').then(JSON.parse),
  readFile(new URL('metrics.json', root), 'utf8').then(JSON.parse),
])

const fail = (message) => { throw new Error(`Data validation failed: ${message}`) }
if (!/^\d{4}\.\d{2}\.\d{2}$/.test(manifest.version)) fail('manifest.version must be YYYY.MM.DD')
if (typeof manifest.coverageNotice !== 'string' || !manifest.coverageNotice.trim()) fail('manifest.coverageNotice must be a non-empty string')
if (!Array.isArray(sources) || sources.length === 0) fail('sources must not be empty')
if (!Array.isArray(metrics) || metrics.length === 0) fail('metrics must not be empty')

const sourceIds = new Set()
for (const source of sources) {
  for (const key of ['id', 'provider', 'title', 'url', 'publishedAt', 'retrievedAt', 'coveragePeriod', 'cadence']) if (!source[key]) fail(`source ${source.id ?? '?'} missing ${key}`)
  if (!source.url.startsWith('https://')) fail(`source ${source.id} must use HTTPS`)
  if (sourceIds.has(source.id)) fail(`duplicate source ${source.id}`)
  sourceIds.add(source.id)
}

for (const metric of metrics) {
  for (const key of ['id', 'networkId', 'labelKo', 'labelEn', 'display', 'unit', 'coveragePeriod', 'sourceId']) if (!metric[key]) fail(`metric ${metric.id ?? '?'} missing ${key}`)
  if (!Number.isFinite(metric.value)) fail(`metric ${metric.id} has a non-numeric value`)
  if (!sourceIds.has(metric.sourceId)) fail(`metric ${metric.id} references unknown source ${metric.sourceId}`)
}

console.log(`Validated ${metrics.length} metrics against ${sources.length} official sources (${manifest.version}).`)
