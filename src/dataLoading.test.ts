import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchDataBundle, networkSources } from './data'
import manifest from '../public/data/manifest.json'
import sources from '../public/data/sources.json'
import metrics from '../public/data/metrics.json'
import type { Metric } from './types'

afterEach(() => vi.restoreAllMocks())
describe('partial data and failed payload recovery', () => {
  it('retains structural sources when the network has no metrics', () => {
    expect(networkSources(['swift'], { sources, metrics: [] }).map(source => source.id)).toEqual(['swift-2025'])
    expect(networkSources(['usdc'], { sources, metrics: metrics as Metric[] }).map(source => source.id)).toEqual(['circle-transparency', 'circle-contracts'])
  })
  it.each([null, {}, { sources: [] }])('rejects a non-list response so the page can offer retry: %j', async value => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async url => Response.json(String(url).includes('manifest') ? manifest : String(url).includes('sources') ? sources : value))
    await expect(fetchDataBundle()).rejects.toThrow('Invalid source-data response')
  })
  it('accepts genuinely empty lists and preserves snapshot metadata', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async url => Response.json(String(url).includes('manifest') ? manifest : []))
    await expect(fetchDataBundle()).resolves.toMatchObject({ version: manifest.version, sources: [], metrics: [] })
  })
})
