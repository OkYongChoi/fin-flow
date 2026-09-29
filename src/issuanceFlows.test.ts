import { describe, expect, it } from 'vitest'
import { ISSUANCE_FLOW_COUNT } from './issuanceCatalog'
import { getIssuanceCategory, ISSUANCE_CATEGORIES, ISSUANCE_FLOWS } from './issuanceFlows'

describe('issuance flow taxonomy', () => {
  it('classifies every discoverable flow into a visible category', () => {
    const classified = ISSUANCE_FLOWS.map((flow) => [flow.id, getIssuanceCategory(flow.id)] as const)
    expect(new Set(classified.map(([id]) => id)).size).toBe(classified.length)
    expect(ISSUANCE_FLOW_COUNT).toBe(classified.length)
    expect(new Set(classified.map(([, category]) => category))).toEqual(new Set(ISSUANCE_CATEGORIES.map((item) => item.id)))
  })

  it('keeps the taxonomy exhaustive instead of silently accepting unknown flows', () => {
    expect(() => getIssuanceCategory('unclassified-flow')).toThrow('Missing issuance category')
  })

  it('keeps flow ids unique and kebab-case', () => {
    const ids = ISSUANCE_FLOWS.map((flow) => flow.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids.every((id) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(id))).toBe(true)
  })

  it('provides non-empty bilingual copy and unique step labels used as React keys', () => {
    for (const flow of ISSUANCE_FLOWS) {
      for (const locale of ['ko', 'en'] as const) {
        expect(flow.label[locale].trim(), `${flow.id} label.${locale}`).not.toBe('')
        expect(flow.summary[locale].trim(), `${flow.id} summary.${locale}`).not.toBe('')
        expect(flow.boundary[locale].trim(), `${flow.id} boundary.${locale}`).not.toBe('')
      }
      expect(flow.steps.length, `${flow.id} steps`).toBeGreaterThan(1)
      const stepKeys = flow.steps.map((step) => step.en)
      expect(new Set(stepKeys).size, `${flow.id} duplicate step labels`).toBe(stepKeys.length)
      expect(flow.steps.every((step) => step.ko.trim() && step.en.trim()), `${flow.id} empty step`).toBe(true)
    }
  })

  it('links every flow to an https primary source', () => {
    for (const flow of ISSUANCE_FLOWS) {
      expect(() => new URL(flow.source.url), `${flow.id} source url`).not.toThrow()
      expect(new URL(flow.source.url).protocol, `${flow.id} source protocol`).toBe('https:')
      expect(flow.source.provider.trim(), `${flow.id} provider`).not.toBe('')
      expect(flow.source.title.trim(), `${flow.id} source title`).not.toBe('')
    }
  })
})
