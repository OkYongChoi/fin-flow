import { useQuery } from '@tanstack/react-query'
import { ExternalLink, FileCheck2, RefreshCw, ShieldCheck } from 'lucide-react'
import { AppHeader } from '../App'
import { fetchDataBundle, networkCoverage } from '../data'
import type { Locale } from '../types'
import { useRouter } from '../router'

export default function DataPage({ locale }: { locale: Locale }) {
  const { navigate } = useRouter()
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['source-data'], queryFn: fetchDataBundle })
  const copy = locale === 'ko'
  const coverage = data ? networkCoverage(data) : []
  const registryStatus = isLoading ? (copy ? '출처 데이터 불러오는 중…' : 'Loading source data…') : error ? (copy ? '출처 데이터를 불러올 수 없습니다' : 'Source data unavailable') : data?.sources.length === 0 ? (copy ? '이 스냅샷에 수록된 출처 없음' : 'No sources in this snapshot') : `${data?.generatedAt.slice(0, 10)} snapshot`

  return (
    <main id="main-content" tabIndex={-1} className="data-page">
      <AppHeader locale={locale} />
<section className="data-heading"><span>{copy ? '데이터 원칙' : 'Data principles'}</span><h1>{copy ? '숫자보다 먼저 출처를 보여줍니다.' : 'The source comes before the number.'}</h1><p>{copy ? '서로 다른 금융망의 공개 자료는 빈도와 단위가 다릅니다. Flow of Money는 이 차이를 감추지 않습니다.' : 'Public datasets across financial rails differ in cadence and units. Flow of Money makes those differences visible.'}</p><div><span><b>{data?.version ?? '—'}</b>{copy ? '데이터 버전' : 'Data version'}</span><span><b>{data?.sources.length ?? '—'}</b>{copy ? '공식 출처' : 'Official sources'}</span><span><b>{data?.metrics.length ?? '—'}</b>{copy ? '스냅샷 지표' : 'Snapshot metrics'}</span></div></section>
      {data?.coverageNotice ? <p className="coverage-notice" role="note">{data.coverageNotice}</p> : null}
      <section className="method-strip"><div><FileCheck2 /><h2>{copy ? '원문 연결' : 'Primary links'}</h2><p>{copy ? '모든 지표는 원 발행기관 문서로 돌아갑니다.' : 'Every metric links back to its original publisher.'}</p></div><div><RefreshCw /><h2>{copy ? '버전 고정' : 'Versioned snapshots'}</h2><p>{copy ? '수집일과 적용 기간을 데이터와 함께 보존합니다.' : 'Retrieval and coverage dates stay attached to data.'}</p></div><div><ShieldCheck /><h2>{copy ? '표현 구분' : 'Representation labels'}</h2><p>{copy ? '집계 통계, 구조도, 시뮬레이션을 명시합니다.' : 'Aggregates, schematics and simulations are explicit.'}</p></div></section>
      {data && !error && <section className="source-registry" aria-labelledby="coverage-title">
        <header><h2 id="coverage-title">{copy ? '네트워크별 데이터 수록 현황' : 'Data coverage by network'}</h2></header>
        <p>{copy ? '개수는 이 스냅샷에 수록된 항목입니다. 시장 전체의 데이터 완전성이나 실시간 제공을 뜻하지 않습니다.' : 'Counts describe this snapshot, not complete market coverage or a live feed.'}</p>
        <div className="coverage-grid">{coverage.map(item => <article key={item.id}>
          <h3>{copy ? item.label : item.labelEn}</h3>
          <p>{copy ? `지표 ${item.metrics}개 · 출처 ${item.sources}개` : `${item.metrics} metrics · ${item.sources} sources`}</p>
          <p>{item.unlinked ? (copy ? `출처 레코드 누락: 지표 ${item.unlinked}개` : `Missing source records for ${item.unlinked} metrics`) : !item.metrics ? (copy ? '지표 미수록 · 절차 가이드로 시작하세요.' : 'No metrics recorded. Start with the process guide.') : !item.sources ? (copy ? '출처 미수록 · 다시 불러오기를 시도하세요.' : 'No sources recorded. Try reloading.') : (copy ? '지표와 원문을 함께 확인할 수 있습니다.' : 'Metrics and their source records are available.')}</p>
          <button className="brief-button" onClick={() => navigate(`/${locale}/map?network=${item.id}`)}>{copy ? `${item.label} 확인` : `Review ${item.labelEn}`}</button>
        </article>)}</div>
        {coverage.some(item => !item.metrics || !item.sources || item.unlinked) && <button className="brief-button" onClick={() => void refetch()}>{copy ? '누락 데이터 다시 확인' : 'Retry missing data'}</button>}
      </section>}
      <section className="source-registry">
        <header><h2 id="source-registry-title">{copy ? '출처 레지스트리' : 'Source registry'}</h2><span id="source-registry-status" role="status" aria-live="polite">{registryStatus}</span></header>
        <div className="source-table" role="table" aria-labelledby="source-registry-title" aria-describedby="source-registry-status" aria-busy={isLoading}>
          <div className="source-row source-head" role="row"><span role="columnheader">{copy ? '기관·자료' : 'Provider & dataset'}</span><span role="columnheader">{copy ? '적용 기간' : 'Coverage'}</span><span role="columnheader">{copy ? '갱신' : 'Cadence'}</span><span role="columnheader">{copy ? '원문' : 'Source'}</span></div>
          {data?.sources.map((source) => <div className="source-row" role="row" key={source.id}><span role="cell"><b>{source.provider}</b><small>{source.title}</small></span><span role="cell">{source.coveragePeriod}</span><span role="cell">{source.cadence}</span><span role="cell"><a href={source.url} target="_blank" rel="noreferrer" aria-label={copy ? `${source.provider} 원문 새 탭에서 열기` : `Open ${source.provider} source in a new tab`}><ExternalLink size={14} aria-hidden="true" />{copy ? '열기' : 'Open'}</a></span></div>)}
        </div>
        {error ? <div role="alert">{copy ? '출처 레지스트리를 사용할 수 없습니다.' : 'The source registry is unavailable.'}<button type="button" className="retry-button" onClick={() => void refetch()}>{copy ? '데이터 다시 불러오기' : 'Retry data load'}</button></div> : null}
        {!isLoading && !error && data?.sources.length === 0 && <div className="data-state"><h2>{copy ? '확인할 원문이 아직 없습니다' : 'No sources to review yet'}</h2><p>{copy ? '다시 불러오거나 학습 가이드에서 절차를 먼저 살펴보세요.' : 'Reload the registry or start with the process explanations in the learning guides.'}</p><div className="brief-actions"><button className="brief-button" onClick={() => void refetch()}>{copy ? '데이터 다시 불러오기' : 'Retry data load'}</button><button className="brief-button" onClick={() => navigate(`/${locale}/learn`)}>{copy ? '학습 가이드 열기' : 'Open learning guides'}</button></div></div>}
      </section>
    </main>
  )
}
