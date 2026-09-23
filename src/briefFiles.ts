import type { BriefDraft } from './briefs'
import { parseEditableDraft } from './workspaceDrafts'

export const BRIEF_FILE_FORMAT = 'flow-of-money-brief'
export const BRIEF_FILE_VERSION = 1
export const MAX_BRIEF_FILE_BYTES = 100 * 1024

type BriefFileErrorCode = 'too_large' | 'malformed' | 'foreign_format' | 'unsupported_version' | 'invalid_draft'
export class BriefFileError extends Error {
  constructor(public readonly code: BriefFileErrorCode) {
    super(code)
    this.name = 'BriefFileError'
  }
}

export function briefBackupJson(draft: BriefDraft): string {
  const editable = parseEditableDraft(draft)
  if (!editable) throw new BriefFileError('invalid_draft')
  // Only editable content is portable. Account ownership and cloud revisions never travel.
  return JSON.stringify({ format: BRIEF_FILE_FORMAT, version: BRIEF_FILE_VERSION, draft: editable }, null, 2)
}

export function parseBriefBackup(contents: string): BriefDraft {
  if (new TextEncoder().encode(contents).byteLength > MAX_BRIEF_FILE_BYTES) throw new BriefFileError('too_large')
  let value: unknown
  try { value = JSON.parse(contents) } catch { throw new BriefFileError('malformed') }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new BriefFileError('foreign_format')
  const envelope = value as Record<string, unknown>
  if (envelope.format !== BRIEF_FILE_FORMAT) throw new BriefFileError('foreign_format')
  if (envelope.version !== BRIEF_FILE_VERSION) throw new BriefFileError('unsupported_version')
  const draft = parseEditableDraft(envelope.draft)
  if (!draft) throw new BriefFileError('invalid_draft')
  return draft
}

export function briefBackupFilename(title: string): string {
  return `${title.replace(/[^a-zA-Z0-9가-힣_-]/g, '_').slice(0, 80) || 'brief'}.fin-flow.json`
}
