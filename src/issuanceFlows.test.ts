import { describe, expect, it } from 'vitest'
import { getIssuanceCategory, ISSUANCE_CATEGORIES, ISSUANCE_FLOWS } from './issuanceFlows'

describe('issuance flow taxonomy', () => {
  it('classifies every discoverable flow into a visible category', () => {
    const classified = ISSUANCE_FLOWS.map((flow) => [flow.id, getIssuanceCategory(flow.id)] as const)
    expect(new Set(classified.map(([id]) => id)).size).toBe(classified.length)
    expect(new Set(classified.map(([, category]) => category))).toEqual(new Set(ISSUANCE_CATEGORIES.map((item) => item.id)))
  })

  it('keeps the taxonomy exhaustive instead of silently accepting unknown flows', () => {
    expect(() => getIssuanceCategory('unclassified-flow')).toThrow('Missing issuance category')
  })
})
