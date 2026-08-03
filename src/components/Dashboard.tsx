import { Component, lazy, Suspense, useMemo, useState, useTransition, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { AppHeader } from '../App'
import { EDGES, fetchDataBundle, filterEdges, isSnapshotReviewOverdue, metricMatchesPeriod, NETWORKS } from '../data'
import type { DashboardFilters, Locale, NetworkId } from '../types'
import { FilterBar } from './FilterBar'
import { NetworkSidebar } from './NetworkSidebar'
import { DetailInspector } from './DetailInspector'
import { FlowTimeline } from './FlowTimeline'
import { useRouter } from '../router'

const FlowMap = lazy(() => import('./FlowMap'))

class MapErrorBoundary extends Component<{ children: ReactNode; locale: Locale }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (this.state.failed) return <div className="map-error" role="alert">{this.props.locale === 'ko' ? '지도를 불러오지 못했습니다. 새로고침 후 다시 시도하세요.' : 'The map could not be loaded. Refresh the page and try again.'}</div>
    return this.props.children
  }
}

function readFilters(params: URLSearchParams): DashboardFilters {
  const read = <T extends string>(key: string, values: readonly T[], fallback: T): T => {
    const value = params.get(key) as T | null
    return value && values.includes(value) ? value : fallback
  }
  return {
    period: read('period', ['all', '2025', '2026'] as const, 'all'),
    currency: read('currency', ['all', 'usd', 'token'] as const, 'all'),
    institution: read('institution', ['all', 'banks', 'market-infrastructure', 'issuer-chain'] as const, 'all'),
    region: read('region', ['all', 'americas', 'emea', 'apac'] as const, 'all'),
  }
}

export function Dashboard({ locale }: { locale: Locale }) {
  const { t } = useTranslation()
  const { pathname, search, navigate } = useRouter()
  const params = useMemo(() => new URLSearchParams(search), [search])
  const [isPending, startTransition] = useTransition()
  const [proMode, setProMode] = useState(true)
  const filters = useMemo(() => readFilters(params), [params])
  const requested = params.get('network') as NetworkId | null
  const selected = NETWORKS.some((item) => item.id === requested) ? requested! : 'chips-fedwire'
  const { data, isLoading, error, refetch, isFetching } = useQuery({ queryKey: ['source-data'], queryFn: fetchDataBundle })
  const metrics = useMemo(() => data?.metrics.filter((metric) => metric.networkId === selected && metricMatchesPeriod(metric, filters.period)) ?? [], [data, filters.period, selected])
  const sources = useMemo(() => data?.sources.filter((source) => metrics.some((metric) => metric.sourceId === source.id)) ?? [], [data, metrics])
  const visibleEdges = useMemo(() => filterEdges(EDGES, filters), [filters])
  const reviewOverdue = data ? isSnapshotReviewOverdue(data.reviewDueAt) : false

  const selectNetwork = (network: NetworkId) => startTransition(() => {
    const next = new URLSearchParams(window.location.search)
    next.set('network', network)
    navigate(`${pathname}?${next.toString()}`, true)
  })

  const updateFilter = <K extends keyof DashboardFilters>(key: K, value: DashboardFilters[K]) => startTransition(() => {
    const next = new URLSearchParams(window.location.search)
    if (value === 'all') next.delete(key)
    else next.set(key, value)
    navigate(`${pathname}?${next.toString()}`, true)
  })

  const resetFilters = () => startTransition(() => {
    setProMode(true)
    navigate(`${pathname}?network=chips-fedwire`, true)
  })

  return (
    <main className={`dashboard ${isPending ? 'is-pending' : ''}`}>
      <AppHeader locale={locale} compact />
      <section className="mode-and-filter">
        <div className="view-toggle" aria-label="View density">
          <button aria-pressed={!proMode} className={!proMode ? 'active' : ''} onClick={() => setProMode(false)}>{t('view.basic')}</button>
          <button aria-pressed={proMode} className={proMode ? 'active' : ''} onClick={() => setProMode(true)}>{t('view.pro')}</button>
        </div>
        <FilterBar proMode={proMode} selected={selected} filters={filters} locale={locale} onSelect={selectNetwork} onFilterChange={updateFilter} onReset={resetFilters} />
        <div className="data-freshness" title={data?.generatedAt} role="status">
          <span>{reviewOverdue ? (locale === 'ko' ? '검토 기한 경과' : 'Review overdue') : t('inspector.updated')}</span><strong>{reviewOverdue ? data?.reviewDueAt : data?.version ?? '—'}</strong><i className={reviewOverdue ? 'stale' : undefined} aria-hidden="true" />
        </div>
      </section>
      <section className="workspace">
        <NetworkSidebar selected={selected} onSelect={selectNetwork} locale={locale} />
        <div className="map-region">
          <MapErrorBoundary locale={locale}>
            <Suspense fallback={<div className="map-loader">Loading map layers…</div>}>
              <FlowMap selected={selected} proMode={proMode} locale={locale} edges={visibleEdges} />
            </Suspense>
          </MapErrorBoundary>
          {error ? <div className="data-status" role="alert"><span>{locale === 'ko' ? '출처 통계를 불러오지 못했습니다. 지도는 계속 사용할 수 있습니다.' : 'Source statistics are unavailable. The map remains available.'}</span><button onClick={() => void refetch()} disabled={isFetching}>{locale === 'ko' ? '다시 시도' : 'Try again'}</button></div> : null}
          {isLoading ? <div className="loading-line" /> : null}
        </div>
        <DetailInspector selected={selected} metrics={metrics} sources={sources} locale={locale} />
      </section>
      <FlowTimeline selected={selected} locale={locale} />
    </main>
  )
}
