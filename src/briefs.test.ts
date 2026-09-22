import { describe, expect, it } from 'vitest'
import { briefMarkdown, briefSources, parseBrief } from './briefs'
import manifest from '../public/data/manifest.json'
import sources from '../public/data/sources.json'
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
    for (const change of [{ networks: [] }, { networks: ['nope'] }, { networks: ['swift', 'swift'] }, { locale: 'ja' }, { title: ' ' }, { notes: 'x'.repeat(6001) }]) expect(parseBrief({ ...draft, ...change })).toBeNull()
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
