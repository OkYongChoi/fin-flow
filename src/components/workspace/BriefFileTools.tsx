import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { Download } from 'lucide-react'
import type { BriefDraft } from '../../briefs'
import { BriefFileError, MAX_BRIEF_FILE_BYTES, briefBackupFilename, briefBackupJson, parseBriefBackup } from '../../briefFiles'
import type { Locale } from '../../types'

export function BriefFileTools({ draft, locale, onImport }: {
  draft: BriefDraft; locale: Locale; onImport: (draft: BriefDraft) => void
}) {
  const id = useId()
  const ko = locale === 'ko'
  const [reading, setReading] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const importCurrent = useRef(onImport)
  const readGeneration = useRef(0)
  useLayoutEffect(() => { importCurrent.current = onImport }, [onImport])
  useEffect(() => () => { readGeneration.current += 1 }, [])
  const explainError = (reason: unknown) => {
    if (reason instanceof BriefFileError) {
      if (reason.code === 'too_large') return ko ? '100KB 이하의 브리핑 백업 파일을 선택하세요.' : 'Choose a briefing backup no larger than 100KB.'
      if (reason.code === 'unsupported_version') return ko ? '지원하지 않는 백업 버전입니다. 버전 1 백업을 선택하세요.' : 'This backup version is not supported. Choose a version 1 backup.'
      if (reason.code === 'foreign_format') return ko ? 'Flow of Money에서 저장한 편집용 백업을 선택하세요.' : 'Choose an editable backup saved by Flow of Money.'
      if (reason.code === 'invalid_draft') return ko ? '백업의 제목, 메모, 언어 또는 네트워크 정보를 확인할 수 없습니다.' : 'The backup contains an invalid title, notes, language or network selection.'
      return ko ? '백업 파일을 읽을 수 없습니다. 올바른 JSON 백업을 선택하세요.' : 'The backup is not valid JSON. Choose a valid backup file.'
    }
    return ko ? '파일을 열지 못했습니다. 다시 선택해 주세요.' : 'The file could not be opened. Please choose it again.'
  }
  const saveBackup = () => {
    setError(''); setNotice('')
    try {
      const url = URL.createObjectURL(new Blob([briefBackupJson(draft)], { type: 'application/json;charset=utf-8' }))
      const anchor = document.createElement('a')
      anchor.href = url; anchor.download = briefBackupFilename(draft.title)
      anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
      setNotice(ko ? '편집용 백업을 내보냈습니다. 이 파일을 다시 열어 작성을 이어갈 수 있습니다.' : 'Editable backup exported. Open this file later to continue writing.')
    } catch (reason) { setError(explainError(reason)) }
  }
  return <section className="brief-file-tools" aria-labelledby={`${id}-title`}>
    <div><h3 id={`${id}-title`}>{ko ? '파일로 보관하고 이어 쓰기' : 'Keep an editable backup'}</h3><p id={`${id}-hint`}>{ko ? '제목·메모·네트워크·문서 언어를 JSON 파일로 보관합니다. 미완성 초안도 가능하며, 다시 열면 현재 출처로 미리보기를 만듭니다. 계정 저장과 별개입니다.' : 'Save the title, notes, networks and document language as JSON, even for an unfinished draft. Reopening uses the current source snapshot for its preview. This is separate from saving to your account.'}</p></div>
    <div className="brief-actions"><button type="button" className="brief-button" onClick={saveBackup}><Download size={16} aria-hidden="true" />{ko ? '편집용 백업 다운로드' : 'Download editable backup'}</button><label className="brief-file-input" htmlFor={`${id}-file`}><span>{ko ? '편집용 백업 열기' : 'Open editable backup'}</span><input id={`${id}-file`} type="file" accept=".json,application/json" disabled={reading} aria-describedby={`${id}-hint`} onChange={async event => {
      const input = event.currentTarget
      const file = input.files?.[0]
      input.value = ''
      if (!file) return
      const generation = ++readGeneration.current
      setReading(true); setError(''); setNotice('')
      try {
        if (file.size > MAX_BRIEF_FILE_BYTES) throw new BriefFileError('too_large')
        const imported = parseBriefBackup(await file.text())
        if (generation !== readGeneration.current) return
        // The editor may have changed while the file was read. Let its current
        // replacement guard decide whether to open a confirmation dialog.
        importCurrent.current(imported)
        setNotice(ko ? '백업 초안을 확인했습니다. 바꾸기 확인창이 열리면 내용을 확인한 뒤 선택하세요.' : 'Backup draft checked. If a replacement dialog opens, review it before choosing to replace your draft.')
      } catch (reason) { if (generation === readGeneration.current) setError(explainError(reason)) }
      finally { if (generation === readGeneration.current) setReading(false) }
    }} /></label></div>
    <p role="status" className="workspace-hint">{reading ? (ko ? '백업 파일 확인 중…' : 'Checking backup file…') : notice}</p>
    {error && <p role="alert" className="brief-error">{error} {ko ? '현재 초안은 유지됩니다.' : 'Your current draft is preserved.'}</p>}
  </section>
}
