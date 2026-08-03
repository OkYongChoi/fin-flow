import { lazy, Suspense, useMemo, useState, useTransition } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { AppHeader } from '../App'
import { EDGES, fetchDataBundle, filterEdges, metricMatchesPeriod, NETWORKS } from '../data'
import type { DashboardFilters, Locale, NetworkId } from '../types'
import { FilterBar } from './FilterBar'
import { NetworkSidebar } from './NetworkSidebar'
import { DetailInspector } from './DetailInspector'
import { FlowTimeline } from './FlowTimeline'
import { useRouter } from '../router'

const FlowMap = lazy(() => import('./FlowMap'))

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
  const { data, isLoading, error } = useQuery({ queryKey: ['source-data'], queryFn: fetchDataBundle })
  const metrics = useMemo(() => data?.metrics.filter((metric) => metric.networkId === selected && metricMatchesPeriod(metric, filters.period)) ?? [], [data, filters.period, selected])
  const sources = useMemo(() => data?.sources.filter((source) => metrics.some((metric) => metric.sourceId === source.id)) ?? [], [data, metrics])
  const visibleEdges = useMemo(() => filterEdges(EDGES, filters), [filters])

  const selectNetwork = (network: NetworkId) => startTransition(() => {
    const next = new URLSearchParams(window.location.search)
    next.set('network', network)
    navigate(`${pathname}?${next.toString()}`, true)
  })

  const updateFilters = (nextFilters: DashboardFilters) => startTransition(() => {
    const next = new URLSearchParams(window.location.search)
    for (const [key, value] of Object.entries(nextFilters)) {
      if (value === 'all') next.delete(key)
      else next.set(key, value)
    }
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
        <FilterBar proMode={proMode} selected={selected} filters={filters} locale={locale} onSelect={selectNetwork} onFiltersChange={updateFilters} onReset={resetFilters} />
        <div className="data-freshness" title={data?.generatedAt} role="status">
          <span>{t('inspector.updated')}</span><strong>{data?.version ?? '—'}</strong><i aria-hidden="true" />
        </div>
      </section>
      <section className="workspace">
        <NetworkSidebar selected={selected} onSelect={selectNetwork} locale={locale} />
        <div className="map-region">
          {error ? <div className="map-error">Source data could not be loaded.</div> : (
            <Suspense fallback={<div className="map-loader">Loading map layers…</div>}>
              <FlowMap selected={selected} proMode={proMode} locale={locale} edges={visibleEdges} />
            </Suspense>
          )}
          {isLoading ? <div className="loading-line" /> : null}
        </div>
        <DetailInspector selected={selected} metrics={metrics} sources={sources} locale={locale} />
      </section>
      <FlowTimeline selected={selected} locale={locale} />
    </main>
  )
}
