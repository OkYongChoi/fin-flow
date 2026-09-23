import { useCallback, useEffect, useState } from 'react'
import { Download, FileText, Save, Search, Trash2 } from 'lucide-react'
import type { BriefDraft } from '../../briefs'
import { briefBackupFilename, briefBackupJson } from '../../briefFiles'
import { NETWORKS } from '../../data'
import { LOCAL_BRIEF_LIMIT, LOCAL_BRIEF_PREFIX, LocalBriefError, readLocalBriefs, removeLocalBrief, saveLocalBrief, type LocalBrief } from '../../localBriefs'
import type { Locale } from '../../types'
import './localBriefNotebook.css'

type NotebookState = { briefs: LocalBrief[]; unreadableCount: number; unavailable: boolean }
function initialNotebook(): NotebookState {
  try { return { ...readLocalBriefs(), unavailable: false } }
  catch { return { briefs: [], unreadableCount: 0, unavailable: true } }
}

// Mounted only for guests. Account drafts never enter this browser-wide library.
export function LocalBriefNotebook({ draft, locale, onOpen }: {
  draft: BriefDraft; locale: Locale; onOpen: (draft: BriefDraft) => void
}) {
  const ko = locale === 'ko'
  const text = (a: string, b: string) => ko ? a : b
  const [notebook, setNotebook] = useState(initialNotebook)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('recent')
  const [notice, setNotice] = useState<'saved' | 'duplicate' | 'deleted' | 'download' | null>(null)
  const [error, setError] = useState<'write' | 'full' | 'download' | null>(null)
  const refresh = useCallback(() => {
    try { setNotebook({ ...readLocalBriefs(), unavailable: false }) }
    catch { setNotebook(current => ({ ...current, unavailable: true })) }
  }, [])
  useEffect(() => {
    const synchronize = (event: StorageEvent) => {
      if (event.key === null || event.key.startsWith(LOCAL_BRIEF_PREFIX)) refresh()
    }
    window.addEventListener('storage', synchronize)
    window.addEventListener('focus', refresh)
    return () => { window.removeEventListener('storage', synchronize); window.removeEventListener('focus', refresh) }
  }, [refresh])
  const title = (brief: LocalBrief) => brief.draft.title.trim() || text('제목 없는 초안', 'Untitled draft')
  const matching = notebook.briefs.filter(brief => `${brief.draft.title} ${brief.draft.notes}`.toLocaleLowerCase(locale).includes(query.trim().toLocaleLowerCase(locale)))
    .sort((a, b) => sort === 'title' ? title(a).localeCompare(title(b), locale) : b.savedAt - a.savedAt)
  const saveCopy = () => {
    setNotice(null); setError(null)
    try {
      const result = saveLocalBrief(draft)
      setQuery(''); refresh(); setNotice(result.duplicate ? 'duplicate' : 'saved')
    } catch (reason) { setError(reason instanceof LocalBriefError && reason.code === 'full' ? 'full' : 'write') }
  }
  const remove = (brief: LocalBrief) => {
    if (!window.confirm(text(`“${title(brief)}” 보관본을 삭제할까요? 작성 중인 초안은 그대로 유지됩니다.`, `Delete the saved copy “${title(brief)}”? Your current draft will stay as it is.`))) return
    setNotice(null); setError(null)
    try { removeLocalBrief(brief.id); refresh(); setNotice('deleted') }
    catch { setError('write') }
  }
  const download = (brief: LocalBrief) => {
    setNotice(null); setError(null)
    try {
      const url = URL.createObjectURL(new Blob([briefBackupJson(brief.draft)], { type: 'application/json;charset=utf-8' }))
      const anchor = document.createElement('a')
      anchor.href = url; anchor.download = briefBackupFilename(brief.draft.title)
      anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
      setNotice('download')
    } catch { setError('download') }
  }
  return <section id="local-notebook" className="local-notebook" tabIndex={-1} aria-labelledby="local-notebook-title">
    <div className="library-heading"><h2 id="local-notebook-title">{text('브라우저 보관함', 'Browser notebook')} <small>{notebook.unavailable ? '…' : `${notebook.briefs.length}/${LOCAL_BRIEF_LIMIT}`}</small></h2>
      <button type="button" className="brief-button primary" onClick={saveCopy}><Save size={16} aria-hidden="true" />{text('현재 초안 사본 보관', 'Keep a copy of this draft')}</button>
    </div>
    <p className="workspace-hint">{text('로그인 없이 미완성 초안도 여러 개 보관하세요. 보관본은 직접 사본을 추가할 때만 만들어지며, 편집해도 기존 보관본은 바뀌지 않습니다.', 'Keep several drafts without signing in, even unfinished ones. Copies are saved only when you choose to keep one; editing does not change an existing copy.')}</p>
    <p className="workspace-hint">{text('이 브라우저를 쓰는 다른 사람도 열 수 있습니다. 기기 간 동기화는 되지 않으며 브라우저 데이터를 지우면 사라집니다. 중요한 보관본은 파일로 다운로드하세요. 다시 열면 현재 출처로 미리보기를 만듭니다.', 'Anyone using this browser can open these copies. They do not sync across devices and are removed if browser data is cleared. Download important copies as files. Reopening uses current sources for the preview.')}</p>
    {notebook.unavailable && <div className="brief-error" role="alert"><p>{text('브라우저 보관함에 접근하지 못했습니다. 보관본이 없다는 뜻은 아닙니다.', 'The browser notebook is unavailable. This does not mean your copies are empty.')}</p><button type="button" className="brief-button" onClick={refresh}>{text('보관함 다시 확인', 'Retry notebook')}</button></div>}
    {notebook.unreadableCount > 0 && <p className="workspace-hint" role="status">{text(`${notebook.unreadableCount}개 보관본을 읽지 못했습니다. 원본은 지우거나 바꾸지 않았습니다.`, `${notebook.unreadableCount} copies could not be read. Their stored content has not been deleted or changed.`)}</p>}
    {error && <p className="brief-error" role="alert">{error === 'full'
      ? text(`보관함이 가득 찼습니다(${LOCAL_BRIEF_LIMIT}개). 필요한 사본을 다운로드한 뒤 기존 보관본을 삭제해 주세요.`, `The notebook is full (${LOCAL_BRIEF_LIMIT} copies). Download anything you want to keep, then delete an existing copy.`)
      : error === 'download' ? text('파일을 내려받지 못했습니다. 다시 시도해 주세요.', 'The file could not be downloaded. Please try again.')
        : text('브라우저 저장을 완료하지 못했습니다. 작성 중인 초안은 그대로입니다. 파일 백업을 이용해 주세요.', 'Browser storage could not be updated. Your current draft is unchanged. Use a file backup instead.')}</p>}
    <p className="workspace-hint" role="status">{notice === 'saved' ? text('현재 초안의 사본을 보관했습니다.', 'A copy of your current draft is saved.')
      : notice === 'duplicate' ? text('동일한 초안이 이미 보관되어 있습니다. 사본을 추가하지 않았습니다.', 'This exact draft is already in your notebook. No duplicate was added.')
        : notice === 'deleted' ? text('보관본을 삭제했습니다. 작성 중인 초안은 유지됩니다.', 'Copy deleted. Your current draft is unchanged.')
          : notice === 'download' ? text('편집용 백업을 내보냈습니다.', 'Editable backup exported.') : ''}</p>
    <div className="library-controls"><label><Search size={16} aria-hidden="true" /><span className="sr-only">{text('브라우저 보관함 검색', 'Search browser notebook')}</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={text('제목 또는 메모 검색', 'Search title or notes')} onKeyDown={event => { if (event.key === 'Escape') setQuery('') }} /></label>
      <label><span className="sr-only">{text('브라우저 보관함 정렬', 'Sort browser notebook')}</span><select value={sort} onChange={event => setSort(event.target.value)}><option value="recent">{text('최근 보관순', 'Recently saved')}</option><option value="title">{text('제목순', 'Title')}</option></select></label>
    </div>
    {!notebook.unavailable && <p className="workspace-hint" role="status">{text(`${matching.length}개 보관본`, `${matching.length} saved copies`)}</p>}
    {!notebook.unavailable && !matching.length && <div className="workspace-empty"><p>{query ? text('일치하는 보관본이 없습니다.', 'No matching copies.') : notebook.unreadableCount ? text('표시할 수 있는 보관본이 없습니다.', 'No readable copies to display.') : text('아직 보관본이 없습니다. 현재 초안의 사본을 보관한 뒤 다른 주제를 시작해 보세요.', 'No copies yet. Keep a copy of your current draft before starting a different topic.')}</p>{query && <button type="button" className="brief-button" onClick={() => setQuery('')}>{text('보관함 검색 초기화', 'Clear notebook search')}</button>}</div>}
    {matching.map(brief => <article className="saved-brief" key={brief.id}>
      <button type="button" className="brief-open" aria-label={`${text('보관본 열기', 'Open saved draft')} ${title(brief)}`} onClick={() => onOpen(brief.draft)}><FileText size={20} aria-hidden="true" /><span><strong>{title(brief)}</strong><small>{new Date(brief.savedAt).toLocaleString(locale)} · {brief.draft.locale === 'ko' ? '한국어' : 'English'}</small><small>{brief.draft.networks.map(id => { const network = NETWORKS.find(item => item.id === id)!; return ko ? network.label : network.labelEn }).join(' · ') || text('네트워크 미선택', 'No networks selected')}</small>{brief.draft.notes && <small className="notebook-note">{brief.draft.notes.slice(0, 120)}{brief.draft.notes.length > 120 ? '…' : ''}</small>}</span></button>
      <div className="brief-actions"><button type="button" className="brief-button" aria-label={`${text('보관본 백업', 'Back up saved draft')} ${title(brief)}`} onClick={() => download(brief)}><Download size={16} aria-hidden="true" />{text('파일 백업', 'File backup')}</button><button type="button" className="brief-button" aria-label={`${text('보관본 삭제', 'Delete saved draft')} ${title(brief)}`} onClick={() => remove(brief)}><Trash2 size={16} aria-hidden="true" /></button></div>
    </article>)}
  </section>
}
