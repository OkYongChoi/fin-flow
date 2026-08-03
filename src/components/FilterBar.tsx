import { CalendarDays, RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { NETWORKS } from '../data'
import type { Locale, NetworkId } from '../types'

const SUMMARIES = [['period', '2025–2026'], ['currency', 'USD'], ['institution', 'all'], ['region', 'all']] as const

export function FilterBar({ proMode, selected, locale, onSelect, onReset }: { proMode: boolean; selected: NetworkId; locale: Locale; onSelect: (network: NetworkId) => void; onReset: () => void }) {
  const { t } = useTranslation()
  if (!proMode) return <div className="basic-notice"><span>{t('notices.schematic')}</span></div>
  return (
    <div className="filter-bar">
      {SUMMARIES.slice(0, 2).map(([label, value], index) => (
        <div key={label} className="filter-control filter-summary">
          <span>{t(`filters.${label}`)}</span>
          <span className="filter-value">{index === 0 ? <CalendarDays size={13} /> : null}<b>{value}</b></span>
        </div>
      ))}
      <label className="filter-control">
        <span>{t('filters.network')}</span>
        <select value={selected} onChange={(event) => onSelect(event.target.value as NetworkId)}>
          {NETWORKS.map((network) => <option key={network.id} value={network.id}>{locale === 'ko' ? network.label : network.labelEn}</option>)}
        </select>
      </label>
      {SUMMARIES.slice(2).map(([label, value]) => (
        <div key={label} className="filter-control filter-summary">
          <span>{t(`filters.${label}`)}</span>
          <span className="filter-value"><b>{value === 'all' ? t('filters.all') : value}</b></span>
        </div>
      ))}
      <div className="filter-flags">
        <span><i className="status-dot observed" />{t('filters.observed')}</span>
        <span><i className="status-dot simulation" />{t('filters.simulation')}</span>
      </div>
      <button className="reset-button" onClick={onReset}><RotateCcw size={13} />{t('filters.reset')}</button>
    </div>
  )
}
