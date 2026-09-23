import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { sourceDataQueryOptions } from '../sourceDataQuery'
import { ArrowRight, BookOpen, Check, Cloud, Download, FileText, Plus, Printer, RotateCcw } from 'lucide-react'
import { AppHeader } from '../App'
import { NETWORKS, isSnapshotReviewOverdue } from '../data'
import { briefMarkdown, CLOUD_BRIEF_LIMIT, parseBrief, PRO_PRICE_USD, type BriefDraft, type SavedBrief } from '../briefs'
import { useRouter } from '../router'
import type { Locale, NetworkId } from '../types'

import { BriefLibrary } from './workspace/BriefLibrary'
import { LocalBriefNotebook } from './workspace/LocalBriefNotebook'
import { BriefReferenceContent } from './workspace/BriefReferenceContent'
import { BriefFileTools } from './workspace/BriefFileTools'
import { BRIEF_TEMPLATES, blankDraft, clearHandoff, fingerprint, freshWorking, loadWorking, pendingHandoff, persistWorking, stageHandoff, templateDraft, type WorkingDraft } from '../workspaceDrafts'
export interface Session { userId: string | null; getToken: () => Promise<string | null>; ready: boolean; controls?: React.ReactNode; signIn?: (label: string, before: () => void) => React.ReactNode }
interface Account { userId: string; pro: boolean; hasSubscription: boolean; checkout: boolean; environment: string }
function download(markdown: string, name: string) {
  const url = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown;charset=utf-8' }))
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${name.replace(/[^a-zA-Z0-9가-힣_-]/g, '_').slice(0,80) || 'brief'}.md`; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
}
const noSession: Session = { userId: null, getToken: async () => null, ready: true }
const ConnectedWorkspace = lazy(() => import('./workspace/ConnectedWorkspace'))
export default function WorkspacePage(props: { locale: Locale; pricing?: boolean }) {
  const key = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
  return key ? <Suspense fallback={<div role="status" className="workspace-main">{props.locale === 'ko' ? '계정 확인 중…' : 'Checking your account…'}</div>}><ConnectedWorkspace {...props} publishableKey={key} /></Suspense> : <Workspace {...props} session={noSession} />
}
export function Workspace({ locale, pricing, session }: { locale: Locale; pricing?: boolean; session: Session }) {
  const ko = locale === 'ko'; const text = (a: string, b: string) => ko ? a : b
  const { navigate, search } = useRouter()
  const [working, setWorking] = useState(() => loadWorking(session.userId, locale))
  const draft = working.draft
  const documentText = (a: string, b: string) => draft.locale === 'ko' ? a : b
  const setDraft = (next: BriefDraft | ((current: BriefDraft) => BriefDraft)) => { setUndo(null); setExported(false); setWorking(current => ({ ...current, draft: typeof next === 'function' ? next(current.draft) : next })) }
  const [templatesOpen, setTemplatesOpen] = useState(() => fingerprint(draft) === fingerprint(blankDraft(draft.locale)))
  const [saved, setSaved] = useState<SavedBrief[]>([])
  const { data: sourceData, isError: dataError, refetch: loadSources } = useQuery({ ...sourceDataQueryOptions, enabled: !pricing })
  // A failed refresh must not leave a stale snapshot silently exportable.
  const data = dataError ? null : sourceData ?? null
  const [account, setAccount] = useState<Account | null>(null)
  const [accountState, setAccountState] = useState<'loading' | 'ready' | 'error'>(session.userId ? 'loading' : 'ready')
  const [offer, setOffer] = useState<{ checkout: boolean; environment: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [errorCode, setErrorCode] = useState('')
  const [storageError, setStorageError] = useState(false)
  const [exported, setExported] = useState(false)
  const [undo, setUndo] = useState<WorkingDraft | null>(null)
  const [replacement, setReplacement] = useState<WorkingDraft | null>(null)
  const [handoff, setHandoff] = useState(() => session.userId ? pendingHandoff(session.userId) : null)
  const titleRef = useRef<HTMLInputElement>(null)
  const previewRef = useRef<HTMLElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const notesRef = useRef<HTMLTextAreaElement>(null)
  const operationLock = useRef(false)
  const saveAttempt = useRef<{ id: string; fingerprint: string; revision: number | null } | null>(null)
  const checkoutOffer = account ?? offer
  const requestedNetwork = NETWORKS.find(network => network.id === new URLSearchParams(search).get('network'))
  const clearRequestedNetwork = () => { const next = new URLSearchParams(search); next.delete('network'); navigate(`/${locale}/workspace${next.size ? `?${next}` : ''}`, true) }
  useEffect(() => { window.scrollTo(0, 0) }, [pricing])
  const validDraft = parseBrief(draft)
  const dirty = working.savedFingerprint !== fingerprint(draft)
  const archivedBrief = saved.find(brief => brief.id === working.id)
  const focusEditor = () => { titleRef.current?.focus(); titleRef.current?.scrollIntoView({ block: 'center' }) }
  const showPreview = () => { previewRef.current?.focus(); previewRef.current?.scrollIntoView({ block: 'start' }) }
  useEffect(() => {
    if (pricing) return
    let closedDetails: HTMLDetailsElement[] = []
    const beforePrint = () => {
      if (closedDetails.length) return
      closedDetails = [...(previewRef.current?.querySelectorAll<HTMLDetailsElement>('details:not([open])') ?? [])]
      closedDetails.forEach(details => { details.open = true })
    }
    const afterPrint = () => { closedDetails.forEach(details => { details.open = false }); closedDetails = [] }
    window.addEventListener('beforeprint', beforePrint)
    window.addEventListener('afterprint', afterPrint)
    return () => { afterPrint(); window.removeEventListener('beforeprint', beforePrint); window.removeEventListener('afterprint', afterPrint) }
  }, [pricing])
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
  useEffect(() => {
    try { persistWorking(session.userId, working); setStorageError(false) } catch { setStorageError(true) }
  }, [working, session.userId])
  useEffect(() => {
    if (handoff && fingerprint(handoff) === fingerprint(draft)) {
      clearHandoff(); setHandoff(null)
      setNotice(text('로그인 전 초안을 이어서 작성합니다. 계정 저장은 별도로 선택하세요.', 'Your pre-sign-in draft is ready. Choose Save to account when you want to keep it in the cloud.'))
    }
  }, [handoff, draft])
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (storageError) { event.preventDefault(); event.returnValue = '' } }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [storageError])
  useEffect(() => {
    if (replacement && !dialogRef.current?.open) dialogRef.current?.showModal()
    if (!replacement && dialogRef.current?.open) dialogRef.current.close()
  }, [replacement])
  const call = async (path: string, method = 'GET', body?: unknown, revision?: number | null) => {
    const token = await session.getToken()
    if (!token) throw new Error('sign_in_required')
    const response = await fetch(path, { method, headers: { Authorization: `Bearer ${token}`, 'X-Expected-User': session.userId ?? '', ...(body ? { 'Content-Type': 'application/json' } : {}), ...(revision != null ? { 'If-Match': String(revision) } : {}) }, body: body ? JSON.stringify(body) : undefined, cache: 'no-store' })
    if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('temporarily_unavailable')
    const result = await response.json()
    if (!response.ok) throw new Error(result.error ?? 'temporarily_unavailable')
    return result
  }
  const errorText = (reason: unknown) => {
    const code = reason instanceof Error ? reason.message : ''
    if (code === 'brief_version_conflict') return text('다른 기기에서 수정된 문서입니다. 현재 초안을 내보내거나 별도 사본으로 저장한 뒤, 목록에서 최신 문서를 여세요.', 'This brief changed on another device. Export your draft or save a separate copy, then reopen the latest version from your library.')
    if (code === 'pro_required') return text('클라우드 저장에는 Pro 구독이 필요합니다. 현재 초안은 내보낼 수 있습니다.', 'Cloud saving requires Pro. You can still export this draft.')
    if (code === 'checkout_pending') return text('기존 결제를 확인 중입니다. 다시 결제하지 말고 구독 상태를 새로고침해 주세요.', 'An existing checkout needs confirmation. Refresh subscription status before starting another payment.')
    if (code === 'subscription_exists') return text('기존 구독이 있습니다. 결제 관리에서 확인해 주세요.', 'An existing subscription needs attention. Open billing management.')
    if (code === 'brief_limit_or_conflict') return text('저장 한도에 도달했거나 문서가 변경되었습니다. 목록을 새로고침해 주세요.', 'The save limit was reached or the document changed. Refresh your library.')
    if (code === 'sign_in_required') return text('로그인 후 다시 시도해 주세요.', 'Please sign in and try again.')
    return text('계정 서비스에 연결하지 못했습니다. 초안은 유지됩니다. 내보내기 또는 다시 시도를 선택하세요.', 'Could not reach account services. Your draft is preserved. Export it or try again.')
  }
  const run = async (action: () => Promise<void>) => {
    if (operationLock.current) return
    operationLock.current = true; setBusy(true); setError(''); setErrorCode(''); setNotice('')
    try { await action() } catch (reason) { setError(errorText(reason)); setErrorCode(reason instanceof Error ? reason.message : '') }
    finally { operationLock.current = false; setBusy(false) }
  }
  const refresh = async () => {
    try {
      const [next, library] = await Promise.all([call('/api/account') as Promise<Account>, call('/api/briefs') as Promise<{ briefs: SavedBrief[] }>])
      if (next.userId !== session.userId) throw new Error('sign_in_required')
      setAccount(next); setSaved(library.briefs); setAccountState('ready')
    } catch (reason) { setAccountState('error'); throw reason }
  }
  useEffect(() => { if (session.ready && session.userId) void run(refresh) }, [session.userId, session.ready])
  const toggle = (id: NetworkId) => setDraft(current => ({ ...current, networks: current.networks.includes(id) ? current.networks.filter(item => item !== id) : current.networks.length < 4 ? [...current.networks, id] : current.networks }))
  const exportDraft = () => { if (validDraft && data) { download(briefMarkdown(validDraft, data), validDraft.title); setExported(true); setNotice(text('브리핑을 내보냈습니다. 다음 작업은 새 초안이나 저장본 복사로 시작하세요.', 'Brief exported. Start your next task from a new draft or a copy of a saved brief.')) } }
  const applyWorking = (next: WorkingDraft) => {
    setUndo(working); setWorking(next); setReplacement(null); setExported(false); setError(''); setErrorCode(''); saveAttempt.current = null
    setNotice(text('초안을 열었습니다. 이전 초안으로 되돌릴 수 있습니다.', 'Draft opened. You can undo this replacement.'))
    requestAnimationFrame(focusEditor)
  }
  const replaceWorking = (next: WorkingDraft) => {
    if (operationLock.current) { setNotice(text('저장 처리가 끝난 뒤 초안을 바꿔 주세요.', 'Wait for the current operation before replacing the draft.')); return }
    if (fingerprint(next.draft) === fingerprint(draft) && next.id === working.id) { focusEditor(); return }
    if (dirty && (draft.notes.trim() || draft.title !== blankDraft(draft.locale).title || JSON.stringify(draft.networks) !== JSON.stringify(blankDraft(draft.locale).networks))) setReplacement(next)
    else applyWorking(next)
  }
  const prepareSignIn = () => { try { stageHandoff(draft) } catch { setStorageError(true) } }
  const signInControl = (label: string) => session.signIn?.(label, prepareSignIn)
  const save = (copy = false) => run(async () => {
    if (!validDraft) return
    const submitted = fingerprint(validDraft)
    if (!saveAttempt.current || saveAttempt.current.fingerprint !== submitted || copy) saveAttempt.current = { id: copy ? crypto.randomUUID() : working.id ?? crypto.randomUUID(), fingerprint: submitted, revision: copy ? null : working.revision }
    const attempt = saveAttempt.current
    const response = await call(`/api/briefs/${attempt.id}`, 'PUT', validDraft, attempt.revision) as { brief: SavedBrief }
    // Keep edits typed while the save was in flight; mark only the submitted version saved.
    setWorking(current => ({ ...current, id: response.brief.id, revision: response.brief.updatedAt, savedFingerprint: submitted }))
    setSaved(current => [response.brief, ...current.filter(brief => brief.id !== response.brief.id)])
    saveAttempt.current = null
    setNotice(text('계정에 저장했습니다. 내 브리핑에서 다시 열거나 복사할 수 있습니다.', 'Saved to your account. Reopen or duplicate it from My briefs.'))
  })
  const billing = (kind: 'checkout' | 'portal') => run(async () => {
    const result = await call(`/api/billing/${kind}`, 'POST', { locale })
    const url = new URL(result.url)
    if (url.protocol !== 'https:' || url.username || url.password || !(url.hostname === 'creem.io' || url.hostname.endsWith('.creem.io'))) throw new Error('invalid_url')
    window.location.assign(url.href)
  })
  return <div className={`workspace-page${pricing ? " pricing-page" : ""}`}><AppHeader locale={locale} /><main id="main-content" tabIndex={-1} className="workspace-main">
    <div className="workspace-topline"><span className="workspace-eyebrow">FLOW OF MONEY / BRIEFING STUDIO</span><div className="brief-actions">{session.controls}{signInControl(text('로그인하고 이어가기', 'Sign in and continue'))}<button className="brief-button" onClick={() => navigate(`/${locale}/${pricing ? 'workspace' : 'pricing'}`)}>{pricing ? text('작업실 열기', 'Open workspace') : text('요금제', 'Plans')}<ArrowRight size={15} /></button></div></div>
    <section className={`workspace-hero ${pricing ? '' : 'workspace-hero-compact'}`}><div><span className="workspace-kicker">{text('탐색에서 설명으로', 'FROM EXPLORING TO EXPLAINING')}</span><h1>{pricing ? text('금융 지식을, 반복해서 쓰는 자산으로.', 'Make financial knowledge reusable.') : text('복잡한 금융 흐름을\n나만의 브리핑으로.', 'Complex financial flows.\nOne clear briefing.')}</h1><p>{text('금융이 궁금한 순간부터 실무에서 설명이 필요한 순간까지. 익숙한 질문으로 시작해 흐름을 비교하고, 근거와 함께 내 말로 정리하세요.', 'For curious minds and people working in finance. Start with an everyday question, compare the flows, and explain what you learn in your own words—with sources.')}</p></div><aside className="workspace-value"><BookOpen size={26} /><strong>{text('근거까지 함께 전달하세요', 'Bring the evidence with you')}</strong><p>{text('절차 · 역할 · 주의점 · 원문 링크', 'Steps · roles · boundaries · source links')}</p><small>{text('한국어 / English · Markdown · PDF', 'English / 한국어 · Markdown · PDF')}</small></aside></section>
    {pricing && <><div role="status" className="brief-feedback">{busy ? text('처리 중…', 'Working…') : notice}</div>{error && <p role="alert" className="brief-error">{error}</p>}{session.userId && accountState === 'loading' && <p role="status">{text('구독 상태 확인 중…', 'Checking subscription status…')}</p>}</>}
    {pricing ? <section className="pricing-grid" aria-label={text('요금제 비교', 'Compare plans')}>
      <article className="plan-card"><span>EXPLORE</span><h2>{text('자유롭게 시작', 'Start exploring')}</h2><p className="plan-price">$0</p><p>{text('금융 구조를 이해하고 첫 브리핑을 작성하세요.', 'Understand the infrastructure and create your first brief.')}</p><ul>{[text('모든 공개 네트워크와 출처', 'All public networks and sources'), text('초안 자동 저장과 브라우저 보관함', 'Autosaved draft and browser notebook'), text('최대 4개 네트워크 비교', 'Compare up to four networks'), text('출처 포함 Markdown 내보내기', 'Markdown export with citations')].map(item => <li key={item}><Check size={16} />{item}</li>)}</ul><button className="brief-button primary" onClick={() => navigate(`/${locale}/workspace`)}>{text('무료로 작성하기', 'Create a free brief')}<ArrowRight size={16} /></button></article>
      <article className="plan-card featured"><span>PRO / {text('개인 작업실', 'PERSONAL WORKSPACE')}</span><h2>{text('작업을 쌓아가는 공간', 'A home for your work')}</h2><p className="plan-price">${PRO_PRICE_USD}<small> / {text('년', 'year')} · USD</small></p><p>{checkoutOffer?.checkout ? text('개인 브리핑을 기기 간에 이어서 작성하세요.', 'Continue your private briefs across devices.') : text('초기 제안 가격. 판매 개시 전입니다.', 'Proposed launch price. Sales are not open yet.')}</p><ul>{[text('무료 기능 모두 포함', 'Everything in Explore'), text(`계정별 비공개 브리핑 ${CLOUD_BRIEF_LIMIT}개`, `${CLOUD_BRIEF_LIMIT} private briefs per account`), text('기기 간 저장·불러오기·수정', 'Save, reopen and edit across devices'), text('저장 시점의 출처·문서 보존', 'Preserve the source snapshot at save time'), text('만료 후에도 읽기·내보내기·삭제', 'Read, export and delete after expiry')].map(item => <li key={item}><Check size={16} />{item}</li>)}</ul>
      {account?.pro ? <p className="brief-status">{text('Pro 사용 중', 'Pro is active')}</p> : checkoutOffer?.checkout && !session.userId ? signInControl(text('로그인하고 Pro 시작', 'Sign in to start Pro')) : account?.checkout ? <button className="brief-button primary" disabled={busy} onClick={() => void billing('checkout')}>{account.environment === 'test' ? text('테스트 결제 열기', 'Open test checkout') : text('연간 Pro 시작', 'Start annual Pro')}</button> : <button className="brief-button" disabled>{text('판매 준비 중', 'Sales opening soon')}</button>}
      <small>{text('연간 자동 갱신 · 세금 포함 제안 가격 · 체험 결제 없음. 결제 관리에서 갱신을 취소할 수 있습니다.', 'Annual auto-renewal · proposed tax-inclusive price · no paid trial. Cancel renewal through billing management.')}</small></article>
    </section> : <>
      <section className="brief-start" aria-labelledby="brief-start-title"><div className="start-heading"><div><h2 id="brief-start-title">{templatesOpen ? text('무엇이 궁금한가요?', 'What are you curious about?') : text('작성하던 초안을 이어가세요', 'Pick up where you left off')}</h2><p>{templatesOpen ? text('일상의 궁금증을 고르거나 업무·교육 자료로 시작하세요. 용어 안내부터 출처 확인까지, 가입 없이 이용할 수 있습니다.', 'Start with an everyday question or a work or teaching task. Plain-language guidance and sources are available without signing up.') : text('초안을 복원했습니다. 다른 템플릿을 열어도 바꾸기 전에 확인합니다.', 'Your draft is restored. Switching templates asks before replacing your work.')}</p></div><div className="brief-actions"><button className="brief-button" onClick={focusEditor}>{text('초안 이어서 작성', 'Continue draft')}</button><button className="brief-button" aria-expanded={templatesOpen} aria-controls="brief-templates" onClick={() => setTemplatesOpen(open => !open)}>{templatesOpen ? text('템플릿 접기', 'Hide templates') : text('다른 템플릿 보기', 'Browse templates')}</button></div></div><div id="brief-templates" className="brief-templates" hidden={!templatesOpen}>{BRIEF_TEMPLATES.map(template => <button key={template.id} className="brief-template" onClick={() => { const next = templateDraft(template.id, locale); if (next) replaceWorking(freshWorking(next)) }}><span><small className="template-kind" aria-hidden="true">{template.id.startsWith("everyday-") ? text("일상 속 금융", "EVERYDAY FINANCE") : text("업무와 교육", "WORK & TEACHING")}</small>{template.title[locale]}</span><small>{template.description[locale]}</small><ArrowRight size={17} aria-hidden="true" /></button>)}</div></section>
      <nav className="brief-steps" aria-label={text('브리핑 작성 단계', 'Briefing steps')}><button onClick={focusEditor}><span>01</span>{text('주제와 네트워크', 'Choose your scope')}<small>{draft.networks.length}/4</small></button><button onClick={showPreview}><span>02</span>{text('근거와 메모 확인', 'Review evidence & notes')}<small>{data ? text('미리보기', 'Preview') : text('출처 불러오는 중', 'Loading sources')}</small></button><button onClick={exportDraft} disabled={!validDraft || !data}><span>{exported ? <Check size={14} aria-hidden="true" /> : '03'}</span>{text('내보내고 활용', 'Export & use')}<small>{exported ? text('내보냄', 'Exported') : 'Markdown'}</small></button></nav>
      {requestedNetwork && <div className="workspace-callout"><p>{text('탐색하던 네트워크', 'From your exploration')}: <strong>{ko ? requestedNetwork.label : requestedNetwork.labelEn}</strong></p><div className="brief-actions"><button className="brief-button" disabled={draft.networks.includes(requestedNetwork.id) || draft.networks.length >= 4} onClick={() => { toggle(requestedNetwork.id); clearRequestedNetwork(); focusEditor() }}>{draft.networks.includes(requestedNetwork.id) ? text('이미 선택됨', 'Already selected') : text('초안에 추가', 'Add to draft')}</button><button className="brief-button" onClick={clearRequestedNetwork}>{text('닫기', 'Dismiss')}</button></div>{draft.networks.length >= 4 && !draft.networks.includes(requestedNetwork.id) && <small>{text('추가하려면 현재 선택한 네트워크 하나를 해제하세요.', 'Remove one selected network to add this one.')}</small>}</div>}
      {handoff && <div className="workspace-callout"><p>{text('로그인 전에 작성한 초안이 있습니다. 현재 계정의 편집 내용은 유지했습니다.', 'Your pre-sign-in draft is available. Your existing account draft was kept.')}</p><div className="brief-actions"><button className="brief-button" onClick={() => replaceWorking(freshWorking(handoff))}>{text('로그인 전 초안 열기', 'Open pre-sign-in draft')}</button><button className="brief-button" onClick={() => { clearHandoff(); setHandoff(null) }}>{text('현재 초안 유지', 'Keep current draft')}</button></div></div>}
      <div className="workspace-toolbar"><div><strong>{accountState === 'loading' ? text('계정 확인 중', 'CHECKING ACCOUNT') : accountState === 'error' ? text('계정 연결 확인 필요', 'ACCOUNT UNAVAILABLE') : account?.pro ? 'PRO' : text('무료 초안', 'FREE DRAFT')}</strong><span>{storageError ? text('임시 저장 안 됨', 'Draft not backed up') : session.userId ? text('이 탭에 임시 저장 · 계정 저장은 별도', 'Backed up in this tab · cloud save is separate') : text('이 브라우저에 자동 저장 · 다른 기기와 동기화 안 됨', 'Saved in this browser · not synced to other devices')}</span>{working.id && <span>{dirty ? text('계정에 저장하지 않은 변경 있음', 'Changes not yet saved to your account') : text('계정에 저장된 버전', 'Saved to your account')}</span>}</div><div className="brief-actions"><button className="brief-button" onClick={showPreview}>{text('미리보기로 이동', 'View preview')}</button>{!session.userId && session.ready && <button className="brief-button" onClick={() => { const notebook = document.getElementById('local-notebook'); notebook?.focus(); notebook?.scrollIntoView({ block: 'start' }) }}>{text('브라우저 보관함 열기', 'Open browser notebook')}</button>}<button className="brief-button" disabled={!validDraft || !data} onClick={exportDraft}><Download size={16} />{text('Markdown 내보내기', 'Export Markdown')}</button><button className="brief-button" disabled={!validDraft || !data} onClick={() => window.print()}><Printer size={16} />{text('인쇄 / PDF', 'Print / PDF')}</button>{account?.pro ? <button className="brief-button primary" disabled={busy || !validDraft || !data} onClick={() => void save()}><Cloud size={16} />{text('계정에 저장', 'Save to account')}</button> : <button className="brief-button primary" onClick={() => navigate(`/${locale}/pricing`)}>{text('Pro 저장 알아보기', 'Explore Pro storage')}<ArrowRight size={16} /></button>}</div></div>
      {!validDraft && <p className="workspace-hint" role="status">{text('문서 내보내기와 계정 저장에는 제목과 네트워크 1개 이상이 필요합니다. 파일 백업과 브라우저 보관함은 미완성 초안도 가능합니다.', 'Add a title and at least one network to export a document or save to your account. File backups and the browser notebook also keep unfinished drafts.')}</p>}
      {draft.networks.length === 4 && <p className="workspace-hint">{text('4개를 선택했습니다. 다른 항목을 추가하려면 하나를 해제하세요.', 'Four selected. Remove one to choose a different network.')}</p>}
      {!account?.pro && <p className="workspace-hint">{text('작성·템플릿·내보내기는 무료입니다. Pro는 여러 기기에서 문서를 저장하고 재사용할 때 선택하세요.', 'Writing, templates and export are free. Choose Pro when you need saved work across devices.')}</p>}
      {storageError && <p role="alert" className="brief-error">{text('브라우저 저장이 차단되었습니다. 페이지를 떠나기 전에 내보내기해 주세요.', 'Browser storage is blocked. Export before leaving this page.')}</p>}
      {dataError && <div role="alert" className="brief-error">{text('출처를 불러오지 못했습니다. 초안은 유지됩니다.', 'Sources could not load. Your draft is preserved.')} <button className="brief-button" onClick={() => void loadSources()}>{text('출처 다시 불러오기', 'Retry sources')}</button></div>}
      <div className="brief-feedback" role="status">{busy ? text('처리 중…', 'Working…') : notice}{undo && <button className="brief-button" disabled={busy} onClick={() => { setWorking(undo); setUndo(null); saveAttempt.current = null; setNotice(text('이전 초안을 복원했습니다.', 'Restored the previous draft.')); focusEditor() }}><RotateCcw size={15} />{text('초안 바꾸기 되돌리기', 'Undo draft replacement')}</button>}</div>
      {error && <div role="alert" className="brief-error"><p>{error}</p><div className="brief-actions"><button className="brief-button" disabled={!validDraft || !data} onClick={exportDraft}>{text('초안 내보내기', 'Export draft')}</button>{session.userId && <button className="brief-button" disabled={busy} onClick={() => void run(refresh)}>{text('계정·목록 다시 확인', 'Retry account and library')}</button>}{errorCode === 'brief_version_conflict' && account?.pro && <button className="brief-button" disabled={busy} onClick={() => void save(true)}>{text('별도 사본으로 저장', 'Save a separate copy')}</button>}</div></div>}
      <div className="workspace-grid"><section className="brief-editor" aria-label={text('브리핑 편집', 'Brief editor')}><label>{text('브리핑 제목', 'Brief title')}<input ref={titleRef} aria-invalid={!draft.title.trim()} maxLength={120} value={draft.title} onChange={event => setDraft({ ...draft, title: event.target.value })} /></label><label className="draft-language">{text('문서 언어', 'Document language')}<select value={draft.locale} onChange={event => setDraft({ ...draft, locale: event.target.value as Locale })}><option value="ko">한국어</option><option value="en">English</option></select></label><fieldset><legend>{text('비교할 네트워크', 'Networks to compare')} <small>{draft.networks.length}/4</small></legend><div className="network-choices">{NETWORKS.map(network => <label key={network.id} className={draft.networks.includes(network.id) ? 'selected' : ''}><input type="checkbox" checked={draft.networks.includes(network.id)} disabled={!draft.networks.includes(network.id) && draft.networks.length === 4} onChange={() => toggle(network.id)} /><span>{ko ? network.label : network.labelEn}</span></label>)}</div></fieldset><label>{text('내 관점과 질문', 'Your perspective and questions')}<textarea ref={notesRef} rows={7} maxLength={6000} placeholder={text('새롭게 알게 된 점과 아직 궁금한 점을 내 말로 정리해 보세요.', 'In your own words, what did you learn and what are you still curious about?')} value={draft.notes} onChange={event => setDraft({ ...draft, notes: event.target.value })} /></label><small>{draft.notes.length}/6000 · {text('메모는 출처의 사실과 구분되어 내보내집니다.', 'Notes are exported separately from source-backed facts.')}</small><div className="writing-prompts"><strong>{text('이렇게 정리해 보세요', 'Make it your own')}</strong><p>{text('① 내가 알고 싶은 질문 ② 두 흐름의 차이 ③ 원문으로 확인한 근거 ④ 더 알아볼 점', '① Your question ② How the flows differ ③ Evidence you checked ④ What to explore next')}</p><button className="brief-button" onClick={() => { notesRef.current?.focus(); notesRef.current?.scrollIntoView({ block: 'center' }) }}>{text('내 말로 정리하기', 'Write in my own words')}</button></div></section>
      <section ref={previewRef} lang={draft.locale} tabIndex={-1} className="brief-preview" aria-label={text('브리핑 미리보기', 'Brief preview')}><div className="preview-heading"><FileText size={17} /><span>{documentText('브리핑 미리보기', 'BRIEF PREVIEW')}</span></div><h2>{draft.title || documentText('제목을 입력하세요', 'Add a title')}</h2><p className="snapshot-label">{documentText('데이터 스냅샷', 'Data snapshot')} {data?.version ?? '…'} · {documentText('출처 검토 기한', 'Review due')} {data?.reviewDueAt?.slice(0,10) ?? '…'}</p>{data && isSnapshotReviewOverdue(data.reviewDueAt) && <p className="workspace-hint">{documentText('출처 검토 기한이 지났습니다. 사용 전 원문을 확인하세요.', 'Source review is overdue. Check the original sources before use.')}</p>}
      {archivedBrief && <div className="saved-snapshot-context"><p>{documentText('저장 당시 스냅샷', 'Saved snapshot')}: <strong>{archivedBrief.snapshotVersion}</strong> · {documentText('현재 미리보기', 'Current preview')}: <strong>{data?.version ?? '…'}</strong></p><p>{documentText('미리보기와 새 내보내기는 현재 출처를 사용합니다. 저장 당시 문서는 보관본으로 확인하세요.', 'The preview and new exports use current sources. The original saved document remains available below.')}</p><button className="brief-button" onClick={() => download(archivedBrief.markdown, archivedBrief.draft.title)}>{documentText('저장 당시 문서 내보내기', 'Export original saved document')}</button></div>}
      <BriefReferenceContent networks={draft.networks} data={data} locale={draft.locale} />
      <section className="author-notes"><h3>{draft.locale === 'ko' ? '작성자 메모' : 'Author notes'}</h3><p>{draft.notes || (draft.locale === 'ko' ? '관점과 질문을 더해 브리핑을 완성하세요.' : 'Add your perspective and questions to complete the brief.')}</p></section><p className="workspace-hint">{draft.locale === 'ko' ? '금융 구조 학습용 도식입니다. 실시간 거래 데이터나 투자 조언이 아닙니다.' : 'An educational schematic, not live transaction data or investment advice.'}</p></section></div>
      <BriefFileTools draft={draft} locale={locale} onImport={next => replaceWorking(freshWorking(next))} />
      {!session.userId && session.ready && <LocalBriefNotebook draft={draft} locale={locale} onOpen={next => replaceWorking(freshWorking(next))} />}
      <section className="saved-briefs" aria-labelledby="library-title"><div className="library-heading"><h2 id="library-title">{text('내 브리핑', 'My briefs')} <small>{session.userId && accountState !== 'ready' ? '…' : `${saved.length}/${CLOUD_BRIEF_LIMIT}`}</small></h2><button className="brief-button" onClick={() => replaceWorking(freshWorking(blankDraft(locale)))}><Plus size={16} />{text('새 초안', 'New draft')}</button></div>
        {!session.userId ? <div className="workspace-empty"><p>{text('지금 작성한 초안은 이 브라우저에 남습니다. Pro에서는 계정에 저장한 브리핑을 기기 간에 열고 재사용할 수 있습니다.', 'Your current draft stays in this browser. Pro lets you reopen and reuse saved briefs across devices.')}</p>{signInControl(text('초안을 유지하고 로그인', 'Keep draft and sign in'))}<button className="brief-button" onClick={() => navigate(`/${locale}/pricing`)}>{text('저장 기능 알아보기', 'Explore cloud storage')}</button></div> : <BriefLibrary state={accountState} start={focusEditor} briefs={saved} locale={locale} busy={busy} open={brief => replaceWorking({ draft: brief.draft, id: brief.id, revision: brief.updatedAt, savedFingerprint: fingerprint(brief.draft) })} duplicate={brief => replaceWorking(freshWorking({ ...brief.draft, title: `${brief.draft.title.slice(0,100)} ${text('(사본)', '(copy)')}` }))} download={brief => download(brief.markdown, brief.draft.title)} remove={brief => { if (window.confirm(text('이 브리핑을 계정에서 삭제할까요?', 'Delete this brief from your account?'))) void run(async () => { await call(`/api/briefs/${brief.id}`, 'DELETE'); setSaved(current => current.filter(item => item.id !== brief.id)); if (working.id === brief.id) setWorking(current => freshWorking(current.draft)); setNotice(text('계정의 보관본을 삭제했습니다.', 'Deleted the saved copy from your account.')) }) }} />}
      </section>
    </>}
    {session.userId && <div className="account-actions"><button className="brief-button" disabled={busy} onClick={() => void run(refresh)}>{text('구독·목록 새로고침', 'Refresh subscription and library')}</button>{account?.hasSubscription && <button className="brief-button" disabled={busy} onClick={() => void billing('portal')}>{text('결제·갱신 관리', 'Manage billing and renewal')}</button>}</div>}
    {new URLSearchParams(search).has('checkout') && <p className="workspace-hint">{text('결제 화면에서 돌아왔습니다. 구독 상태를 새로고침해 확인하세요.', 'You returned from checkout. Refresh subscription status to confirm access.')}</p>}

    <dialog ref={dialogRef} className="replace-draft-dialog" aria-labelledby="replace-title" onCancel={() => setReplacement(null)} onClose={() => setReplacement(null)}><h2 id="replace-title">{text('작성 중인 초안을 바꿀까요?', 'Replace your current draft?')}</h2><p>{text('새 초안·템플릿·저장본을 열면 현재 편집 내용이 바뀝니다. 먼저 내보내거나, 바꾼 직후 되돌리기를 사용할 수 있습니다.', 'Opening a template or another brief replaces your current edits. Export first, or use Undo immediately after replacing.')}</p><div className="brief-actions"><button autoFocus className="brief-button" onClick={() => setReplacement(null)}>{text('계속 작성', 'Keep editing')}</button><button className="brief-button" disabled={!validDraft || !data} onClick={exportDraft}>{text('현재 초안 내보내기', 'Export current draft')}</button><button className="brief-button primary" onClick={() => { if (replacement) applyWorking(replacement) }}>{text('초안 바꾸기', 'Replace draft')}</button></div></dialog>
    <footer className="workspace-footer">{text('출처는 공개하고, 내 작업은 비공개로.', 'Public sources. Private work.')}<button onClick={() => navigate(`/${locale}/data`)}>{text('데이터와 출처 확인', 'Review data and sources')}<ArrowRight size={14} /></button></footer>
  </main></div>
}
