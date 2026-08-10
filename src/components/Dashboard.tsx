import { lazy, Suspense, useEffect, useMemo, useTransition } from 'react'
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
  const proMode = params.get('mode') !== 'basic'
  const requested = params.get('network') as NetworkId | null
  const hasValidNetwork = NETWORKS.some((item) => item.id === requested)
  const selected = hasValidNetwork ? requested! : 'chips-fedwire'
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['source-data'], queryFn: fetchDataBundle })
  const metrics = useMemo(() => data?.metrics.filter((metric) => metric.networkId === selected) ?? [], [data, selected])
  const sources = useMemo(() => data?.sources.filter((source) => metrics.some((metric) => metric.sourceId === source.id)) ?? [], [data, metrics])

  const updateView = (updates: Record<string, string | null>) => startTransition(() => {
    const next = new URLSearchParams(params)
    Object.entries(updates).forEach(([key, value]) => value === null ? next.delete(key) : next.set(key, value))
    navigate(`${pathname}?${next.toString()}`, true)
  })
  const selectNetwork = (network: NetworkId) => updateView({ network })
  const setViewMode = (nextProMode: boolean) => updateView({ mode: nextProMode ? null : 'basic' })
  const resetView = () => updateView({ network: 'chips-fedwire', mode: null })
  useEffect(() => {
    if (requested === null || hasValidNetwork) return
    const next = new URLSearchParams(search)
    next.delete('network')
    navigate(`${pathname}${next.size ? `?${next.toString()}` : ''}`, true)
  }, [hasValidNetwork, navigate, pathname, requested, search])

  return (
    <main id="main-content" tabIndex={-1} className={`dashboard ${isPending ? 'is-pending' : ''}`}>
      <AppHeader locale={locale} compact />
      <section className="mode-and-filter">
        <div className="view-toggle" role="group" aria-label={t('view.density')}>
          <button type="button" aria-pressed={!proMode} className={!proMode ? 'active' : ''} onClick={() => setViewMode(false)}>{t('view.basic')}</button>
          <button type="button" aria-pressed={proMode} className={proMode ? 'active' : ''} onClick={() => setViewMode(true)}>{t('view.pro')}</button>
        </div>
        <FilterBar proMode={proMode} selected={selected} locale={locale} onNetworkChange={selectNetwork} onReset={resetView} />
        <div className="data-freshness" title={data?.generatedAt} role="status" aria-live="polite" aria-label={locale === 'ko' ? '데이터 스냅샷 버전' : 'Data snapshot version'}>
          <span>{t('inspector.updated')}</span><strong>{data?.version ?? '—'}</strong><i aria-hidden="true" />
        </div>
      </section>
      <section className="workspace">
        <NetworkSidebar selected={selected} onSelect={selectNetwork} locale={locale} />
        <div className="map-region">
          {error ? <div className="map-error" role="alert"><span>{t('data.loadError')}</span><button type="button" onClick={() => void refetch()}>{t('data.retry')}</button></div> : (
            <Suspense fallback={<div className="map-loader" role="status">{t('data.loadingMap')}</div>}>
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
