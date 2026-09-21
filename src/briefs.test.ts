import { describe, expect, it } from 'vitest'
import { briefMarkdown, briefSources, parseBrief } from './briefs'
import manifest from '../public/data/manifest.json'
import sources from '../public/data/sources.json'
const data = { ...manifest, sources, metrics: [] }
const draft = { title: 'My comparison', notes: '<script>alert(1)</script>', locale: 'en' as const, networks: ['swift', 'chips-fedwire'] as const }
describe('briefing document contract', () => {
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
