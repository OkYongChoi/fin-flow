import { describe, expect, it } from 'vitest'
import { EDGES, filterEdges, isSnapshotReviewOverdue, metricMatchesPeriod, NETWORKS, NODES } from './data'
import type { Metric } from './types'

describe('financial flow contract', () => {
  it('keeps every edge linked to valid nodes and a source', () => {
    const nodeIds = new Set(NODES.map((node) => node.id))
    for (const edge of EDGES) {
      expect(nodeIds.has(edge.source)).toBe(true)
      expect(nodeIds.has(edge.target)).toBe(true)
      expect(edge.sourceIds.length).toBeGreaterThan(0)
    }
  })

  it('labels all rendered routes as schematic rather than observed transactions', () => {
    expect(EDGES.every((edge) => edge.representation === 'schematic')).toBe(true)
  })

  it('models CHIPS and Fedwire as alternative rails, not sequential map edges', () => {
    const dollarEdges = EDGES.filter((edge) => edge.networkId === 'chips-fedwire')
    expect(dollarEdges.every((edge) => edge.semantic === 'settlement')).toBe(true)
    expect(dollarEdges.some((edge) => edge.source.includes('chips') || edge.target.includes('fedwire'))).toBe(false)
  })

  it('covers the five requested network families', () => {
    expect(NETWORKS.map((network) => network.id)).toEqual(['swift', 'visa', 'chips-fedwire', 'derivatives', 'usdc'])
  })

  it('applies currency, institution and region lenses to schematic routes', () => {
    expect(filterEdges(EDGES, { period: 'all', currency: 'token', institution: 'all', region: 'all' }).every((edge) => edge.networkId === 'usdc')).toBe(true)
    expect(filterEdges(EDGES, { period: 'all', currency: 'all', institution: 'issuer-chain', region: 'all' }).every((edge) => edge.networkId === 'usdc')).toBe(true)
    expect(filterEdges(EDGES, { period: 'all', currency: 'all', institution: 'all', region: 'americas' }).every((edge) => ['new-york', 'sao-paulo'].includes(edge.source) || ['new-york', 'sao-paulo'].includes(edge.target))).toBe(true)
  })

  it('matches metrics to a selected coverage year without inventing dates', () => {
    const metric = { coveragePeriod: '2026-07-27' } as Metric
    expect(metricMatchesPeriod(metric, '2026')).toBe(true)
    expect(metricMatchesPeriod(metric, '2025')).toBe(false)
    expect(metricMatchesPeriod(metric, 'all')).toBe(true)
  })

  it('marks source snapshots overdue only after their review deadline', () => {
    expect(isSnapshotReviewOverdue('2026-08-16', new Date('2026-08-16T23:59:59.999Z'))).toBe(false)
    expect(isSnapshotReviewOverdue('2026-08-16', new Date('2026-08-17T00:00:00Z'))).toBe(true)
  })
})
