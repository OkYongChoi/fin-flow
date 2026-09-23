import { describe, expect, it } from 'vitest'
import { NETWORKS } from './data'
import { FINANCE_GLOSSARY, findFinanceTerms } from './financeGlossary'

describe('beginner glossary discovery', () => {
  it('finds Korean, English and acronym queries without depending on the interface language', () => {
    expect(findFinanceTerms('청산').map(term => term.id)).toContain('clearing')
    expect(findFinanceTerms('  CLEARING  ').map(term => term.id)).toContain('clearing')
    expect(findFinanceTerms('ＲＴＧＳ').map(term => term.id)).toEqual(['rtgs'])
    expect(findFinanceTerms('해외 송금').map(term => term.id)).toEqual(['payment-message'])
    expect(findFinanceTerms('bank transfer').map(term => term.id)).toEqual(['payment-message'])
    expect(findFinanceTerms('IPO').map(term => term.id)).toEqual(['primary-market'])
    expect(findFinanceTerms('not-a-financial-term')).toEqual([])
    expect(findFinanceTerms('   ')).toHaveLength(FINANCE_GLOSSARY.length)
  })

  it('keeps every direct-link target unique, bilingual and connected to a real flow and reviewed source', () => {
    expect(new Set(FINANCE_GLOSSARY.map(term => term.id)).size).toBe(FINANCE_GLOSSARY.length)
    for (const term of FINANCE_GLOSSARY) {
      expect(term.id).toMatch(/^[a-z]+(?:-[a-z]+)*$/)
      for (const locale of ['ko', 'en'] as const) {
        expect(term.label[locale].trim()).not.toBe('')
        expect(term.definition[locale].trim()).not.toBe('')
        expect(term.distinction[locale].trim()).not.toBe('')
      }
      expect(term.networks.length).toBeGreaterThan(0)
      for (const network of term.networks) expect(NETWORKS.some(item => item.id === network)).toBe(true)
      expect(new URL(term.source.url).protocol).toBe('https:')
      expect(term.source.reviewedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(Number.isNaN(Date.parse(term.source.reviewedAt))).toBe(false)
    }
  })
})
