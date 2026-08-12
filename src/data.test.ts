import { describe, expect, it } from 'vitest'
import metrics from '../public/data/metrics.json'
import sources from '../public/data/sources.json'
import { EDGES, NETWORKS, NODES } from './data'
import { getFlowGuide } from './flowGuides'

describe('financial flow contract', () => {
  it('keeps node coordinates unique for unambiguous map markers', () => {
    const coordinates = NODES.map((node) => node.coordinates.join(','))
    expect(new Set(coordinates).size).toBe(coordinates.length)
  })

  it('keeps every edge linked to valid nodes and a source', () => {
    const nodeIds = new Set(NODES.map((node) => node.id))
    for (const edge of EDGES) {
      expect(nodeIds.has(edge.source)).toBe(true)
      expect(nodeIds.has(edge.target)).toBe(true)
      expect(edge.sourceIds.length).toBeGreaterThan(0)
    }
  })

  it('keeps every registry source connected to a metric or route', () => {
    const usedIds = new Set([...metrics.map((metric) => metric.sourceId), ...EDGES.flatMap((edge) => edge.sourceIds)])
    expect(sources.every((source) => usedIds.has(source.id))).toBe(true)
  })

  it('links every rendered route to a registered source', () => {
    const sourceIds = new Set(sources.map((source) => source.id))
    expect(EDGES.every((edge) => edge.sourceIds.every((sourceId) => sourceIds.has(sourceId)))).toBe(true)
  })

  it('labels all rendered routes as schematic rather than observed transactions', () => {
    expect(EDGES.every((edge) => edge.representation === 'schematic')).toBe(true)
  })

  it('models CHIPS and Fedwire as alternative rails, not sequential map edges', () => {
    const dollarEdges = EDGES.filter((edge) => edge.networkId === 'chips-fedwire')
    expect(dollarEdges.every((edge) => edge.semantic === 'settlement')).toBe(true)
    expect(dollarEdges.some((edge) => edge.source.includes('chips') || edge.target.includes('fedwire'))).toBe(false)
  })

  it('gives every network at least one source-backed metric', () => {
    expect(NETWORKS.every((network) => metrics.some((metric) => metric.networkId === network.id))).toBe(true)
  })

  it('gives every network a schematic edge', () => {
    expect(NETWORKS.every((network) => EDGES.some((edge) => edge.networkId === network.id))).toBe(true)
  })

  it('covers the requested network families including primary-market bonds', () => {
    expect(NETWORKS.map((network) => network.id)).toEqual(['swift', 'visa', 'chips-fedwire', 'bond-issuance', 'derivatives', 'usdc'])
  })

  it('keeps bond issuance and OTC derivatives guidance distinct from generic payment stages', () => {
    expect(getFlowGuide('bond-issuance').boundary.en).toContain('Primary issuance')
    expect(getFlowGuide('derivatives').boundary.en).toContain('Bilateral OTC')
  })

  it('keeps the issuer role separate from downstream allocation and settlement ledgers', () => {
    expect(getFlowGuide('bond-issuance').concepts?.some((concept) => concept.en.includes('does not operate every allocation'))).toBe(true)
  })
})
