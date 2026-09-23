import { describe, expect, it } from 'vitest'
import { BRIEF_FILE_FORMAT, BRIEF_FILE_VERSION, BriefFileError, MAX_BRIEF_FILE_BYTES, briefBackupFilename, briefBackupJson, parseBriefBackup } from './briefFiles'
import { blankDraft } from './workspaceDrafts'

const draft = { ...blankDraft('ko'), title: '결제 비교', notes: '메시지와 결제 구분\nCheck: <script> & **literal notes**' }
const envelope = (value: unknown = draft, changes: Record<string, unknown> = {}) => JSON.stringify({ format: BRIEF_FILE_FORMAT, version: BRIEF_FILE_VERSION, draft: value, ...changes })

describe('portable editable briefing backups', () => {
  it('round-trips Unicode and literal notes without cloud identity or access metadata', () => {
    const enriched = { ...draft, id: 'private-id', owner: 'user-a', revision: 20, entitlement: 'pro' }
    const serialized = briefBackupJson(enriched)
    expect(JSON.parse(serialized)).toEqual({ format: BRIEF_FILE_FORMAT, version: BRIEF_FILE_VERSION, draft })
    expect(parseBriefBackup(serialized)).toEqual(draft)
    expect(parseBriefBackup(envelope(enriched, { userId: 'user-a', revision: 20, pro: true }))).toEqual(draft)
  })

  it('preserves an incomplete title and empty network selection for further editing', () => {
    const incomplete = { ...draft, title: ' ', networks: [], notes: 'Still researching' }
    expect(parseBriefBackup(briefBackupJson(incomplete))).toEqual(incomplete)
  })

  it('rejects malformed JSON, foreign formats and unsupported versions', () => {
    expect(() => parseBriefBackup('{broken')).toThrowError(new BriefFileError('malformed'))
    for (const contents of ['null', '[]', JSON.stringify(draft), envelope(draft, { format: 'other-app' })]) {
      expect(() => parseBriefBackup(contents)).toThrowError(new BriefFileError('foreign_format'))
    }
    for (const version of [undefined, 0, 2, '1']) {
      expect(() => parseBriefBackup(envelope(draft, { version }))).toThrowError(new BriefFileError('unsupported_version'))
    }
  })

  it('rejects invalid drafts before returning any editable content', () => {
    for (const value of [null, {}, { ...draft, networks: ['unknown'] }, { ...draft, networks: ['swift', 'swift'] }, { ...draft, networks: ['swift', 'visa', 'usdc', 'derivatives', 'fx-pvp'] }, { ...draft, locale: 'ja' }, { ...draft, title: 'x'.repeat(121) }, { ...draft, notes: 'x'.repeat(6001) }, { ...draft, notes: null }]) {
      expect(() => parseBriefBackup(envelope(value))).toThrowError(new BriefFileError('invalid_draft'))
    }
  })

  it('enforces the byte limit before parsing, including multi-byte content', () => {
    const allowed = envelope()
    expect(parseBriefBackup(allowed + ' '.repeat(MAX_BRIEF_FILE_BYTES - new TextEncoder().encode(allowed).byteLength))).toEqual(draft)
    expect(() => parseBriefBackup(' '.repeat(MAX_BRIEF_FILE_BYTES + 1))).toThrowError(new BriefFileError('too_large'))
    const multiByte = envelope(draft, { extra: '한'.repeat(35000) })
    expect(multiByte.length).toBeLessThan(MAX_BRIEF_FILE_BYTES)
    expect(() => parseBriefBackup(multiByte)).toThrowError(new BriefFileError('too_large'))
  })

  it('creates a bounded JSON filename and a usable filename for an untitled draft', () => {
    expect(briefBackupFilename('')).toBe('brief.fin-flow.json')
    expect(briefBackupFilename('Payments / 온보딩')).toBe('Payments___온보딩.fin-flow.json')
    expect(briefBackupFilename('x'.repeat(120))).toBe(`${'x'.repeat(80)}.fin-flow.json`)
  })
})
