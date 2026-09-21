// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Workspace, type Session } from './WorkspacePage'
import { blankDraft, freshWorking, loadWorking, persistWorking, stageHandoff } from '../workspaceDrafts'
import type { SavedBrief } from '../briefs'
import manifest from '../../public/data/manifest.json'
import sources from '../../public/data/sources.json'

vi.mock('../App', () => ({ AppHeader: () => null }))
vi.mock('../data', async original => ({ ...await original<typeof import('../data')>(), fetchDataBundle: async () => ({ ...manifest, sources, metrics: [] }) }))
const session: Session = { userId: 'user_a', ready: true, getToken: async () => 'signed-test-token' }
const stored: SavedBrief = { id: 'brief-a', draft: { ...blankDraft('en'), title: 'Saved payments', notes: 'Original note' }, updatedAt: 100, markdown: '# Original snapshot', snapshotVersion: '2026.09.05' }
function mockApi(write?: (body: RequestInit, path: string) => Promise<Response>) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (path, init) => {
    if (String(path) === '/api/account') return Response.json({ userId: 'user_a', pro: true, hasSubscription: true, checkout: false })
    if (String(path) === '/api/briefs') return Response.json({ briefs: [stored] })
    if (init?.method === 'PUT' && write) return write(init, String(path))
    return Response.json({ error: 'not_found' }, { status: 404 })
  })
}
beforeEach(() => {
  localStorage.clear(); sessionStorage.clear(); window.history.replaceState({}, '', '/en/workspace')
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
  HTMLElement.prototype.scrollIntoView = vi.fn()
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', '') }
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open') }
})
afterEach(() => { cleanup(); vi.restoreAllMocks() })

describe('account onboarding and repeat-work UX', () => {
  it('recovers an explicitly transferred guest draft after sign-in', async () => {
    stageHandoff({ ...blankDraft('en'), title: 'Before sign-in', notes: 'Keep my research' })
    mockApi()
    render(<Workspace locale="en" session={session} />)
    expect(screen.getByLabelText('Brief title')).toHaveValue('Before sign-in')
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save to account' })).toBeEnabled())
    expect(loadWorking('user_a', 'en').draft.notes).toBe('Keep my research')
    expect(loadWorking('user_b', 'en').draft.notes).toBe('')
  })
  it('filters saved work and opens a reusable copy without changing its source ID', async () => {
    mockApi()
    render(<Workspace locale="en" session={session} />)
    const search = await screen.findByRole('searchbox', { name: 'Search saved briefs' })
    await screen.findByRole('button', { name: /^Saved payments/ })
    fireEvent.change(search, { target: { value: 'does not match' } })
    expect(screen.getByText('No matching briefs.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }))
    fireEvent.click(screen.getByRole('button', { name: 'Duplicate Saved payments' }))
    await waitFor(() => expect(screen.getByLabelText('Brief title')).toHaveValue('Saved payments (copy)'))
    expect(loadWorking('user_a', 'en').id).toBeNull()
  })
  it('preserves in-flight edits and marks only the submitted version as saved', async () => {
    let finish!: (response: Response) => void
    const mock = mockApi(() => new Promise(resolve => { finish = resolve }))
    render(<Workspace locale="en" session={session} />)
    const save = await screen.findByRole('button', { name: 'Save to account' })
    await waitFor(() => expect(save).toBeEnabled())
    fireEvent.change(screen.getByLabelText('Your perspective and questions'), { target: { value: 'Submitted note' } })
    fireEvent.click(save)
    await waitFor(() => expect(finish).toBeTypeOf('function'))
    fireEvent.change(screen.getByLabelText('Your perspective and questions'), { target: { value: 'Typed while saving' } })
    const put = mock.mock.calls.find(([, init]) => init?.method === 'PUT')!
    expect(put[1]?.headers).toMatchObject({ 'X-Expected-User': 'user_a' })
    const submitted = JSON.parse(String(put[1]?.body))
    await act(async () => finish(Response.json({ brief: { ...stored, draft: submitted, updatedAt: 101 } })))
    expect(screen.getByLabelText('Your perspective and questions')).toHaveValue('Typed while saving')
    expect(screen.getByText('Changes not yet saved to your account')).toBeInTheDocument()
  })
  it('keeps the draft and offers a separate copy when cloud versions conflict', async () => {
    persistWorking('user_a', { ...freshWorking(stored.draft), id: stored.id, revision: 100 })
    const writes: { init: RequestInit; path: string }[] = []
    mockApi(async (init, path) => {
      writes.push({ init, path })
      if (writes.length === 1) return Response.json({ error: 'brief_version_conflict' }, { status: 409 })
      return Response.json({ brief: { ...stored, id: path.split('/').pop()!, draft: JSON.parse(String(init.body)), updatedAt: 101 } })
    })
    render(<Workspace locale="en" session={session} />)
    const save = await screen.findByRole('button', { name: 'Save to account' })
    await waitFor(() => expect(save).toBeEnabled())
    fireEvent.change(screen.getByLabelText('Your perspective and questions'), { target: { value: 'My offline edits' } })
    fireEvent.click(save)
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('another device'))
    expect(screen.getByLabelText('Your perspective and questions')).toHaveValue('My offline edits')
    fireEvent.click(screen.getByRole('button', { name: 'Save a separate copy' }))
    await waitFor(() => expect(writes).toHaveLength(2))
    expect(writes[0].path).toBe('/api/briefs/brief-a')
    expect(writes[0].init.headers).toMatchObject({ 'If-Match': '100' })
    expect(writes[1].path).not.toBe(writes[0].path)
    expect(writes[1].init.headers).not.toHaveProperty('If-Match')
    await waitFor(() => expect(screen.getByText('Saved to your account. Reopen or duplicate it from My briefs.')).toBeInTheDocument())
  })
  it('retries a lost create response with the same document ID', async () => {
    const paths: string[] = []
    mockApi(async (init, path) => {
      paths.push(path)
      if (paths.length === 1) return Response.json({ error: 'temporarily_unavailable' }, { status: 503 })
      return Response.json({ brief: { ...stored, id: path.split('/').pop()!, draft: JSON.parse(String(init.body)), updatedAt: 101 } })
    })
    render(<Workspace locale="en" session={session} />)
    const save = await screen.findByRole('button', { name: 'Save to account' })
    await waitFor(() => expect(save).toBeEnabled())
    fireEvent.click(save)
    await screen.findByText(/Could not reach account services/)
    fireEvent.click(save)
    await waitFor(() => expect(paths).toHaveLength(2))
    expect(paths[1]).toBe(paths[0])
  })
  it('keeps an existing account draft separate from a staged guest draft', async () => {
    persistWorking('user_a', freshWorking({ ...blankDraft('en'), title: 'Account work', notes: 'Private account note' }))
    stageHandoff({ ...blankDraft('en'), title: 'Guest work', notes: 'Guest note' })
    mockApi()
    render(<Workspace locale="en" session={session} />)
    expect(screen.getByLabelText('Brief title')).toHaveValue('Account work')
    expect(await screen.findByText(/pre-sign-in draft is available/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Keep current draft' }))
    expect(screen.getByLabelText('Brief title')).toHaveValue('Account work')
  })
  it('keeps the editor usable and warns when browser storage is blocked', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('blocked', 'SecurityError') })
    mockApi()
    render(<Workspace locale="en" session={session} />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Browser storage is blocked')
    fireEvent.change(screen.getByLabelText('Brief title'), { target: { value: 'Still editable' } })
    expect(screen.getByLabelText('Brief title')).toHaveValue('Still editable')
  })
})
