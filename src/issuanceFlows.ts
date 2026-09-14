import type { Locale } from './types'

export interface IssuanceFlow {
  id: string
  label: Record<Locale, string>
  summary: Record<Locale, string>
  steps: Array<Record<Locale, string>>
  boundary: Record<Locale, string>
  source: { provider: string; title: string; url: string }
}

export type IssuanceCategory = 'treasury' | 'equity' | 'corporate-debt' | 'municipal' | 'structured-finance' | 'funds'

export const ISSUANCE_CATEGORIES: Array<{ id: IssuanceCategory; label: Record<Locale, string> }> = [
  { id: 'treasury', label: { ko: '미국 국채', en: 'U.S. Treasury' } },
  { id: 'equity', label: { ko: '주식·예탁증서', en: 'Equity & depositary receipts' } },
  { id: 'corporate-debt', label: { ko: '회사채', en: 'Corporate debt' } },
  { id: 'municipal', label: { ko: '지방채', en: 'Municipal securities' } },
  { id: 'structured-finance', label: { ko: '구조화 금융', en: 'Structured finance' } },
  { id: 'funds', label: { ko: '펀드·리츠', en: 'Funds & REITs' } },
]

const FLOW_IDS_BY_CATEGORY: Record<IssuanceCategory, readonly string[]> = {
  treasury: ['us-cash-management-bills', 'us-frns', 'us-savings-bonds', 'us-tips', 'us-treasury-bills', 'us-treasury-bonds', 'us-treasury-marketable-auction', 'us-treasury-notes', 'us-treasury-reopening'],
  equity: ['adr-depository-issuance', 'us-direct-registration-offering', 'us-equity-follow-on', 'us-equity-ipo', 'us-preferred-stock', 'us-rights-offering'],
  'corporate-debt': ['us-convertible-notes', 'us-high-yield-bonds', 'us-investment-grade-bonds'],
  municipal: ['us-municipal-bonds', 'us-municipal-private-placement'],
  'structured-finance': ['abs', 'agency-mbs', 'clo', 'cmbs', 'ginnie-mae-mbs'],
  funds: ['closed-end-fund-ipo', 'etf-creation', 'mutual-fund-shares', 'reit-ipo'],
}

const CATEGORY_BY_FLOW_ID = new Map<string, IssuanceCategory>(
  Object.entries(FLOW_IDS_BY_CATEGORY).flatMap(([category, ids]) => ids.map((id) => [id, category as IssuanceCategory])),
)

export function getIssuanceCategory(flowId: string): IssuanceCategory {
  const category = CATEGORY_BY_FLOW_ID.get(flowId)
  if (!category) throw new Error(`Missing issuance category for ${flowId}`)
  return category
}

export function getIssuanceCategoryLabel(category: IssuanceCategory, locale: Locale) {
  return ISSUANCE_CATEGORIES.find((item) => item.id === category)!.label[locale]
}

const modules = import.meta.glob<{ flow: IssuanceFlow }>('./issuance-flows/*.ts', { eager: true })

export const ISSUANCE_FLOWS = Object.values(modules).map(({ flow }) => flow).sort((left, right) => left.label.en.localeCompare(right.label.en))
