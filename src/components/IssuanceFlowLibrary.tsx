import { Check, Copy, ExternalLink, FileStack, GitCompareArrows, Search, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { getIssuanceCategory, getIssuanceCategoryLabel, ISSUANCE_CATEGORIES, ISSUANCE_FLOWS } from '../issuanceFlows'
import { useRouter } from '../router'
import type { IssuanceCategory } from '../issuanceFlows'
import type { Locale } from '../types'

const DEFAULT_ISSUANCE_FLOW_ID = 'agency-mbs'

export function IssuanceFlowLibrary({ locale }: { locale: Locale }) {
  const { pathname, search, navigate } = useRouter()
  const params = useMemo(() => new URLSearchParams(search), [search])
  const requestedId = params.get('issuance')
  const requestedComparisonId = params.get('compareIssuance')
  const selectedId = ISSUANCE_FLOWS.some((item) => item.id === requestedId) ? requestedId! : DEFAULT_ISSUANCE_FLOW_ID
  const flow = ISSUANCE_FLOWS.find((item) => item.id === selectedId) ?? ISSUANCE_FLOWS[0]
  const comparisonFlow = ISSUANCE_FLOWS.find((item) => item.id === requestedComparisonId && item.id !== selectedId)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<'all' | IssuanceCategory>('all')
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle')

  useEffect(() => {
    if ((!requestedId || requestedId === selectedId) && (!requestedComparisonId || comparisonFlow)) return
    const next = new URLSearchParams(search)
    if (requestedId && requestedId !== selectedId) next.delete('issuance')
    if (requestedComparisonId && !comparisonFlow) next.delete('compareIssuance')
    navigate(`${pathname}?${next.toString()}`, true)
  }, [comparisonFlow, navigate, pathname, requestedComparisonId, requestedId, search, selectedId])

  useEffect(() => { setCopyStatus('idle') }, [search])

  const filteredFlows = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase(locale)
    return ISSUANCE_FLOWS.filter((item) => {
      if (category !== 'all' && getIssuanceCategory(item.id) !== category) return false
      if (!needle) return true
      const itemCategory = getIssuanceCategoryLabel(getIssuanceCategory(item.id), locale)
      return [item.label.ko, item.label.en, item.summary.ko, item.summary.en, item.source.provider, itemCategory]
        .some((value) => value.toLocaleLowerCase(locale).includes(needle))
    })
  }, [category, locale, query])

  const updateUrl = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(search)
    Object.entries(updates).forEach(([key, value]) => value === null ? next.delete(key) : next.set(key, value))
    navigate(`${pathname}?${next.toString()}`, true)
  }

  const selectFlow = (id: string) => updateUrl({ issuance: id, compareIssuance: requestedComparisonId === id ? null : requestedComparisonId })
  const startComparison = () => {
    const selectedCategory = getIssuanceCategory(selectedId)
    const nextFlow = ISSUANCE_FLOWS.find((item) => item.id !== selectedId && getIssuanceCategory(item.id) === selectedCategory)
      ?? ISSUANCE_FLOWS.find((item) => item.id !== selectedId)
    updateUrl({ compareIssuance: nextFlow?.id ?? null })
  }
  const copyViewLink = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable')
      await navigator.clipboard.writeText(window.location.href)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('failed')
    }
  }

  return <section className="issuance-library" aria-labelledby="issuance-library-title">
    <header className="issuance-library-heading">
      <div><span><FileStack size={15} aria-hidden="true" />{locale === 'ko' ? '증권 발행 절차' : 'Securities issuance procedures'}</span><strong>{ISSUANCE_FLOWS.length}</strong></div>
      <h3 id="issuance-library-title">{locale === 'ko' ? '발행 경로를 찾고 나란히 비교하세요' : 'Find and compare issuance paths side by side'}</h3>
    </header>

    {!comparisonFlow ? <>
      <div className="issuance-discovery">
        <label className="issuance-search">
          <span>{locale === 'ko' ? '절차 검색' : 'Search procedures'}</span>
          <span><Search size={13} aria-hidden="true" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={locale === 'ko' ? '예: 국채, IPO, SEC' : 'Try Treasury, IPO, or SEC'} />{query ? <button type="button" onClick={() => setQuery('')} aria-label={locale === 'ko' ? '검색어 지우기' : 'Clear search'}><X size={12} /></button> : null}</span>
        </label>
        <label className="issuance-category">
          <span>{locale === 'ko' ? '분류' : 'Category'}</span>
          <select value={category} onChange={(event) => setCategory(event.target.value as typeof category)}>
            <option value="all">{locale === 'ko' ? '전체 분류' : 'All categories'}</option>
            {ISSUANCE_CATEGORIES.map((item) => <option key={item.id} value={item.id}>{item.label[locale]}</option>)}
          </select>
        </label>
      </div>

      <div className="issuance-results-heading"><span>{locale === 'ko' ? '검색 결과' : 'Matching paths'}</span><strong aria-live="polite">{filteredFlows.length}</strong></div>
      {filteredFlows.length ? <div className="issuance-results" role="list" aria-label={locale === 'ko' ? '발행 절차 검색 결과' : 'Issuance procedure results'}>
        {filteredFlows.map((item) => <button type="button" key={item.id} className={item.id === selectedId ? 'selected' : ''} aria-pressed={item.id === selectedId} onClick={() => selectFlow(item.id)}>
          <span><b>{item.label[locale]}</b><small>{getIssuanceCategoryLabel(getIssuanceCategory(item.id), locale)} · {item.source.provider}</small></span>
          <i>{item.steps.length}</i>
        </button>)}
      </div> : <p className="issuance-empty">{locale === 'ko' ? '일치하는 절차가 없습니다. 검색어나 분류를 바꿔보세요.' : 'No matching paths. Try another search or category.'}</p>}
    </> : null}

    <article className="issuance-selected-card" aria-live="polite">
      <header>
        <div><span>{getIssuanceCategoryLabel(getIssuanceCategory(flow.id), locale)}</span><h4>{flow.label[locale]}</h4></div>
        <div className="issuance-card-actions">
          <button type="button" onClick={comparisonFlow ? () => updateUrl({ compareIssuance: null }) : startComparison} aria-pressed={Boolean(comparisonFlow)}><GitCompareArrows size={13} />{comparisonFlow ? (locale === 'ko' ? '비교 닫기' : 'Close compare') : (locale === 'ko' ? '경로 비교' : 'Compare')}</button>
          <button type="button" onClick={() => void copyViewLink()} aria-label={locale === 'ko' ? '현재 보기 링크 복사' : 'Copy current view link'}>{copyStatus === 'copied' ? <Check size={13} /> : <Copy size={13} />}</button>
        </div>
      </header>

      {comparisonFlow ? <>
        <label className="issuance-compare-select"><span>{locale === 'ko' ? '비교 절차 선택' : 'Choose comparison path'}</span><select value={comparisonFlow.id} onChange={(event) => updateUrl({ compareIssuance: event.target.value })}>{ISSUANCE_CATEGORIES.map((item) => <optgroup key={item.id} label={item.label[locale]}>{ISSUANCE_FLOWS.filter((candidate) => candidate.id !== selectedId && getIssuanceCategory(candidate.id) === item.id).map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.label[locale]}</option>)}</optgroup>)}</select></label>
        <div className="issuance-compare-signal"><GitCompareArrows size={13} /><span>{flow.steps.length === comparisonFlow.steps.length ? (locale === 'ko' ? `두 경로 모두 ${flow.steps.length}단계` : `Both paths use ${flow.steps.length} stages`) : (locale === 'ko' ? `${flow.steps.length}단계와 ${comparisonFlow.steps.length}단계 비교` : `${flow.steps.length} versus ${comparisonFlow.steps.length} stages`)}</span><i /> <span>{flow.source.provider === comparisonFlow.source.provider ? (locale === 'ko' ? `동일 제공기관 ${flow.source.provider}` : `Same provider: ${flow.source.provider}`) : (locale === 'ko' ? '서로 다른 출처 제공기관' : 'Different source providers')}</span></div>
        <div className="issuance-comparison-grid">
          {[flow, comparisonFlow].map((item, index) => <section key={item.id} aria-label={index === 0 ? (locale === 'ko' ? '기준 경로' : 'Primary path') : (locale === 'ko' ? '비교 경로' : 'Comparison path')}>
            <span>{index === 0 ? (locale === 'ko' ? '기준' : 'Primary') : (locale === 'ko' ? '비교' : 'Compare')}</span>
            <h5>{item.label[locale]}</h5>
            <ol>{item.steps.map((step, stepIndex) => <li key={step.en}><i>{stepIndex + 1}</i><b>{step[locale]}</b></li>)}</ol>
            <small>{item.boundary[locale]}</small>
            <a href={item.source.url} target="_blank" rel="noreferrer"><span><b>{item.source.provider}</b><small>{item.source.title}</small></span><ExternalLink size={12} aria-hidden="true" /></a>
          </section>)}
        </div>
      </> : <div className="issuance-flow-detail">
        <p>{flow.summary[locale]}</p>
        <ol>{flow.steps.map((step, index) => <li key={step.en}><i>{index + 1}</i><b>{step[locale]}</b></li>)}</ol>
        <small>{flow.boundary[locale]}</small>
        <a href={flow.source.url} target="_blank" rel="noreferrer"><span><b>{flow.source.provider}</b><small>{flow.source.title}</small></span><ExternalLink size={14} aria-hidden="true" /></a>
      </div>}
    </article>
    <span className={`issuance-copy-status ${copyStatus === 'failed' ? 'failed' : ''}`} role="status" aria-live="polite">{copyStatus === 'copied' ? (locale === 'ko' ? '현재 보기 링크를 복사했습니다.' : 'Current view link copied.') : copyStatus === 'failed' ? (locale === 'ko' ? '링크를 복사하지 못했습니다.' : 'Could not copy the link.') : ''}</span>
  </section>
}
