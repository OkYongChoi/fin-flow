import { useEffect, useMemo, useState, useTransition } from 'react'
import { useQuery } from '@tanstack/react-query'
import { sourceDataQueryOptions } from '../sourceDataQuery'
import { useTranslation } from 'react-i18next'
import { AppHeader } from '../App'
import { NETWORKS, networkSources } from '../data'
import type { Locale, NetworkId } from '../types'
import { FilterBar } from './FilterBar'
import { NetworkSidebar } from './NetworkSidebar'
import { SourceDataBoard } from './SourceDataBoard'
import { SourceDetails } from './SourceDetails'
import { SourceTimeline } from './SourceTimeline'
import { useRouter } from '../router'

export function Dashboard({ locale }: { locale: Locale }) {
  const { t } = useTranslation()
  const { pathname, search, navigate } = useRouter()
  const params = useMemo(() => new URLSearchParams(search), [search])
  const [networkQuery, setNetworkQuery] = useState('')
  const [isPending, startTransition] = useTransition()
  const requested = params.get('network') as NetworkId | null
  const hasValidNetwork = NETWORKS.some((item) => item.id === requested)
  const selected = hasValidNetwork ? requested! : 'chips-fedwire'
  const { data, isLoading, error, refetch } = useQuery(sourceDataQueryOptions)
  const metrics = useMemo(() => data?.metrics.filter((metric) => metric.networkId === selected) ?? [], [data, selected])
  const sources = useMemo(() => data ? networkSources([selected], data) : [], [data, selected])

  const updateView = (updates: Record<string, string | null>) => startTransition(() => {
    const next = new URLSearchParams(params)
    Object.entries(updates).forEach(([key, value]) => value === null ? next.delete(key) : next.set(key, value))
    navigate(`${pathname}${next.size ? `?${next.toString()}` : ''}`, true)
  })
  const selectNetwork = (network: NetworkId) => updateView({ network })
  const resetView = () => {
    setNetworkQuery('')
    updateView({ network: null, mode: null, issuance: null, compareIssuance: null })
  }
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
        {data && <FilterBar selected={selected} locale={locale} metrics={metrics} sources={sources} generatedAt={data.generatedAt} onNetworkChange={selectNetwork} onReset={resetView} />}
        <div className="data-freshness" title={data?.generatedAt} role="status" aria-live="polite" aria-label={locale === 'ko' ? '데이터 스냅샷 버전' : 'Data snapshot version'}>
          <span>{t('inspector.updated')}</span><strong>{data?.version ?? '—'}</strong><i aria-hidden="true" />
        </div>
      </section>
      <section className={`workspace ${!data || error ? 'is-data-unavailable' : ''}`}>
        <NetworkSidebar query={networkQuery} onQueryChange={setNetworkQuery} selected={selected} onSelect={selectNetwork} locale={locale} data={error ? undefined : data} />
        <div className="map-region">
          {isLoading ? <div className="data-state" role="status" aria-live="polite"><h2>{locale === 'ko' ? '출처 데이터 불러오는 중…' : 'Loading source data…'}</h2><p>{locale === 'ko' ? '선택한 네트워크의 지표와 원문을 준비하고 있습니다.' : 'Preparing the metrics and sources for your selected network.'}</p></div> : error ? <div className="map-error data-state" role="alert"><span>{t('data.loadError')}</span><p>{locale === 'ko' ? '네트워크 선택은 유지됩니다. 다시 시도하거나 학습 가이드에서 계속하세요.' : 'Your network selection is kept. Retry or continue with a learning guide.'}</p><button type="button" onClick={() => void refetch()}>{t('data.retry')}</button><button type="button" className="brief-button" onClick={() => navigate(`/${locale}/learn`)}>{locale === 'ko' ? '학습 가이드 열기' : 'Open learning guides'}</button></div> : (
            <SourceDataBoard selected={selected} metrics={metrics} sources={sources} generatedAt={data?.generatedAt} reviewDueAt={data?.reviewDueAt} locale={locale} />
          )}
          {isLoading ? <div className="loading-line" /> : null}
        </div>
        {data && !error && <SourceDetails selected={selected} metrics={metrics} sources={sources} locale={locale} />}
      </section>
      {data && !error && <SourceTimeline selected={selected} sources={sources} generatedAt={data.generatedAt} locale={locale} />}
    </main>
  )
}
