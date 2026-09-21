// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { blankDraft, clearHandoff, freshWorking, loadWorking, parseEditableDraft, pendingHandoff, persistWorking, stageHandoff, templateDraft } from './workspaceDrafts'
import { parseBrief } from './briefs'
beforeEach(() => { localStorage.clear(); sessionStorage.clear() })
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
  it('builds localized valid templates using catalog network IDs', () => {
    for (const locale of ['ko', 'en'] as const) for (const id of ['payments', 'issuance', 'lesson']) expect(parseBrief(templateDraft(id, locale))).not.toBeNull()
    expect(templateDraft('unknown', 'en')).toBeNull()
  })
})
