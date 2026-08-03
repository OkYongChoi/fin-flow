import { lazy, Suspense, useMemo, useState, useTransition } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { AppHeader } from '../App'
import { fetchDataBundle, NETWORKS } from '../data'
import type { Locale, NetworkId } from '../types'
import { FilterBar } from './FilterBar'
import { NetworkSidebar } from './NetworkSidebar'
import { DetailInspector } from './DetailInspector'
import { FlowTimeline } from './FlowTimeline'
import { useRouter } from '../router'

const FlowMap = lazy(() => import('./FlowMap'))

export function Dashboard({ locale }: { locale: Locale }) {
  const { t } = useTranslation()
  const { pathname, search, navigate } = useRouter()
  const params = useMemo(() => new URLSearchParams(search), [search])
  const [isPending, startTransition] = useTransition()
  const [proMode, setProMode] = useState(true)
  const requested = params.get('network') as NetworkId | null
  const selected = NETWORKS.some((item) => item.id === requested) ? requested! : 'chips-fedwire'
  const { data, isLoading, error } = useQuery({ queryKey: ['source-data'], queryFn: fetchDataBundle })
  const metrics = useMemo(() => data?.metrics.filter((metric) => metric.networkId === selected) ?? [], [data, selected])
  const sources = useMemo(() => data?.sources.filter((source) => metrics.some((metric) => metric.sourceId === source.id)) ?? [], [data, metrics])

  const selectNetwork = (network: NetworkId) => startTransition(() => {
    const next = new URLSearchParams(params)
    next.set('network', network)
    navigate(`${pathname}?${next.toString()}`, true)
  })

  return (
    <main className={`dashboard ${isPending ? 'is-pending' : ''}`}>
      <AppHeader locale={locale} compact />
      <section className="mode-and-filter">
        <div className="view-toggle" aria-label="View density">
          <button className={!proMode ? 'active' : ''} onClick={() => setProMode(false)}>{t('view.basic')}</button>
          <button className={proMode ? 'active' : ''} onClick={() => setProMode(true)}>{t('view.pro')}</button>
        </div>
        <FilterBar proMode={proMode} onReset={() => navigate(`${pathname}?network=chips-fedwire`, true)} />
        <div className="data-freshness" title={data?.generatedAt}>
          <span>{t('inspector.updated')}</span><strong>{data?.version ?? '—'}</strong><i aria-hidden="true" />
        </div>
      </section>
      <section className="workspace">
        <NetworkSidebar selected={selected} onSelect={selectNetwork} locale={locale} />
        <div className="map-region">
          {error ? <div className="map-error">Source data could not be loaded.</div> : (
            <Suspense fallback={<div className="map-loader">Loading map layers…</div>}>
              <FlowMap selected={selected} proMode={proMode} locale={locale} />
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
