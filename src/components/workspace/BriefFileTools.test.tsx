// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { briefBackupJson } from '../../briefFiles'
import { blankDraft } from '../../workspaceDrafts'
import { BriefFileTools } from './BriefFileTools'

afterEach(cleanup)

function delayedFile() {
  let finish!: (contents: string) => void
  const file = new File(['pending'], 'draft.fin-flow.json', { type: 'application/json' })
  Object.defineProperty(file, 'text', { value: () => new Promise<string>(resolve => { finish = resolve }) })
  return { file, finish: (contents: string) => finish(contents) }
}

describe('asynchronous editable backup imports', () => {
  it('uses the current replacement callback when the editor changes during a file read', async () => {
    const oldImport = vi.fn()
    const currentImport = vi.fn()
    const pending = delayedFile()
    const imported = { ...blankDraft('en'), title: 'Imported research' }
    const { rerender } = render(<BriefFileTools draft={blankDraft('en')} locale="en" onImport={oldImport} />)
    fireEvent.change(screen.getByLabelText('Open editable backup'), { target: { files: [pending.file] } })
    rerender(<BriefFileTools draft={{ ...blankDraft('en'), notes: 'Edits made during the read' }} locale="en" onImport={currentImport} />)

    await act(async () => pending.finish(briefBackupJson(imported)))

    expect(oldImport).not.toHaveBeenCalled()
    expect(currentImport).toHaveBeenCalledExactlyOnceWith(imported)
  })

  it('does not import after the file controls unmount', async () => {
    const onImport = vi.fn()
    const pending = delayedFile()
    const { unmount } = render(<BriefFileTools draft={blankDraft('en')} locale="en" onImport={onImport} />)
    fireEvent.change(screen.getByLabelText('Open editable backup'), { target: { files: [pending.file] } })
    unmount()

    await act(async () => pending.finish(briefBackupJson(blankDraft('en'))))

    expect(onImport).not.toHaveBeenCalled()
  })
})
