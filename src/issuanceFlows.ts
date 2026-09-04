import type { Locale } from './types'

export interface IssuanceFlow {
  id: string
  label: Record<Locale, string>
  summary: Record<Locale, string>
  steps: Array<Record<Locale, string>>
  boundary: Record<Locale, string>
  source: { provider: string; title: string; url: string }
}

const modules = import.meta.glob<{ flow: IssuanceFlow }>('./issuance-flows/*.ts', { eager: true })

export const ISSUANCE_FLOWS = Object.values(modules).map(({ flow }) => flow).sort((left, right) => left.label.en.localeCompare(right.label.en))
