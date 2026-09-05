import { describe, expect, it } from 'vitest'
import metrics from '../public/data/metrics.json'
import sources from '../public/data/sources.json'
import { EDGES, isSnapshotReviewOverdue, NETWORKS, NODES } from './data'
import type { NetworkId } from './types'
import { getFlowGuide } from './flowGuides'
import { getProductStructureGuide } from './productStructures'

const guideHasConcept = (networkId: NetworkId, phrase: string): boolean =>
  getFlowGuide(networkId).concepts?.some((concept) => concept.en.toLowerCase().includes(phrase.toLowerCase())) === true

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
    expect(NETWORKS.map((network) => network.id)).toEqual(['swift', 'visa', 'chips-fedwire', 'bond-issuance', 'securities-issuance', 'bond-servicing', 'multi-bond-issuance', 'asset-backed-securitization', 'derivatives', 'leveraged-derivatives-issuance', 'credit-derivatives', 'listed-derivatives', 'fx-pvp', 'repo-financing', 'triparty-collateral', 'etf-primary-market', 'securities-lending', 'syndicated-loans', 'usdc'])
  })

  it('keeps bond issuance and OTC derivatives guidance distinct from generic payment stages', () => {
    expect(getFlowGuide('bond-issuance').boundary.en).toContain('Primary issuance')
    expect(getFlowGuide('derivatives').boundary.en).toContain('Bilateral OTC')
  })
  it('keeps multi-bond issuance guidance distinct from single-issue and secondary-market execution', () => {
    expect(getFlowGuide('multi-bond-issuance').boundary.en).toContain('reproduce')
    expect(getFlowGuide('multi-bond-issuance').roles[0].en).toContain('Issuer')
    expect(guideHasConcept('multi-bond-issuance', 'program')).toBe(true)
  })

  it('keeps leveraged derivative issuance scoped as structure, not live hedging or guaranteed return', () => {
    expect(getFlowGuide('leveraged-derivatives-issuance').boundary.en).toContain('explanatory schematic')
    expect(guideHasConcept('leveraged-derivatives-issuance', 'leverage level')).toBe(true)
  })

  it('keeps the issuer role separate from downstream allocation and settlement ledgers', () => {
    expect(guideHasConcept('bond-issuance', 'does not operate every allocation')).toBe(true)
  })

  it('scopes lead-manager guidance to coordination rather than investor-level trades', () => {
    expect(guideHasConcept('bond-issuance', 'does not display investor-level trades')).toBe(true)
  })

  it('separates depository infrastructure from the cash settlement leg of DvP', () => {
    expect(guideHasConcept('bond-issuance', 'cash-settlement leg of DvP')).toBe(true)
  })

  it('does not treat offering allocation as secondary-market trading', () => {
    expect(guideHasConcept('bond-issuance', 'secondary-market price discovery')).toBe(true)
  })

  it('keeps OTC counterparties distinct from CCP interposition', () => {
    expect(guideHasConcept('derivatives', 'CCP can interpose')).toBe(true)
  })

  it('does not conflate trade confirmation with valuation, margin, or cash movement', () => {
    expect(guideHasConcept('derivatives', 'does not itself mean valuation')).toBe(true)
  })

  it('does not treat mark-to-market valuation as a cash settlement event', () => {
    expect(guideHasConcept('derivatives', 'not the same payment event')).toBe(true)
  })

  it('keeps bilateral collateral management separate from a CCP-cleared path', () => {
    expect(guideHasConcept('derivatives', 'does not automatically become a CCP-cleared path')).toBe(true)
  })

  it('limits CCP interposition to eligible cleared trades', () => {
    expect(guideHasConcept('derivatives', 'not every OTC contract is automatically cleared')).toBe(true)
  })

  it('distinguishes initial margin from variation margin', () => {
    expect(guideHasConcept('derivatives', 'potential future exposure')).toBe(true)
  })

  it('keeps variation margin distinct from notional and final settlement', () => {
    expect(guideHasConcept('derivatives', 'not the contract notional')).toBe(true)
  })

  it('does not collapse margin-call steps into one instant settlement event', () => {
    expect(guideHasConcept('derivatives', 'not assumed to be one instant settlement event')).toBe(true)
  })

  it('limits novation to the cleared-trade context', () => {
    expect(guideHasConcept('derivatives', 'does not mean every bilateral OTC contract is automatically transferred')).toBe(true)
  })

  it('keeps cleared-trade default management separate from ordinary settlement', () => {
    expect(guideHasConcept('derivatives', 'not an ordinary maturity settlement step')).toBe(true)
  })

  it('does not infer the derivative settlement method from notional', () => {
    expect(guideHasConcept('derivatives', 'cannot be inferred from notional alone')).toBe(true)
  })

  it('distinguishes derivative notional from market value and exposure', () => {
    expect(guideHasConcept('derivatives', 'not the same as market value or credit exposure')).toBe(true)
  })

  it('keeps collateral movement separate from settlement-asset delivery', () => {
    expect(guideHasConcept('derivatives', 'not interchangeable with delivery of a settlement asset')).toBe(true)
  })

  it('keeps the FX PvP route available as a distinct, source-backed guide', () => {
    const guide = getFlowGuide('fx-pvp')
    expect(NETWORKS.some((network) => network.id === 'fx-pvp')).toBe(true)
    expect(guide.boundary.en).toContain('CLS service scope')
    expect(guide.steps.map((step) => step.en)).toContain('Settle payment versus payment')
  })

  it('keeps adjacent institutional routes separate from trading, price, and position claims', () => {
    expect(getFlowGuide('repo-financing').boundary.en).toContain('not an outright sale')
    expect(getFlowGuide('etf-primary-market').boundary.en).toContain('different flows')
    expect(getFlowGuide('securities-lending').boundary.en).toContain('term return obligation')
    expect(getFlowGuide('syndicated-loans').boundary.en).toContain('secondary loan trading are separate')
  })
  it('explains leveraged ETF construction without implying a simple doubled basket', () => {
    const guide = getProductStructureGuide('etf-primary-market')
    const leveraged = guide?.products.find((product) => product.id === 'leveraged-etf')
    const inverse = guide?.products.find((product) => product.id === 'inverse-etf')

    expect(guide?.sourceIds).toContain('sec-leveraged-inverse-etfs')
    expect(leveraged?.portfolio.en).toContain('swaps, futures, other derivatives')
    expect(leveraged?.portfolio.en).toContain('not limited to holding twice')
    expect(leveraged?.rebalance.en).toContain('each trading day')
    expect(inverse?.holdingPeriod.en).toContain('daily compounding')
  })

  it('only exposes product-construction guidance for supported networks', () => {
    expect(getProductStructureGuide('swift')).toBeUndefined()
  })

  it('marks a source snapshot overdue only after the review deadline', () => {
    expect(isSnapshotReviewOverdue('2026-09-05', new Date('2026-09-05T23:59:59.999Z'))).toBe(false)
    expect(isSnapshotReviewOverdue('2026-09-05', new Date('2026-09-06T00:00:00.000Z'))).toBe(true)
  })

  it('keeps tri-party collateral control separate from generic repo and securities-lending claims', () => {
    const guide = getFlowGuide('triparty-collateral')
    expect(NETWORKS.some((network) => network.id === 'triparty-collateral')).toBe(true)
    expect(guide.boundary.en).toContain('does not claim coverage for every tri-party repo market')
    expect(guideHasConcept('triparty-collateral', 'not a CCP guarantee')).toBe(true)
    expect(guideHasConcept('triparty-collateral', 'not an automatic right')).toBe(true)
  })
})
