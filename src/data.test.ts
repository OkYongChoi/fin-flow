import { describe, expect, it } from 'vitest'
import { EDGES, NETWORKS, NODES } from './data'

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
})
