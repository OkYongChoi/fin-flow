import { afterEach, describe, expect, it, vi } from 'vitest'
import { type BriefDraft } from './briefs'
import { LOCAL_BRIEF_LIMIT, LOCAL_BRIEF_PREFIX, LocalBriefError, readLocalBriefs, removeLocalBrief, saveLocalBrief } from './localBriefs'

class MemoryStorage implements Storage {
  readonly values = new Map<string, string>()
  get length() { return this.values.size }
  key(index: number) { return [...this.values.keys()][index] ?? null }
  getItem(key: string) { return this.values.get(key) ?? null }
  setItem(key: string, value: string) { this.values.set(key, value) }
  removeItem(key: string) { this.values.delete(key) }
  clear() { this.values.clear() }
}
const draft: BriefDraft = { title: 'Learn about payments', notes: 'My own question', networks: ['swift', 'chips-fedwire'], locale: 'en' }
const id = '12345678-1234-1234-1234-123456789012'
const key = LOCAL_BRIEF_PREFIX + id
const record = { id, draft, savedAt: 1_000 }

afterEach(() => vi.restoreAllMocks())

describe('local notebook snapshots', () => {
  it('preserves incomplete drafts and strips cloud ownership from stored and read snapshots', () => {
    const storage = new MemoryStorage()
    const incomplete = { ...draft, title: '', networks: [], locale: 'ko' as const, userId: 'private-owner', revision: 7 }
    const saved = saveLocalBrief(incomplete, storage)
    expect(saved.duplicate).toBe(false)
    expect(saved.brief.draft).toEqual({ title: '', notes: draft.notes, networks: [], locale: 'ko' })
    const stored = JSON.parse(storage.getItem(LOCAL_BRIEF_PREFIX + saved.brief.id)!)
    expect(stored).toEqual(saved.brief)
    expect(JSON.stringify(stored)).not.toContain('private-owner')
    storage.setItem(key, JSON.stringify({ ...record, userId: 'private-owner', revision: 10, draft: { ...draft, cloudId: 'secret-id' } }))
    expect(readLocalBriefs(storage).briefs.find(brief => brief.id === id)).toEqual(record)
  })

  it('deduplicates canonical content without changing saved time or writing another copy', () => {
    const storage = new MemoryStorage()
    vi.spyOn(Date, 'now').mockReturnValue(2_000)
    const first = saveLocalBrief(draft, storage)
    vi.spyOn(Date, 'now').mockReturnValue(3_000)
    const write = vi.spyOn(storage, 'setItem')
    const second = saveLocalBrief({ locale: 'en', networks: [...draft.networks], notes: draft.notes, title: draft.title }, storage)
    expect(second).toEqual({ brief: first.brief, duplicate: true })
    expect(write).not.toHaveBeenCalled()
    const changed = saveLocalBrief({ ...draft, networks: [...draft.networks].reverse() }, storage)
    expect(changed.duplicate).toBe(false)
    expect(readLocalBriefs(storage).briefs.map(brief => brief.savedAt)).toEqual([3_000, 2_000])
  })

  it('reports malformed, oversized, mismatched and invalid-date records without modifying them', () => {
    const storage = new MemoryStorage()
    const invalid = [
      '{bad json', JSON.stringify(null), JSON.stringify({ ...record, savedAt: -1 }),
      JSON.stringify({ ...record, savedAt: 8_640_000_000_000_001 }), JSON.stringify({ ...record, savedAt: '1000' }),
      JSON.stringify({ ...record, savedAt: 1.5 }), JSON.stringify({ ...record, draft: { ...draft, networks: ['unknown'] } }),
      ' '.repeat(65_537), JSON.stringify({ ...record, padding: '한'.repeat(30_000) }),
    ]
    invalid.push(JSON.stringify({ ...record, id: '12345678-1234-1234-1234-999999999999' }))
    storage.setItem('unrelated-account-data', '{not our document')
    for (const raw of invalid) {
      storage.setItem(key, raw)
      const before = [...storage.values]
      expect(readLocalBriefs(storage)).toEqual({ briefs: [], unreadableCount: 1 })
      expect([...storage.values]).toEqual(before)
    }
    storage.setItem(LOCAL_BRIEF_PREFIX + 'bad-id', JSON.stringify({ ...record, id: 'bad-id' }))
    expect(readLocalBriefs(storage).unreadableCount).toBe(2)
  })


  it('can read the maximum supported draft even when JSON escaping expands its notes', () => {
    const storage = new MemoryStorage()
    const maximum: BriefDraft = { ...draft, title: '한'.repeat(120), notes: '\u0000'.repeat(6_000), networks: ['swift', 'visa', 'chips-fedwire', 'usdc'] }
    const saved = saveLocalBrief(maximum, storage)
    expect(readLocalBriefs(storage)).toEqual({ briefs: [saved.brief], unreadableCount: 0 })
  })

  it('rejects invalid draft content before writing anything', () => {
    const storage = new MemoryStorage()
    expect(() => saveLocalBrief({ ...draft, notes: 'x'.repeat(6_001) }, storage)).toThrowError(new LocalBriefError('invalid_draft'))
    expect(() => saveLocalBrief({ ...draft, networks: ['swift', 'swift'] }, storage)).toThrowError(new LocalBriefError('invalid_draft'))
    expect(storage.length).toBe(0)
  })

  it('preserves unreadable records without letting them permanently fill all usable slots', () => {
    const storage = new MemoryStorage()
    for (let index = 0; index < LOCAL_BRIEF_LIMIT; index++) storage.setItem(LOCAL_BRIEF_PREFIX + `broken-${index}`, '{broken')
    const damaged = [...storage.values]
    const first = saveLocalBrief(draft, storage)
    expect(first.duplicate).toBe(false)
    expect(saveLocalBrief(draft, storage)).toEqual({ brief: first.brief, duplicate: true })
    expect(readLocalBriefs(storage)).toEqual({ briefs: [first.brief], unreadableCount: LOCAL_BRIEF_LIMIT })
    for (const [key, value] of damaged) expect(storage.getItem(key)).toBe(value)
  })

  it('re-reads changes from another tab before saving or deciding the limit', () => {
    const storage = new MemoryStorage()
    const first = saveLocalBrief(draft, storage).brief
    for (let index = 1; index < LOCAL_BRIEF_LIMIT; index++) saveLocalBrief({ ...draft, title: `Notebook ${index}` }, storage)
    expect(() => saveLocalBrief({ ...draft, title: 'New idea' }, storage)).toThrowError(new LocalBriefError('full'))
    storage.removeItem(LOCAL_BRIEF_PREFIX + first.id)
    const replacement = saveLocalBrief({ ...draft, title: 'New idea' }, storage)
    expect(replacement.duplicate).toBe(false)
    expect(readLocalBriefs(storage).briefs).toHaveLength(LOCAL_BRIEF_LIMIT)
    expect(readLocalBriefs(storage).briefs.some(brief => brief.id === first.id)).toBe(false)
  })

  it('propagates quota and inaccessible-storage failures without losing previous snapshots', () => {
    const storage = new MemoryStorage()
    saveLocalBrief(draft, storage)
    const before = [...storage.values]
    const quota = new DOMException('Storage full', 'QuotaExceededError')
    vi.spyOn(storage, 'setItem').mockImplementation(() => { throw quota })
    expect(() => saveLocalBrief({ ...draft, title: 'Unwritten' }, storage)).toThrow(quota)
    expect([...storage.values]).toEqual(before)
    const inaccessible = new DOMException('Blocked', 'SecurityError')
    vi.spyOn(storage, 'getItem').mockImplementation(() => { throw inaccessible })
    expect(() => readLocalBriefs(storage)).toThrow(inaccessible)
  })

  it('deletes only a validated notebook key and preserves unrelated drafts', () => {
    const storage = new MemoryStorage()
    storage.setItem(key, JSON.stringify(record))
    storage.setItem('fin-flow:brief-draft:v1', 'working draft')
    storage.setItem('fin-flow:working-draft:v2:user_a', 'account draft')
    expect(() => removeLocalBrief('../working-draft:v2:user_a', storage)).toThrowError(new LocalBriefError('invalid_id'))
    removeLocalBrief(id, storage)
    expect(storage.getItem(key)).toBeNull()
    expect([...storage.values]).toEqual([
      ['fin-flow:brief-draft:v1', 'working draft'], ['fin-flow:working-draft:v2:user_a', 'account draft'],
    ])
  })

  it('does not overwrite an existing copy if a generated ID collides', () => {
    const storage = new MemoryStorage()
    storage.setItem(key, JSON.stringify(record))
    vi.spyOn(crypto, 'randomUUID').mockReturnValue(id)
    expect(() => saveLocalBrief({ ...draft, title: 'Different content' }, storage)).toThrowError(new LocalBriefError('id_conflict'))
    expect(storage.getItem(key)).toBe(JSON.stringify(record))
  })

  it('ignores an entry deleted between key enumeration and reading', () => {
    const storage = new MemoryStorage()
    storage.setItem(key, JSON.stringify(record))
    vi.spyOn(storage, 'getItem').mockImplementation(name => { storage.removeItem(name); return null })
    expect(readLocalBriefs(storage)).toEqual({ briefs: [], unreadableCount: 0 })
  })
})
