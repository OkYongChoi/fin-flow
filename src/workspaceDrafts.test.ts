// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { blankDraft, clearHandoff, freshWorking, loadWorking, parseEditableDraft, pendingHandoff, persistWorking, stageHandoff, templateDraft } from './workspaceDrafts'
import { parseBrief } from './briefs'
beforeEach(() => { localStorage.clear(); sessionStorage.clear() })
afterEach(() => { vi.useRealTimers() })
describe('draft continuity and task starters', () => {
  it('preserves incomplete work across reload without allowing save/export', () => {
    const draft = { ...blankDraft('en'), title: '', networks: [], notes: 'Do not lose these notes' }
    persistWorking(null, freshWorking(draft))
    expect(loadWorking(null, 'ko').draft).toEqual(draft)
    expect(parseBrief(draft)).toBeNull()
    expect(parseEditableDraft({ ...draft, notes: 'x'.repeat(6001) })).toBeNull()
  })
  it('isolates guest/account drafts, retaining cloud version and document language', () => {
    persistWorking(null, freshWorking({ ...blankDraft('ko'), title: 'Guest' }))
    persistWorking('user_a', { draft: { ...blankDraft('en'), title: 'Private A' }, id: 'brief-a', revision: 12, savedFingerprint: 'saved' })
    expect(loadWorking('user_a', 'ko')).toMatchObject({ id: 'brief-a', revision: 12, draft: { title: 'Private A', locale: 'en' } })
    expect(loadWorking('user_b', 'ko').draft.title).not.toBe('Private A')
    expect(loadWorking('user_b', 'ko').draft.title).not.toBe('Guest')
    expect(loadWorking(null, 'ko').draft.title).toBe('Guest')
  })
  it('hands off only explicitly staged work and claims it for the first signed-in account', () => {
    const draft = { ...blankDraft('en'), title: 'Carry this into my account' }
    stageHandoff(draft)
    expect(loadWorking('user_a', 'en').draft).toEqual(draft)
    expect(pendingHandoff('user_b')).toBeNull()
    clearHandoff()
    expect(pendingHandoff('user_a')).toBeNull()
  })
  it('does not replace an existing account draft during sign-in', () => {
    persistWorking('user_a', freshWorking({ ...blankDraft('en'), title: 'Unfinished account work' }))
    stageHandoff({ ...blankDraft('en'), title: 'Guest work' })
    expect(loadWorking('user_a', 'en').draft.title).toBe('Unfinished account work')
    expect(pendingHandoff('user_a')?.title).toBe('Guest work')
  })
  it('expires abandoned handoffs and rejects timestamps from the future', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-22T00:00:00Z'))
    const draft = { ...blankDraft('en'), title: 'Temporary handoff' }
    sessionStorage.setItem('fin-flow:sign-in-draft:v1', JSON.stringify({ draft, at: Date.now() - 3_599_999 }))
    expect(pendingHandoff('user_a')?.title).toBe('Temporary handoff')
    sessionStorage.setItem('fin-flow:sign-in-draft:v1', JSON.stringify({ draft, at: Date.now() - 3_600_000 }))
    expect(pendingHandoff('user_a')).toBeNull()
    sessionStorage.setItem('fin-flow:sign-in-draft:v1', JSON.stringify({ draft, at: Date.now() + 1 }))
    expect(pendingHandoff('user_a')).toBeNull()
  })
  it('sanitizes invalid working metadata and falls back from corrupt storage', () => {
    const draft = { ...blankDraft('ko'), title: 'Recovered draft' }
    sessionStorage.setItem('fin-flow:working-draft:v2:user_a', JSON.stringify({ draft, id: 42, revision: 1.5, savedFingerprint: false }))
    expect(loadWorking('user_a', 'en')).toEqual({ draft, id: null, revision: null, savedFingerprint: null })
    sessionStorage.setItem('fin-flow:working-draft:v2:user_b', '{broken')
    expect(loadWorking('user_b', 'en')).toEqual(freshWorking(blankDraft('en')))
  })
  it('builds localized valid templates using catalog network IDs', () => {
    for (const locale of ['ko', 'en'] as const) for (const id of ['payments', 'issuance', 'lesson']) expect(parseBrief(templateDraft(id, locale))).not.toBeNull()
    expect(templateDraft('unknown', 'en')).toBeNull()
  })
})
