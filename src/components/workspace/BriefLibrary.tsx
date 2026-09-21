import { useState } from 'react'
import { Copy, FileText, Search, Trash2 } from 'lucide-react'
import type { SavedBrief } from '../../briefs'
import type { Locale } from '../../types'

export function BriefLibrary({ briefs, locale, busy, open, duplicate, download, remove }: {
  briefs: SavedBrief[]; locale: Locale; busy: boolean
  open: (brief: SavedBrief) => void; duplicate: (brief: SavedBrief) => void
  download: (brief: SavedBrief) => void; remove: (brief: SavedBrief) => void
}) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('recent')
  const ko = locale === 'ko'
  const filtered = briefs.filter(brief => `${brief.draft.title} ${brief.draft.notes}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
    .sort((a, b) => sort === 'title' ? a.draft.title.localeCompare(b.draft.title, locale) : b.updatedAt - a.updatedAt)
  return <>
    <div className="library-controls"><label><Search size={16} /><span className="sr-only">{ko ? '저장한 브리핑 검색' : 'Search saved briefs'}</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={ko ? '제목 또는 메모 검색' : 'Search title or notes'} /></label><label><span className="sr-only">{ko ? '브리핑 정렬' : 'Sort briefs'}</span><select value={sort} onChange={event => setSort(event.target.value)}><option value="recent">{ko ? '최근 수정순' : 'Recently edited'}</option><option value="title">{ko ? '제목순' : 'Title'}</option></select></label></div>
    <p className="workspace-hint" role="status">{ko ? `${filtered.length}개 브리핑` : `${filtered.length} briefs`}</p>
    {!filtered.length && <div className="workspace-empty"><p>{query ? (ko ? '검색 결과가 없습니다.' : 'No matching briefs.') : (ko ? '첫 브리핑을 저장하면 여기에 표시됩니다. 기존 문서를 복사해 다음 작업에 재사용할 수 있습니다.' : 'Your first saved brief will appear here. Duplicate a brief to reuse it for your next task.')}</p>{query && <button className="brief-button" onClick={() => setQuery('')}>{ko ? '검색 초기화' : 'Clear search'}</button>}</div>}
    {filtered.map(brief => <article className="saved-brief" key={brief.id}><button className="brief-open" onClick={() => open(brief)}><FileText size={20} /><span><strong>{brief.draft.title}</strong><small>{brief.snapshotVersion} · {new Date(brief.updatedAt).toLocaleDateString(locale)}</small></span></button><div className="brief-actions"><button className="brief-button" onClick={() => duplicate(brief)} aria-label={`${ko ? '복사' : 'Duplicate'} ${brief.draft.title}`}><Copy size={16} />{ko ? '복사해서 작성' : 'Use as a template'}</button><button className="brief-button" onClick={() => download(brief)}>{ko ? '보관본 내보내기' : 'Export saved copy'}</button><button className="brief-button" disabled={busy} aria-label={`${ko ? '삭제' : 'Delete'} ${brief.draft.title}`} onClick={() => remove(brief)}><Trash2 size={16} /></button></div></article>)}
  </>
}
