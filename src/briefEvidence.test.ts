import { describe, expect, it } from 'vitest'
import { buildBriefEvidence } from './briefEvidence'
import { FLOW_GUIDES } from './flowGuides'
import manifest from '../public/data/manifest.json'
import sources from '../public/data/sources.json'
import metrics from '../public/data/metrics.json'
import type { DataBundle, Metric } from './types'

const data: DataBundle = { ...manifest, sources, metrics: metrics as Metric[] }

describe('briefing evidence', () => {
  it('keeps only selected-network metrics with their original units, periods and source records', () => {
    const evidence = buildBriefEvidence(['chips-fedwire', 'swift'], data)
    expect(evidence.networks.map(network => network.id)).toEqual(['chips-fedwire', 'swift'])
    expect(evidence.metricCount).toBe(5)
    expect(evidence.sourceCount).toBe(3)
    expect(evidence.networks.flatMap(network => network.metrics).map(metric => metric.networkId)).not.toContain('visa')
    const swift = evidence.networks[1]
    const metric = swift.metrics[0]
    expect(metric).toMatchObject(data.metrics.find(metric => metric.id === 'swift-emea-sent')!)
    expect(metric.source).toEqual(data.sources.find(source => source.id === 'swift-2025'))
    expect(swift.scope).toEqual({ ko: '은행 간 메시지 네트워크', en: 'Interbank messaging network' })
    expect(swift.steps).toEqual(FLOW_GUIDES.swift.steps)
    expect(swift.boundary).toEqual(FLOW_GUIDES.swift.boundary)
  })

  it('retains structural sources when metrics are unavailable without inventing values', () => {
    const evidence = buildBriefEvidence(['swift'], { ...data, metrics: [] })
    expect(evidence.networks[0].metrics).toEqual([])
    expect(evidence.networksWithoutMetrics).toEqual(['swift'])
    expect(evidence.sources.map(source => source.id)).toEqual(['swift-2025'])
    expect(evidence.metricCount).toBe(0)
    expect(evidence.sourceCount).toBe(1)
  })

  it('exposes a missing source instead of attributing a metric to a different source', () => {
    const evidence = buildBriefEvidence(['swift'], { ...data, sources: [] })
    expect(evidence.networks[0].metrics).toHaveLength(2)
    expect(evidence.networks[0].metrics.every(metric => metric.source === null)).toBe(true)
    expect(evidence.networks[0].metrics[0].display).toBe('13.24M')
    expect(evidence.networksWithoutMetrics).toEqual([])
    expect(evidence.oldestRetrievedAt).toBeNull()
    expect(evidence.newestRetrievedAt).toBeNull()
  })

  it('deduplicates selections and shared source records while retaining per-network provenance', () => {
    const evidence = buildBriefEvidence(['bond-issuance', 'multi-bond-issuance', 'bond-issuance'], data)
    expect(evidence.networks).toHaveLength(2)
    expect(evidence.metricCount).toBe(2)
    expect(evidence.sourceCount).toBe(2)
    expect(evidence.networks[0].sources.map(source => source.id)).toContain('dtcc-underwriting')
    expect(evidence.networks[1].sources.map(source => source.id)).toEqual(['dtcc-underwriting'])
    const withReferences = buildBriefEvidence(['swift', 'swift', 'visa'], data)
    expect(withReferences.referenceCount).toBe(2)
    expect(new Set(withReferences.references.map(reference => reference.url)).size).toBe(2)
  })

  it('reports retrieval dates only from selected sources and preserves missing dates', () => {
    const evidence = buildBriefEvidence(['swift', 'bond-issuance'], data)
    expect(evidence.oldestRetrievedAt).toBe('2026-08-02')
    expect(evidence.newestRetrievedAt).toBe('2026-08-10')
    expect(evidence.networks[0].newestRetrievedAt).toBe('2026-08-02')
    const withoutDates = buildBriefEvidence(['swift'], { ...data, sources: data.sources.map(source => ({ ...source, retrievedAt: '' })) })
    expect(withoutDates.oldestRetrievedAt).toBeNull()
    expect(withoutDates.newestRetrievedAt).toBeNull()
  })
})
