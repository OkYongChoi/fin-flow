import { CalendarDays, Database, RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { NETWORKS } from '../data'
import type { Locale, Metric, NetworkId, SourceRecord } from '../types'

const unique = (values: string[]) => [...new Set(values)]

export function FilterBar({ selected, locale, metrics, sources, generatedAt, onNetworkChange, onReset }: { selected: NetworkId; locale: Locale; metrics: Metric[]; sources: SourceRecord[]; generatedAt?: string; onNetworkChange: (network: NetworkId) => void; onReset: () => void }) {
  const { t } = useTranslation()
  const coverage = unique(metrics.map((metric) => metric.coveragePeriod)).join(' · ') || '—'
  const units = unique(metrics.map((metric) => metric.unit)).join(' · ') || '—'
  const updated = generatedAt ? new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', { dateStyle: 'medium' }).format(new Date(generatedAt)) : '—'
  return (
    <div className="filter-bar">
      <div className="filter-control"><span>{t('filters.coverage')}</span><div className="filter-value" title={coverage}><CalendarDays size={13} /><b>{coverage}</b></div></div>
      <label className="filter-control"><span>{t('filters.network')}</span><select value={selected} aria-label={t('filters.network')} onChange={(event) => onNetworkChange(event.target.value as NetworkId)}>{NETWORKS.map((network) => <option key={network.id} value={network.id}>{locale === 'ko' ? network.label : network.labelEn}</option>)}</select></label>
      <div className="filter-control"><span>{t('filters.metrics')}</span><div className="filter-value"><Database size={13} /><b>{metrics.length} · {units}</b></div></div>
      <div className="filter-control"><span>{t('filters.sources')}</span><div className="filter-value"><b>{sources.length}</b></div></div>
      <div className="filter-flags"><span><i className="status-dot observed" />{t('filters.sourceSnapshot')}</span><span>{updated}</span></div>
      <button className="reset-button" onClick={onReset}><RotateCcw size={13} />{t('filters.reset')}</button>
    </div>
  )
}
