import { useEffect, useState } from 'react'
import { ClerkProvider, SignInButton, UserButton, useAuth } from '@clerk/react'
import { ArrowRight, BookOpen, Check, Cloud, Download, FileText, Plus, Trash2 } from 'lucide-react'
import { AppHeader } from '../App'
import { NETWORKS, fetchDataBundle, isSnapshotReviewOverdue } from '../data'
import { FLOW_GUIDES } from '../flowGuides'
import { briefMarkdown, briefSources, CLOUD_BRIEF_LIMIT, parseBrief, PRO_PRICE_USD, type BriefDraft, type SavedBrief } from '../briefs'
import { useRouter } from '../router'
import type { DataBundle, Locale, NetworkId } from '../types'

const LOCAL_KEY = 'fin-flow:brief-draft:v1'
interface Session { userId: string | null; getToken: () => Promise<string | null>; ready: boolean; controls?: React.ReactNode }
interface Account { userId: string; pro: boolean; hasSubscription: boolean; checkout: boolean; environment: string }
const blank = (locale: Locale): BriefDraft => ({ title: locale === 'ko' ? '금융 흐름 비교 브리핑' : 'Financial flow comparison', notes: '', networks: ['swift', 'chips-fedwire'], locale })
function localDraft(locale: Locale) { try { return parseBrief(JSON.parse(localStorage.getItem(LOCAL_KEY) ?? 'null')) ?? blank(locale) } catch { return blank(locale) } }
function download(markdown: string, name: string) {
  const url = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown;charset=utf-8' }))
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${name.replace(/[^a-zA-Z0-9가-힣_-]/g, '_').slice(0,80) || 'brief'}.md`; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
}
const noSession: Session = { userId: null, getToken: async () => null, ready: true }
export default function WorkspacePage(props: { locale: Locale; pricing?: boolean }) {
  const key = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
  return key ? <ClerkProvider publishableKey={key}><Connected {...props} /></ClerkProvider> : <Workspace {...props} session={noSession} />
}
function Connected(props: { locale: Locale; pricing?: boolean }) {
  const { userId, getToken, isLoaded } = useAuth()
  return <Workspace key={userId ?? 'guest'} {...props} session={{ userId: userId ?? null, getToken, ready: Boolean(isLoaded), controls: userId ? <UserButton /> : <SignInButton mode="modal"><button className="brief-button">{props.locale === 'ko' ? '로그인' : 'Sign in'}</button></SignInButton> }} />
}
function Workspace({ locale, pricing, session }: { locale: Locale; pricing?: boolean; session: Session }) {
  const ko = locale === 'ko'; const text = (a: string, b: string) => ko ? a : b
  const { navigate, search } = useRouter()
  const [draft, setDraft] = useState<BriefDraft>(() => session.userId ? blank(locale) : localDraft(locale))
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [saved, setSaved] = useState<SavedBrief[]>([])
  const [data, setData] = useState<DataBundle | null>(null)
  const [account, setAccount] = useState<Account | null>(null)
  const [offer, setOffer] = useState<{ checkout: boolean; environment: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [storageError, setStorageError] = useState(false)
  const [dataError, setDataError] = useState(false)
  const checkoutOffer = account ?? offer
  useEffect(() => {
    if (!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) return
    let active = true
    void fetch('/api/config', { cache: 'no-store' }).then(async response => {
      if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) return
      const config = await response.json()
      if (active) setOffer({ checkout: config.auth === true && config.checkout === true, environment: config.environment })
    }).catch(() => undefined)
    return () => { active = false }
  }, [])
  const validDraft = parseBrief({ ...draft, locale })
  useEffect(() => { let active = true; void fetchDataBundle().then(result => { if (active) setData(result) }).catch(() => { if (active) setDataError(true) }); return () => { active = false } }, [])
  useEffect(() => {
    if (session.userId) return
    try { localStorage.setItem(LOCAL_KEY, JSON.stringify({ ...draft, locale })); setStorageError(false) } catch { setStorageError(true) }
  }, [draft, locale, session.userId])
  const call = async (path: string, method = 'GET', body?: unknown) => {
    const token = await session.getToken()
    if (!token) throw new Error('sign_in_required')
    const response = await fetch(path, { method, headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined, cache: 'no-store' })
    if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('temporarily_unavailable')
    const result = await response.json()
    if (!response.ok) throw new Error(result.error ?? 'temporarily_unavailable')
    return result
  }
  const errorText = (reason: unknown) => {
    const code = reason instanceof Error ? reason.message : ''
    if (code === 'pro_required') return text('클라우드 저장에는 Pro 구독이 필요합니다. 현재 초안은 내보낼 수 있습니다.', 'Cloud saving requires Pro. You can still export this draft.')
    if (code === 'checkout_pending') return text('기존 결제를 확인 중입니다. 다시 결제하지 말고 잠시 후 구독 상태를 새로고침해 주세요.', 'An existing checkout needs confirmation. Refresh subscription status before starting another payment.')
    if (code === 'subscription_exists') return text('기존 구독이 있습니다. 결제 관리에서 확인해 주세요.', 'An existing subscription needs attention. Open billing management.')
    if (code === 'brief_limit_or_conflict') return text('저장 한도에 도달했거나 문서가 변경되었습니다. 목록을 새로고침해 주세요.', 'The save limit was reached or the document changed. Refresh your library.')
    if (code === 'sign_in_required') return text('로그인 후 다시 시도해 주세요.', 'Please sign in and try again.')
    return text('지금 계정 서비스를 사용할 수 없습니다. 초안을 내보내고 잠시 후 다시 시도해 주세요.', 'Account services are unavailable. Export your draft and try again later.')
  }
  const run = async (action: () => Promise<void>) => { setBusy(true); setError(''); setNotice(''); try { await action() } catch (reason) { setError(errorText(reason)) } finally { setBusy(false) } }
  const refresh = async () => {
    const [next, library] = await Promise.all([call('/api/account') as Promise<Account>, call('/api/briefs') as Promise<{ briefs: SavedBrief[] }>])
    if (next.userId !== session.userId) throw new Error('sign_in_required')
    setAccount(next)
    setSaved(library.briefs)
  }
  useEffect(() => { if (session.ready && session.userId) void run(refresh) }, [session.userId, session.ready]) // Session changes remount and isolate private state.
  const toggle = (id: NetworkId) => setDraft(current => ({ ...current, networks: current.networks.includes(id) ? current.networks.filter(item => item !== id) : current.networks.length < 4 ? [...current.networks, id] : current.networks }))
  const exportDraft = () => { if (validDraft && data) { download(briefMarkdown(validDraft, data), validDraft.title); setNotice(text('출처를 포함한 Markdown을 내보냈습니다.', 'Exported Markdown with sources.')) } }
  const save = () => run(async () => {
    if (!validDraft) return
    const response = await call(`/api/briefs/${selectedId ?? crypto.randomUUID()}`, 'PUT', validDraft) as { brief: SavedBrief }
    setSelectedId(response.brief.id); await refresh(); setNotice(text('계정에 저장했습니다.', 'Saved to your account.'))
  })
  const billing = (kind: 'checkout' | 'portal') => run(async () => {
    const result = await call(`/api/billing/${kind}`, 'POST', { locale })
    const url = new URL(result.url)
    if (url.protocol !== 'https:' || url.username || url.password || !(url.hostname === 'creem.io' || url.hostname.endsWith('.creem.io'))) throw new Error('invalid_url')
    window.location.assign(url.href)
  })
  return <div className="workspace-page"><AppHeader locale={locale} /><main id="main-content" tabIndex={-1} className="workspace-main">
    <div className="workspace-topline"><span className="workspace-eyebrow">FLOW OF MONEY / BRIEFING STUDIO</span><div className="brief-actions">{session.controls}<button className="brief-button" onClick={() => navigate(`/${locale}/${pricing ? 'workspace' : 'pricing'}`)}>{pricing ? text('작업실 열기', 'Open workspace') : text('요금제', 'Plans')}<ArrowRight size={15} /></button></div></div>
    <section className="workspace-hero"><div><span className="workspace-kicker">{text('탐색에서 설명으로', 'FROM EXPLORING TO EXPLAINING')}</span><h1>{pricing ? text('금융 지식을, 반복해서 쓰는 자산으로.', 'Make financial knowledge reusable.') : text('복잡한 금융 흐름을\n한 장의 브리핑으로.', 'Complex financial flows.\nOne clear briefing.')}</h1><p>{text('핀테크 기획·운영·교육을 위한 출처 기반 작업실. 네트워크를 비교하고, 내 관점을 더해, 바로 공유할 문서로 만드세요.', 'A source-backed workspace for fintech product, operations and education. Compare networks, add your perspective, and export a brief ready to share.')}</p></div><aside className="workspace-value"><BookOpen size={26} /><strong>{text('근거까지 함께 전달하세요', 'Bring the evidence with you')}</strong><p>{text('절차 · 역할 · 주의점 · 원문 링크', 'Steps · roles · boundaries · source links')}</p><small>{text('한국어 / English · Markdown', 'English / 한국어 · Markdown')}</small></aside></section>
    {pricing ? <section className="pricing-grid" aria-label={text('요금제 비교', 'Compare plans')}>
      <article className="plan-card"><span>EXPLORE</span><h2>{text('자유롭게 시작', 'Start exploring')}</h2><p className="plan-price">$0</p><p>{text('금융 구조를 이해하고 첫 브리핑을 작성하세요.', 'Understand the infrastructure and create your first brief.')}</p><ul>{[text('모든 공개 네트워크와 출처', 'All public networks and sources'), text('브라우저에 초안 1개 보관', 'One draft stored in this browser'), text('최대 4개 네트워크 비교', 'Compare up to four networks'), text('출처 포함 Markdown 내보내기', 'Markdown export with citations')].map(item => <li key={item}><Check size={16} />{item}</li>)}</ul><button className="brief-button primary" onClick={() => navigate(`/${locale}/workspace`)}>{text('무료로 작성하기', 'Create a free brief')}<ArrowRight size={16} /></button></article>
      <article className="plan-card featured"><span>PRO / {text('개인 작업실', 'PERSONAL WORKSPACE')}</span><h2>{text('작업을 쌓아가는 공간', 'A home for your work')}</h2><p className="plan-price">${PRO_PRICE_USD}<small> / {text('년', 'year')} · USD</small></p><p>{checkoutOffer?.checkout ? text('개인 브리핑을 기기 간에 이어서 작성하세요.', 'Continue your private briefs across devices.') : text('초기 제안 가격. 판매 개시 전입니다.', 'Proposed launch price. Sales are not open yet.')}</p><ul>{[text('무료 기능 모두 포함', 'Everything in Explore'), text(`계정별 비공개 브리핑 ${CLOUD_BRIEF_LIMIT}개`, `${CLOUD_BRIEF_LIMIT} private briefs per account`), text('기기 간 저장·불러오기·수정', 'Save, reopen and edit across devices'), text('저장 시점의 출처·문서 보존', 'Preserve the source snapshot at save time'), text('만료 후에도 읽기·내보내기·삭제', 'Read, export and delete after expiry')].map(item => <li key={item}><Check size={16} />{item}</li>)}</ul>
      {account?.pro ? <p className="brief-status">{text('Pro 사용 중', 'Pro is active')}</p> : checkoutOffer?.checkout && !session.userId ? <SignInButton mode="modal"><button className="brief-button primary">{text('로그인하고 Pro 시작', 'Sign in to start Pro')}</button></SignInButton> : account?.checkout ? <button className="brief-button primary" disabled={busy} onClick={() => void billing('checkout')}>{account.environment === 'test' ? text('테스트 결제 열기', 'Open test checkout') : text('연간 Pro 시작', 'Start annual Pro')}</button> : <button className="brief-button" disabled>{text('판매 준비 중', 'Sales opening soon')}</button>}
      <small>{text('연간 자동 갱신 · 세금 포함 제안 가격 · 체험 결제 없음. 결제 관리에서 갱신을 취소할 수 있습니다.', 'Annual auto-renewal · proposed tax-inclusive price · no paid trial. Cancel renewal through billing management.')}</small></article>
    </section> : <>
      <div className="workspace-toolbar"><div><strong>{account?.pro ? 'PRO' : text('무료 초안', 'FREE DRAFT')}</strong><span>{session.userId ? text('클라우드 저장 버튼으로 계정에 보관', 'Use Save to account to keep your work') : text('이 브라우저에만 자동 저장', 'Autosaved in this browser only')}</span></div><div className="brief-actions"><button className="brief-button" disabled={!validDraft || !data} onClick={exportDraft}><Download size={16} />{text('Markdown 내보내기', 'Export Markdown')}</button><button className="brief-button primary" disabled={busy || !account?.pro || !validDraft || !data} onClick={() => void save()}><Cloud size={16} />{text('계정에 저장', 'Save to account')}</button></div></div>
      {!account?.pro && <p className="workspace-hint">{text('작성과 내보내기는 무료입니다. 계정별 클라우드 저장은 Pro에서 제공됩니다.', 'Writing and export are free. Private cloud storage is included in Pro.')}</p>}
      {storageError && <p role="alert">{text('브라우저 저장이 차단되었습니다. 페이지를 떠나기 전에 내보내기해 주세요.', 'Browser storage is blocked. Export before leaving this page.')}</p>}
      {dataError && <p role="alert">{text('출처를 불러오지 못했습니다. 페이지를 새로고침해 주세요.', 'Sources could not load. Please reload the page.')}</p>}
      <div className="workspace-grid"><section className="brief-editor" aria-label={text('브리핑 편집', 'Brief editor')}><label>{text('브리핑 제목', 'Brief title')}<input maxLength={120} value={draft.title} onChange={event => setDraft({ ...draft, title: event.target.value })} /></label><fieldset><legend>{text('비교할 네트워크', 'Networks to compare')} <small>{draft.networks.length}/4</small></legend><div className="network-choices">{NETWORKS.map(network => <label key={network.id} className={draft.networks.includes(network.id) ? 'selected' : ''}><input type="checkbox" checked={draft.networks.includes(network.id)} disabled={!draft.networks.includes(network.id) && draft.networks.length === 4} onChange={() => toggle(network.id)} /><span>{ko ? network.label : network.labelEn}</span></label>)}</div></fieldset><label>{text('내 관점과 질문', 'Your perspective and questions')}<textarea rows={7} maxLength={6000} placeholder={text('이 구조가 우리 제품에 주는 의미는 무엇인가요?', 'What does this structure mean for our product?')} value={draft.notes} onChange={event => setDraft({ ...draft, notes: event.target.value })} /></label><small>{draft.notes.length}/6000 · {text('메모는 출처의 사실과 구분되어 내보내집니다.', 'Notes are exported separately from source-backed facts.')}</small></section>
      <section className="brief-preview" aria-label={text('브리핑 미리보기', 'Brief preview')}><div className="preview-heading"><FileText size={17} /><span>{text('브리핑 미리보기', 'BRIEF PREVIEW')}</span></div><h2>{draft.title || text('제목을 입력하세요', 'Add a title')}</h2><p className="snapshot-label">{text('데이터 스냅샷', 'Data snapshot')} {data?.version ?? '…'} · {text('출처 검토 기한', 'Review due')} {data?.reviewDueAt?.slice(0,10) ?? '…'}</p>{data && isSnapshotReviewOverdue(data.reviewDueAt) && <p className="workspace-hint">{text('출처 검토 기한이 지났습니다. 사용 전 원문을 확인하세요.', 'Source review is overdue. Check the original sources before use.')}</p>}
      {draft.networks.length === 0 && <p>{text('비교할 네트워크를 하나 이상 선택하세요.', 'Choose at least one network.')}</p>}
      {draft.networks.map(id => { const network = NETWORKS.find(n => n.id === id)!; const guide = FLOW_GUIDES[id]; return <article key={id} className="comparison-block"><h3>{ko ? network.label : network.labelEn}</h3><p>{ko ? network.description : network.descriptionEn}</p><ol>{(guide?.steps ?? []).map((step, index) => <li key={index}>{ko ? step.ko : step.en}</li>)}</ol><ul>{(guide?.roles ?? []).map((role, index) => <li key={index}>{ko ? role.ko : role.en}</li>)}</ul><p className="brief-boundary">{guide ? (ko ? guide.boundary.ko : guide.boundary.en) : text('설명용 구조도이며 개별 거래를 재현하지 않습니다.', 'An explanatory schematic; it does not reproduce individual transactions.')}</p><div className="brief-sources">{data && briefSources([id], data).map(source => <a href={source.url} key={source.id} target="_blank" rel="noreferrer">{source.provider} ↗</a>)}</div></article> })}
      <section className="author-notes"><h3>{text('작성자 메모', 'Author notes')}</h3><p>{draft.notes || text('관점과 질문을 더해 브리핑을 완성하세요.', 'Add your perspective and questions to complete the brief.')}</p></section><p className="workspace-hint">{text('금융 구조 학습용 도식입니다. 실시간 거래 데이터나 투자 조언이 아닙니다.', 'An educational schematic, not live transaction data or investment advice.')}</p></section></div>
      <section className="saved-briefs"><div className="library-heading"><h2>{text('내 브리핑', 'My briefs')} <small>{saved.length}/{CLOUD_BRIEF_LIMIT}</small></h2><button className="brief-button" onClick={() => { setSelectedId(null); setDraft(blank(locale)); setNotice(text('새 초안을 시작했습니다.', 'Started a new draft.')) }}><Plus size={16} />{text('새 초안', 'New draft')}</button></div>{!session.userId ? <p>{text('로그인하면 계정에 저장한 브리핑을 확인할 수 있습니다. 위 초안은 이 브라우저에 남습니다.', 'Sign in to see briefs saved to your account. The draft above stays in this browser.')}</p> : saved.length === 0 ? <p>{text('저장한 브리핑이 없습니다.', 'No saved briefs yet.')}</p> : saved.map(brief => <article className="saved-brief" key={brief.id}><button className="brief-open" onClick={() => { setDraft(brief.draft); setSelectedId(brief.id); setNotice(text('저장한 초안을 열었습니다. 미리보기는 현재 출처를 사용합니다. 보관본 내보내기는 저장 시점의 문서를 유지합니다.', 'Opened saved draft. Preview uses current sources; Export saved copy preserves the original document.')) }}><FileText size={20} /><span><strong>{brief.draft.title}</strong><small>{brief.snapshotVersion} · {new Date(brief.updatedAt).toLocaleDateString(locale)}</small></span></button><div className="brief-actions"><button className="brief-button" onClick={() => download(brief.markdown, brief.draft.title)}>{text('보관본 내보내기', 'Export saved copy')}</button><button className="brief-button" disabled={busy} aria-label={`${text('삭제', 'Delete')} ${brief.draft.title}`} onClick={() => { if (window.confirm(text('이 브리핑을 계정에서 삭제할까요?', 'Delete this brief from your account?'))) void run(async () => { await call(`/api/briefs/${brief.id}`, 'DELETE'); if (selectedId === brief.id) setSelectedId(null); await refresh() }) }}><Trash2 size={16} /></button></div></article>)}</section>
    </>}
    {session.userId && <div className="account-actions"><button className="brief-button" disabled={busy} onClick={() => void run(refresh)}>{text('구독·목록 새로고침', 'Refresh subscription and library')}</button>{account?.hasSubscription && <button className="brief-button" disabled={busy} onClick={() => void billing('portal')}>{text('결제·갱신 관리', 'Manage billing and renewal')}</button>}</div>}
    {new URLSearchParams(search).has('checkout') && <p className="workspace-hint">{text('결제 화면에서 돌아왔습니다. 구독 상태를 새로고침해 확인하세요.', 'You returned from checkout. Refresh subscription status to confirm access.')}</p>}
    <div aria-live="polite" className="brief-feedback">{busy ? text('처리 중…', 'Working…') : notice}</div>{error && <p role="alert" className="brief-error">{error}</p>}
    <footer className="workspace-footer">{text('출처는 공개하고, 내 작업은 비공개로.', 'Public sources. Private work.')}<button onClick={() => navigate(`/${locale}/data`)}>{text('데이터와 출처 확인', 'Review data and sources')}<ArrowRight size={14} /></button></footer>
  </main></div>
}
