import { useEffect, useId, useRef } from 'react'
import { ArrowRight, BookOpen, Link, Search } from 'lucide-react'
import { NETWORKS } from '../data'
import { FINANCE_GLOSSARY, findFinanceTerms } from '../financeGlossary'
import { useRouter } from '../router'
import type { Locale } from '../types'
import './FinanceGlossary.css'

export default function FinanceGlossary({ locale }: { locale: Locale }) {
  const ko = locale === 'ko'
  const { pathname, search, navigate } = useRouter()
  const params = new URLSearchParams(search)
  const requested = params.get('term')
  const selected = FINANCE_GLOSSARY.find(term => term.id === requested)
  const query = selected ? '' : params.get('q') ?? ''
  const terms = findFinanceTerms(query)
  const searchId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const termRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const next = new URLSearchParams(search)
    if (selected && next.has('q')) {
      next.delete('q')
      navigate(`${pathname}?${next}`, true)
    }
  }, [selected, search, pathname, navigate])
  useEffect(() => {
    if (selected) { termRef.current?.focus({ preventScroll: true }); termRef.current?.scrollIntoView({ block: 'nearest' }) }
  }, [selected?.id])
  const setQuery = (value: string) => {
    const next = new URLSearchParams(search)
    next.delete('term')
    if (value) next.set('q', value)
    else next.delete('q')
    navigate(`${pathname}${next.size ? `?${next}` : ''}`, true)
  }
  const reset = () => { setQuery(''); inputRef.current?.focus() }
  return <section className="finance-glossary" id="finance-glossary" aria-labelledby="finance-glossary-title">
    <header className="finance-glossary-heading"><div><span className="finance-glossary-kicker"><BookOpen size={15} aria-hidden="true" />{ko ? '금융의 기본 언어' : 'THE LANGUAGE OF FINANCE'}</span><h2 id="finance-glossary-title">{ko ? '헷갈리는 금융 용어, 여기서 찾아보세요' : 'Make sense of unfamiliar finance terms'}</h2><p>{ko ? '쉬운 뜻과 혼동하기 쉬운 차이를 읽고, 실제 금융 흐름의 설명으로 이어가세요.' : 'Read a plain-language definition, see what it differs from, then explore a related financial flow.'}</p></div></header>
    <form role="search" aria-label={ko ? '금융 용어 찾기' : 'Find finance terms'} className="finance-glossary-search" onSubmit={event => event.preventDefault()}>
      <label htmlFor={searchId}>{ko ? '금융 용어 검색' : 'Search finance terms'}</label>
      <div><Search size={18} aria-hidden="true" /><input ref={inputRef} id={searchId} type="search" maxLength={100} value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === 'Escape') reset() }} aria-describedby={`${searchId}-hint`} placeholder={ko ? '예: 승인, 해외 송금, RTGS' : 'Try: clearing, bank transfer, RTGS'} />{(query || requested) && <button type="button" onClick={reset}>{ko ? '검색 초기화' : 'Clear search'}</button>}</div>
      <small id={`${searchId}-hint`}>{ko ? '한국어·영어·약어와 관련 표현으로 찾을 수 있습니다.' : 'Search Korean or English terms, acronyms and related phrases.'}</small>
    </form>
    <p className="finance-glossary-results" role="status">{ko ? `${terms.length}개 용어` : `${terms.length} terms`}{requested && !selected ? (ko ? ' · 링크의 용어를 찾지 못했습니다. 아래에서 다시 찾아보세요.' : ' · The linked term was not found. Browse or search below.') : ''}</p>
    {!terms.length && <div className="finance-glossary-empty"><p>{ko ? '일치하는 용어가 없습니다. 짧은 단어나 다른 언어로 다시 검색해 보세요.' : 'No matching terms. Try a shorter phrase or the other language.'}</p><button type="button" className="brief-button" onClick={reset}>{ko ? '모든 용어 보기' : 'Show all terms'}</button></div>}
    <div className="finance-glossary-grid">{terms.map(term => <article key={term.id} id={`finance-term-${term.id}`} ref={selected?.id === term.id ? termRef : undefined} tabIndex={-1} className={`finance-glossary-card${selected?.id === term.id ? ' selected' : ''}`} aria-labelledby={`finance-term-${term.id}-title`}>
      <div className="finance-glossary-card-heading"><h3 id={`finance-term-${term.id}-title`}>{term.label[locale]}</h3><span lang={ko ? 'en' : 'ko'}>{term.label[ko ? 'en' : 'ko']}</span></div>
      <p>{term.definition[locale]}</p><div className="finance-glossary-distinction"><strong>{ko ? '이것과는 달라요' : 'Keep this distinction'}</strong><p>{term.distinction[locale]}</p></div>
      <div className="finance-glossary-flows">{term.networks.map(id => {
        const network = NETWORKS.find(item => item.id === id)!
        return <button type="button" key={id} onClick={() => navigate(`/${locale}/map?network=${id}`)}>{ko ? `${network.label} 흐름 보기` : `Explore ${network.labelEn}`}<ArrowRight size={14} aria-hidden="true" /></button>
      })}</div>
      <footer><a href={term.source.url} target="_blank" rel="noreferrer">{ko ? '원문' : 'Source'}: {term.source.title} ↗</a><small>{ko ? '설명 원문 확인일' : 'Source checked for this explanation'}: <time dateTime={term.source.reviewedAt}>{term.source.reviewedAt}</time></small><a className="finance-glossary-permalink" href={`/${locale}/learn?term=${term.id}`} aria-label={ko ? `${term.label.ko} 바로가기` : `Direct link to ${term.label.en}`} onClick={event => { if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && event.button === 0) { event.preventDefault(); navigate(`/${locale}/learn?term=${term.id}`) } }}><Link size={13} aria-hidden="true" />{ko ? '이 용어 링크' : 'Link to this term'}</a></footer>
    </article>)}</div>
    <p className="finance-glossary-method">{ko ? '지급·결제 인프라에서 쓰는 뜻을 쉽게 풀었습니다. 확인일은 설명의 원문을 검토한 날이며, 앱의 시장 수치 기준일이나 출처의 발행일이 아닙니다.' : 'These explanations focus on payment and settlement infrastructure. The check date records our review of the explanatory source; it is not a market-data snapshot date or the source’s publication date.'}</p>
  </section>
}
