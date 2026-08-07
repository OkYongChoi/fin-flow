import { CalendarDays, RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { NETWORKS } from '../data'
import type { Locale, NetworkId } from '../types'

const FILTERS = [
  ['period', '2025–2026'], ['currency', 'USD'], ['network', '5'], ['institution', 'all'], ['region', 'all'],
] as const

export function FilterBar({ proMode, selected, locale, onNetworkChange, onReset }: { proMode: boolean; selected: NetworkId; locale: Locale; onNetworkChange: (network: NetworkId) => void; onReset: () => void }) {
  const { t } = useTranslation()
  if (!proMode) return <div className="basic-notice"><span>{t('notices.schematic')}</span></div>
  return (
    <div className="filter-bar">
      {FILTERS.map(([label, value], index) => (
        <label key={label} className="filter-control">
          <span>{t(`filters.${label}`)}</span>
          {label === 'network' ? <select value={selected} aria-label={t('filters.network')} onChange={(event) => onNetworkChange(event.target.value as NetworkId)}>{NETWORKS.map((network) => <option key={network.id} value={network.id}>{locale === 'ko' ? network.label : network.labelEn}</option>)}</select> : <button type="button" aria-label={`${t(`filters.${label}`)}: ${value === 'all' ? t('filters.all') : value}`} title={locale === 'ko' ? '이 데이터 스냅샷의 고정 범위입니다.' : 'This is the fixed scope of the data snapshot.'}>{index === 0 ? <CalendarDays size={13} /> : null}<b>{value === 'all' ? t('filters.all') : value}</b></button>}
        </label>
      ))}
      <div className="filter-flags">
        <span><i className="status-dot observed" />{t('filters.observed')}</span>
        <span><i className="status-dot simulation" />{t('filters.simulation')}</span>
      </div>
      <button className="reset-button" onClick={onReset}><RotateCcw size={13} />{t('filters.reset')}</button>
    </div>
  )
}
