import { describe, expect, it } from 'vitest'
import { briefMarkdown, briefSources, parseBrief } from './briefs'
import manifest from '../public/data/manifest.json'
import sources from '../public/data/sources.json'
import metrics from '../public/data/metrics.json'
import type { Metric } from './types'
import { NETWORKS } from './data'
import { FLOW_GUIDES } from './flowGuides'
const data = { ...manifest, sources, metrics: [] }
const draft = { title: 'My comparison', notes: '<script>alert(1)</script>', locale: 'en' as const, networks: ['swift', 'chips-fedwire'] as const }
describe('briefing document contract', () => {
  it('gives every selectable network bilingual stages, roles and a nonempty export', () => {
    for (const network of NETWORKS) {
      const guide = FLOW_GUIDES[network.id]
      expect(guide.steps.length).toBeGreaterThan(1)
      expect(guide.roles.length).toBeGreaterThan(0)
      for (const locale of ['ko', 'en'] as const) {
        for (const step of guide.steps) expect(step[locale].trim()).not.toBe('')
        const markdown = briefMarkdown({ title: 'Coverage', notes: '', networks: [network.id], locale }, data)
        expect(markdown).toContain(guide.steps[0][locale])
        expect(markdown.replaceAll('&amp;', '&')).toContain(guide.boundary[locale])
        for (const reference of guide.references ?? []) expect(markdown).toContain(reference.url)
      }
    }
  })
  it('validates locale, network membership, duplicate selections and bounded notes', () => {
    expect(parseBrief(draft)).not.toBeNull()
    for (const change of [{ networks: [] }, { networks: ['nope'] }, { networks: ['swift', 'swift'] }, { locale: 'ja' }, { locale: ['en'] }, { title: ' ' }, { notes: 'x'.repeat(6001) }]) expect(parseBrief({ ...draft, ...change })).toBeNull()
  })
  it('exports only relevant sources with preserved dates and escaped author content', () => {
    const parsed = parseBrief(draft)!
    expect(briefSources(parsed.networks, data).map(s => s.id)).toEqual(['swift-2025', 'chips-2025', 'fedwire-2025'])
    const markdown = briefMarkdown(parsed, data)
    expect(markdown).toContain(manifest.version)
    expect(markdown).toContain(manifest.reviewDueAt)
    expect(markdown).toContain('Alternative rails')
    expect(markdown).toContain('https://')
    expect(markdown).toContain('&lt;script&gt;')
    expect(markdown).not.toContain('<script>')
    expect(markdown).not.toContain('Visa')
  })
})


describe('source-backed briefing export', () => {
  const populated = { ...data, metrics: metrics as Metric[] }
  it('exports a side-by-side comparison and selected metrics with exact evidence', () => {
    const markdown = briefMarkdown({ title: 'Message and settlement', notes: '', locale: 'en', networks: ['swift', 'chips-fedwire'] }, populated)
    expect(markdown).toContain('| Compare | SWIFT | CHIPS · Fedwire |')
    expect(markdown).toContain('| What does it cover? | Interbank messaging network | High-value US dollar payments |')
    expect(markdown).toContain('| Who is involved? |')
    expect(markdown).toContain('| What are the limits? |')
    expect(markdown).toContain('not additive or a ranking')
    expect(markdown).toContain('Selected flows: 2 · Metrics: 5 · Distinct data sources: 3')
    expect(markdown).toContain('| EMEA average daily sent messages | 13.24M | messages/day | 2025 | [SWIFT: Annual Review 2025](https://www.swift.com/swift-resource/252570/download) | 2026-08-02 |')
    expect(markdown).toContain('Snapshot generated: ' + manifest.generatedAt)
    expect(markdown).not.toContain('Payments volume')
    expect(markdown).not.toContain('$14.2T')
  })

  it('uses the document locale for comparisons and metric labels', () => {
    const markdown = briefMarkdown({ title: '메시지 비교', notes: '', locale: 'ko', networks: ['swift'] }, populated)
    expect(markdown).toContain('| 비교 항목 | SWIFT |')
    expect(markdown).toContain('| 무엇을 다루나요? | 은행 간 메시지 네트워크 |')
    expect(markdown).toContain('| 누가 참여하나요? |')
    expect(markdown).toContain('| 어디까지 설명하나요? |')
    expect(markdown).toContain('| EMEA 일평균 발신 메시지 | 13.24M | messages/day | 2025 |')
    expect(markdown).not.toContain('EMEA average daily sent messages')
    expect(markdown).toContain('다음 출처 검토 기한: ' + manifest.reviewDueAt)
  })

  it('distinguishes unavailable metrics from zero and unavailable source records from cited values', () => {
    const draft = { title: 'Incomplete snapshot', notes: '', locale: 'en' as const, networks: ['swift' as const] }
    const missingMetrics = briefMarkdown(draft, data)
    expect(missingMetrics).toContain('| Snapshot metrics | Not available |')
    expect(missingMetrics).toContain('Unavailable metrics do not imply a zero value.')
    expect(missingMetrics).toContain('Annual Review 2025')
    const missingSources = briefMarkdown(draft, { ...populated, sources: [] })
    expect(missingSources).toContain('| 13.24M | messages/day | 2025 | Source record unavailable | Unavailable |')
    expect(missingSources).toContain('No linked data sources in this snapshot.')
  })

  it('escapes table text, author markup and unsafe link destinations', () => {
    const hostile = {
      ...populated,
      sources: sources.map(source => source.id === 'swift-2025' ? { ...source, title: '<img> [evidence] | row', url: 'javascript:alert(1)' } : source),
      metrics: populated.metrics.map(metric => metric.id === 'swift-emea-sent' ? { ...metric, labelEn: 'Metric | extra\nrow', display: '<script>bad</script>', coveragePeriod: '[period](https://example.com)' } : metric),
    }
    const markdown = briefMarkdown({ title: 'Title\n# injected', notes: '<script>alert(1)</script> [run](javascript:alert(1))', locale: 'en', networks: ['swift'] }, hostile)
    expect(markdown).toContain('# Title \\# injected\n')
    expect(markdown).toContain('Metric \\| extra row')
    expect(markdown).toContain('&lt;script&gt;bad&lt;/script&gt;')
    expect(markdown).toContain('\\[period\\](https://example.com)')
    expect(markdown).not.toContain('<script>')
    expect(markdown).toContain('\\[run\\](javascript:alert(1))')
    expect(markdown).not.toContain('[run](javascript:alert(1))')
    expect(markdown).not.toContain('| row](javascript:')
    const punctuationUrl = briefMarkdown({ title: 'URL', notes: '', locale: 'en', networks: ['swift'] }, { ...populated, sources: sources.map(source => ({ ...source, url: 'https://example.com/doc(1)' })) })
    expect(punctuationUrl).toContain('https://example.com/doc%281%29')
  })
})
