import type { BriefDraft } from './briefs'
import { fingerprint, parseEditableDraft } from './workspaceDrafts'

export const LOCAL_BRIEF_PREFIX = 'fin-flow:local-brief:v1:'
export const LOCAL_BRIEF_LIMIT = 20
const MAX_RECORD_BYTES = 64 * 1024
const validId = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

export interface LocalBrief { id: string; draft: BriefDraft; savedAt: number }
export class LocalBriefError extends Error {
  constructor(public readonly code: 'full' | 'invalid_draft' | 'invalid_id' | 'id_conflict') {
    super(code)
    this.name = 'LocalBriefError'
  }
}

function readRecord(raw: string, key: string): LocalBrief | null {
  // Bound parsing work even when another tab or an older version wrote bad data.
  if (raw.length > MAX_RECORD_BYTES || new TextEncoder().encode(raw).byteLength > MAX_RECORD_BYTES) return null
  let value: unknown
  try { value = JSON.parse(raw) } catch { return null }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const record = value as Record<string, unknown>
  if (typeof record.id !== 'string' || !validId(record.id) || key !== LOCAL_BRIEF_PREFIX + record.id ||
    typeof record.savedAt !== 'number' || !Number.isSafeInteger(record.savedAt) || record.savedAt < 0 ||
    !Number.isFinite(new Date(record.savedAt).getTime())) return null
  const draft = parseEditableDraft(record.draft)
  // Reconstruct only local snapshot fields; ownership and cloud revisions never travel.
  return draft ? { id: record.id, draft, savedAt: record.savedAt } : null
}

export function readLocalBriefs(storage: Storage = localStorage): { briefs: LocalBrief[]; unreadableCount: number } {
  const keys = new Set<string>()
  for (let index = 0; index < storage.length; index++) {
    const key = storage.key(index)
    if (key?.startsWith(LOCAL_BRIEF_PREFIX)) keys.add(key)
  }
  const briefs: LocalBrief[] = []
  let unreadableCount = 0
  for (const key of keys) {
    // Storage access failures propagate; a deletion in another tab is not corruption.
    const raw = storage.getItem(key)
    if (raw === null) continue
    const brief = readRecord(raw, key)
    if (brief) briefs.push(brief)
    else unreadableCount++
  }
  briefs.sort((a, b) => b.savedAt - a.savedAt || a.id.localeCompare(b.id))
  return { briefs, unreadableCount }
}

export function saveLocalBrief(draft: BriefDraft, storage: Storage = localStorage): { brief: LocalBrief; duplicate: boolean } {
  const parsed = parseEditableDraft(draft)
  if (!parsed) throw new LocalBriefError('invalid_draft')
  const editable = { ...parsed, networks: [...parsed.networks] }
  // Always read current storage, including changes made in another tab.
  const { briefs } = readLocalBriefs(storage)
  const currentFingerprint = fingerprint(editable)
  const duplicate = briefs.find(brief => fingerprint(brief.draft) === currentFingerprint)
  if (duplicate) return { brief: duplicate, duplicate: true }
  // Unreadable records are preserved but cannot fill every usable notebook slot.
  if (briefs.length >= LOCAL_BRIEF_LIMIT) throw new LocalBriefError('full')
  // Independent keys avoid clobbering another tab's snapshots. Concurrent saves
  // at the limit can temporarily exceed it; retain every copy and block new saves.
  for (let attempt = 0; attempt < 3; attempt++) {
    const id = crypto.randomUUID()
    const key = LOCAL_BRIEF_PREFIX + id
    if (storage.getItem(key) !== null) continue
    const brief: LocalBrief = { id, draft: editable, savedAt: Date.now() }
    storage.setItem(key, JSON.stringify(brief))
    return { brief, duplicate: false }
  }
  throw new LocalBriefError('id_conflict')
}

export function removeLocalBrief(id: string, storage: Storage = localStorage): void {
  if (!validId(id)) throw new LocalBriefError('invalid_id')
  storage.removeItem(LOCAL_BRIEF_PREFIX + id)
}
