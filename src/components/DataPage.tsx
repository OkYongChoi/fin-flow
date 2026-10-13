import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { sourceDataQueryOptions } from '../sourceDataQuery'
import { ExternalLink, FileCheck2, RefreshCw, Search, ShieldCheck, X } from 'lucide-react'
import { AppHeader } from '../App'
import { isSnapshotReviewOverdue, networkCoverage } from '../data'
import type { Locale } from '../types'
import { useRouter } from '../router'

export default function DataPage({ locale }: { locale: Locale }) {
  const { navigate } = useRouter()
  const { data, isLoading, error, refetch } = useQuery(sourceDataQueryOptions)
  const copy = locale === 'ko'
  const coverage = useMemo(() => data ? networkCoverage(data) : [], [data])

  const [sourceSearch, setSourceSearch] = useState('')
  const [providerFilter, setProviderFilter] = useState('all')
  const [cadenceFilter, setCadenceFilter] = useState('all')
  const [networkStatusFilter, setNetworkStatusFilter] = useState<'all' | 'with-metrics' | 'guide-only'>('all')

  const sources = useMemo(() => data?.sources ?? [], [data?.sources])
  const providers = useMemo(() => Array.from(new Set(sources.map(s => s.provider))).sort(), [sources])
  const cadences = useMemo(() => Array.from(new Set(sources.map(s => s.cadence))).sort(), [sources])

  const filteredSources = useMemo(() => {
    return sources.filter(source => {
      if (providerFilter !== 'all' && source.provider !== providerFilter) return false
      if (cadenceFilter !== 'all' && source.cadence !== cadenceFilter) return false
      if (sourceSearch.trim()) {
        const q = sourceSearch.trim().toLowerCase()
        const match = source.provider.toLowerCase().includes(q) ||
                      source.title.toLowerCase().includes(q) ||
                      source.coveragePeriod.toLowerCase().includes(q)
        if (!match) return false
      }
      return true
    })
  }, [sources, providerFilter, cadenceFilter, sourceSearch])

  const hasActiveSourceFilters = sourceSearch.trim() !== '' || providerFilter !== 'all' || cadenceFilter !== 'all'

  const resetSourceFilters = () => {
    setSourceSearch('')
    setProviderFilter('all')
    setCadenceFilter('all')
  }

  const filteredCoverage = useMemo(() => {
    if (networkStatusFilter === 'with-metrics') return coverage.filter(c => c.metrics > 0)
    if (networkStatusFilter === 'guide-only') return coverage.filter(c => c.metrics === 0)
    return coverage
  }, [coverage, networkStatusFilter])

  const reviewOverdue = data?.reviewDueAt ? isSnapshotReviewOverdue(data.reviewDueAt) : false

  const registryStatus = isLoading
    ? (copy ? '출처 데이터 불러오는 중…' : 'Loading source data…')
    : error
    ? (copy ? '출처 데이터를 불러올 수 없습니다' : 'Source data unavailable')
    : data?.sources.length === 0
    ? (copy ? '이 스냅샷에 수록된 출처 없음' : 'No sources in this snapshot')
    : hasActiveSourceFilters
    ? (copy ? `검색 결과 ${filteredSources.length}건 (전체 ${sources.length}건)` : `${filteredSources.length} of ${sources.length} sources`)
    : `${data?.generatedAt.slice(0, 10)} snapshot`

  return (
    <main id="main-content" tabIndex={-1} className="data-page">
      <AppHeader locale={locale} />
      <section className="data-heading">
        <span>{copy ? '데이터 원칙' : 'Data principles'}</span>
        <h1>{copy ? '숫자보다 먼저 출처를 보여줍니다.' : 'The source comes before the number.'}</h1>
        <p>{copy ? '서로 다른 금융망의 공개 자료는 빈도와 단위가 다릅니다. Flow of Money는 이 차이를 감추지 않습니다.' : 'Public datasets across financial rails differ in cadence and units. Flow of Money makes those differences visible.'}</p>
        <div className="data-heading-stats">
          <span><b>{data?.version ?? '—'}</b>{copy ? '데이터 버전' : 'Data version'}</span>
          <span><b>{data?.sources.length ?? '—'}</b>{copy ? '공식 출처' : 'Official sources'}</span>
          <span><b>{data?.metrics.length ?? '—'}</b>{copy ? '스냅샷 지표' : 'Snapshot metrics'}</span>
          <span><b>{data?.generatedAt ? data.generatedAt.slice(0, 10) : '—'}</b>{copy ? '스냅샷 생성' : 'Generated'}</span>
          <span><b>{data?.reviewDueAt ? data.reviewDueAt.slice(0, 10) : '—'}</b>{reviewOverdue ? (copy ? '검토 기한 경과' : 'Review overdue') : (copy ? '다음 검토' : 'Review due')}</span>
        </div>
      </section>
      {data?.coverageNotice ? <p className="coverage-notice" role="note">{data.coverageNotice}</p> : null}
      <section className="method-strip">
        <div><FileCheck2 /><h2>{copy ? '원문 연결' : 'Primary links'}</h2><p>{copy ? '모든 지표는 원 발행기관 문서로 돌아갑니다.' : 'Every metric links back to its original publisher.'}</p></div>
        <div><RefreshCw /><h2>{copy ? '버전 고정' : 'Versioned snapshots'}</h2><p>{copy ? '수집일과 적용 기간을 데이터와 함께 보존합니다.' : 'Retrieval and coverage dates stay attached to data.'}</p></div>
        <div><ShieldCheck /><h2>{copy ? '표현 구분' : 'Representation labels'}</h2><p>{copy ? '집계 통계, 구조도, 시뮬레이션을 명시합니다.' : 'Aggregates, schematics and simulations are explicit.'}</p></div>
      </section>
      {data && !error && (
        <section className="source-registry" aria-labelledby="coverage-title">
          <header><h2 id="coverage-title">{copy ? '네트워크별 데이터 수록 현황' : 'Data coverage by network'}</h2></header>
          <p>{copy ? '개수는 이 스냅샷에 수록된 항목입니다. 시장 전체의 데이터 완전성이나 실시간 제공을 뜻하지 않습니다.' : 'Counts describe this snapshot, not complete market coverage or a live feed.'}</p>
          <div className="coverage-filter-bar" role="group" aria-label={copy ? '네트워크 수록 상태 필터' : 'Network coverage filter'}>
            <button
              type="button"
              className={`filter-chip ${networkStatusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setNetworkStatusFilter('all')}
              aria-pressed={networkStatusFilter === 'all'}
            >
              {copy ? `전체 (${coverage.length})` : `All (${coverage.length})`}
            </button>
            <button
              type="button"
              className={`filter-chip ${networkStatusFilter === 'with-metrics' ? 'active' : ''}`}
              onClick={() => setNetworkStatusFilter('with-metrics')}
              aria-pressed={networkStatusFilter === 'with-metrics'}
            >
              {copy ? `검증 지표 있음 (${coverage.filter(c => c.metrics > 0).length})` : `With verified metrics (${coverage.filter(c => c.metrics > 0).length})`}
            </button>
            <button
              type="button"
              className={`filter-chip ${networkStatusFilter === 'guide-only' ? 'active' : ''}`}
              onClick={() => setNetworkStatusFilter('guide-only')}
              aria-pressed={networkStatusFilter === 'guide-only'}
            >
              {copy ? `절차 가이드 중심 (${coverage.filter(c => c.metrics === 0).length})` : `Process guide only (${coverage.filter(c => c.metrics === 0).length})`}
            </button>
          </div>
          <div className="coverage-grid">
            {filteredCoverage.map(item => (
              <article key={item.id}>
                <h3>{copy ? item.label : item.labelEn}</h3>
                <p>{copy ? `지표 ${item.metrics}개 · 출처 ${item.sources}개` : `${item.metrics} metrics · ${item.sources} sources`}</p>
                <p>{item.unlinked ? (copy ? `출처 레코드 누락: 지표 ${item.unlinked}개` : `Missing source records for ${item.unlinked} metrics`) : !item.metrics ? (copy ? '지표 미수록 · 절차 가이드로 시작하세요.' : 'No metrics recorded. Start with the process guide.') : !item.sources ? (copy ? '출처 미수록 · 다시 불러오기를 시도하세요.' : 'No sources recorded. Try reloading.') : (copy ? '지표와 원문을 함께 확인할 수 있습니다.' : 'Metrics and their source records are available.')}</p>
                <button className="brief-button" onClick={() => navigate(`/${locale}/map?network=${item.id}`)}>{copy ? `${item.label} 확인` : `Review ${item.labelEn}`}</button>
              </article>
            ))}
          </div>
          {coverage.some(item => !item.metrics || !item.sources || item.unlinked) && <button className="brief-button" onClick={() => void refetch()}>{copy ? '누락 데이터 다시 확인' : 'Retry missing data'}</button>}
        </section>
      )}
      <section className="source-registry">
        <header>
          <div>
            <h2 id="source-registry-title">{copy ? '출처 레지스트리' : 'Source registry'}</h2>
            <p className="registry-subtitle">{copy ? '공식 발행 기관의 원문과 기준일, 갱신 주기를 직접 검증할 수 있습니다.' : 'Verify primary links, coverage periods, retrieval dates, and update cadences.'}</p>
          </div>
          <span id="source-registry-status" role="status" aria-live="polite">{registryStatus}</span>
        </header>

        {data && !error && data.sources.length > 0 && (
          <div className="source-filter-toolbar">
            <div className="source-search-box">
              <Search size={15} aria-hidden="true" />
              <input
                type="search"
                value={sourceSearch}
                onChange={(e) => setSourceSearch(e.target.value)}
                placeholder={copy ? '출처 기관, 제목, 적용 기간 검색…' : 'Search provider, title, coverage period…'}
                aria-label={copy ? '출처 검색' : 'Search sources'}
              />
              {sourceSearch && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setSourceSearch('')}
                  aria-label={copy ? '검색어 지우기' : 'Clear search'}
                >
                  <X size={14} aria-hidden="true" />
                </button>
              )}
            </div>
            <div className="source-filter-selects">
              <select
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value)}
                aria-label={copy ? '발행 기관 필터' : 'Filter by provider'}
              >
                <option value="all">{copy ? '모든 기관' : 'All providers'}</option>
                {providers.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <select
                value={cadenceFilter}
                onChange={(e) => setCadenceFilter(e.target.value)}
                aria-label={copy ? '갱신 주기 필터' : 'Filter by cadence'}
              >
                <option value="all">{copy ? '모든 갱신 주기' : 'All cadences'}</option>
                {cadences.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {hasActiveSourceFilters && (
                <button
                  type="button"
                  className="brief-button reset-filter-btn"
                  onClick={resetSourceFilters}
                >
                  {copy ? '필터 초기화' : 'Reset filters'}
                </button>
              )}
            </div>
          </div>
        )}

        <div className="source-table" role="table" aria-labelledby="source-registry-title" aria-describedby="source-registry-status" aria-busy={isLoading}>
          <div className="source-row source-head" role="row">
            <span role="columnheader">{copy ? '기관·자료' : 'Provider & dataset'}</span>
            <span role="columnheader">{copy ? '적용 기간' : 'Coverage'}</span>
            <span role="columnheader">{copy ? '갱신' : 'Cadence'}</span>
            <span role="columnheader">{copy ? '발행일' : 'Published'}</span>
            <span role="columnheader">{copy ? '조회일' : 'Retrieved'}</span>
            <span role="columnheader">{copy ? '원문' : 'Source'}</span>
          </div>
          {filteredSources.map((source) => (
            <div className="source-row" role="row" key={source.id}>
              <span role="cell"><b>{source.provider}</b><small>{source.title}</small></span>
              <span role="cell">{source.coveragePeriod}</span>
              <span role="cell">{source.cadence}</span>
              <span role="cell"><time dateTime={source.publishedAt}>{source.publishedAt}</time></span>
              <span role="cell"><time dateTime={source.retrievedAt}>{source.retrievedAt}</time></span>
              <span role="cell"><a href={source.url} target="_blank" rel="noreferrer" aria-label={copy ? `${source.provider} 원문 새 탭에서 열기` : `Open ${source.provider} source in a new tab`}><ExternalLink size={14} aria-hidden="true" />{copy ? '열기' : 'Open'}</a></span>
            </div>
          ))}
        </div>

        {filteredSources.length === 0 && data && data.sources.length > 0 && (
          <div className="source-empty" role="status">
            <p>{copy ? '조건에 맞는 출처가 없습니다.' : 'No sources match the selected criteria.'}</p>
            <button type="button" className="brief-button" onClick={resetSourceFilters}>
              {copy ? '필터 초기화' : 'Reset filters'}
            </button>
          </div>
        )}

        {error ? <div role="alert">{copy ? '출처 레지스트리를 사용할 수 없습니다.' : 'The source registry is unavailable.'}<button type="button" className="retry-button" onClick={() => void refetch()}>{copy ? '데이터 다시 불러오기' : 'Retry data load'}</button></div> : null}
        {!isLoading && !error && data?.sources.length === 0 && <div className="data-state"><h2>{copy ? '확인할 원문이 아직 없습니다' : 'No sources to review yet'}</h2><p>{copy ? '다시 불러오거나 학습 가이드에서 절차를 먼저 살펴보세요.' : 'Reload the registry or start with the process explanations in the learning guides.'}</p><div className="brief-actions"><button className="brief-button" onClick={() => void refetch()}>{copy ? '데이터 다시 불러오기' : 'Retry data load'}</button><button className="brief-button" onClick={() => navigate(`/${locale}/learn`)}>{copy ? '학습 가이드 열기' : 'Open learning guides'}</button></div></div>}
      </section>
    </main>
  )
}
