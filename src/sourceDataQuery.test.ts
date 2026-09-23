import { QueryClient, QueryObserver } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'
import manifest from '../public/data/manifest.json'
import sources from '../public/data/sources.json'
import metrics from '../public/data/metrics.json'
import { SOURCE_DATA_STALE_TIME_MS, sourceDataQueryOptions } from './sourceDataQuery'

const clients: QueryClient[] = []
function client() {
  const result = new QueryClient({ defaultOptions: { queries: { retryDelay: 0 } } })
  clients.push(result)
  return result
}
function mockSources() {
  let version = manifest.version
  let missing = false
  const fetch = vi.spyOn(globalThis, 'fetch').mockImplementation(async url => Response.json(
    String(url).includes('manifest') ? { ...manifest, version } : String(url).includes('sources') ? (missing ? [] : sources) : metrics,
  ))
  return { fetch, version: (next: string) => { version = next }, missing: (next: boolean) => { missing = next } }
}
afterEach(() => { clients.splice(0).forEach(item => item.clear()); vi.restoreAllMocks() })

describe('shared public source snapshots', () => {
  it('deduplicates simultaneous consumers and revalidates after five minutes', async () => {
    const now = vi.spyOn(Date, 'now').mockReturnValue(1_000_000)
    const api = mockSources()
    const cache = client()
    const [explorer, workspace] = await Promise.all([
      cache.fetchQuery(sourceDataQueryOptions), cache.fetchQuery(sourceDataQueryOptions),
    ])
    expect(workspace).toBe(explorer)
    expect(api.fetch).toHaveBeenCalledTimes(3)
    now.mockReturnValue(1_000_000 + SOURCE_DATA_STALE_TIME_MS - 1)
    expect(await cache.fetchQuery(sourceDataQueryOptions)).toBe(explorer)
    expect(api.fetch).toHaveBeenCalledTimes(3)
    now.mockReturnValue(1_000_000 + SOURCE_DATA_STALE_TIME_MS + 1)
    api.version('fresh-snapshot')
    expect(await cache.fetchQuery(sourceDataQueryOptions)).toMatchObject({ version: 'fresh-snapshot' })
    expect(api.fetch).toHaveBeenCalledTimes(6)
  })

  it('allows an explicit retry to replace an incomplete snapshot before cache expiry', async () => {
    const api = mockSources()
    api.missing(true)
    const cache = client()
    expect(await cache.fetchQuery(sourceDataQueryOptions)).toMatchObject({ sources: [] })
    api.missing(false)
    const consumer = new QueryObserver(cache, sourceDataQueryOptions)
    const result = await consumer.refetch()
    expect(result.data?.sources).toHaveLength(sources.length)
    expect(api.fetch).toHaveBeenCalledTimes(6)
    consumer.destroy()
  })
})
