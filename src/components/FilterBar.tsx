import { CalendarDays, RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { NETWORKS } from '../data'
import type { DashboardFilters, Locale, NetworkId } from '../types'

const OPTIONS = {
  period: ['all', '2025', '2026'],
  currency: ['all', 'usd', 'token'],
  institution: ['all', 'banks', 'market-infrastructure', 'issuer-chain'],
  region: ['all', 'americas', 'emea', 'apac'],
} as const

export function FilterBar({ proMode, selected, filters, locale, onSelect, onFiltersChange, onReset }: { proMode: boolean; selected: NetworkId; filters: DashboardFilters; locale: Locale; onSelect: (network: NetworkId) => void; onFiltersChange: (filters: DashboardFilters) => void; onReset: () => void }) {
  const { t } = useTranslation()
  if (!proMode) return <div className="basic-notice"><span>{t('notices.schematic')}</span></div>
  const update = <K extends keyof DashboardFilters>(key: K, value: DashboardFilters[K]) => onFiltersChange({ ...filters, [key]: value })
  const optionLabel = (key: keyof DashboardFilters, value: string) => value === 'all' ? t('filters.all') : t(`filterOptions.${key}.${value}`)
  return (
    <div className="filter-bar">
      <label className="filter-control">
        <span>{t('filters.period')}</span>
        <span className="select-with-icon"><CalendarDays size={13} /><select aria-label={t('filters.period')} value={filters.period} onChange={(event) => update('period', event.target.value as DashboardFilters['period'])}>{OPTIONS.period.map((value) => <option key={value} value={value}>{optionLabel('period', value)}</option>)}</select></span>
      </label>
      <label className="filter-control"><span>{t('filters.currency')}</span><select value={filters.currency} onChange={(event) => update('currency', event.target.value as DashboardFilters['currency'])}>{OPTIONS.currency.map((value) => <option key={value} value={value}>{optionLabel('currency', value)}</option>)}</select></label>
      <label className="filter-control">
        <span>{t('filters.network')}</span>
        <select value={selected} onChange={(event) => onSelect(event.target.value as NetworkId)}>
          {NETWORKS.map((network) => <option key={network.id} value={network.id}>{locale === 'ko' ? network.label : network.labelEn}</option>)}
        </select>
      </label>
      <label className="filter-control"><span>{t('filters.institution')}</span><select value={filters.institution} onChange={(event) => update('institution', event.target.value as DashboardFilters['institution'])}>{OPTIONS.institution.map((value) => <option key={value} value={value}>{optionLabel('institution', value)}</option>)}</select></label>
      <label className="filter-control"><span>{t('filters.region')}</span><select value={filters.region} onChange={(event) => update('region', event.target.value as DashboardFilters['region'])}>{OPTIONS.region.map((value) => <option key={value} value={value}>{optionLabel('region', value)}</option>)}</select></label>
      <div className="filter-flags">
        <span><i className="status-dot observed" />{t('filters.observed')}</span>
        <span><i className="status-dot simulation" />{t('filters.simulation')}</span>
      </div>
      <button className="reset-button" onClick={onReset} disabled={selected === 'chips-fedwire' && Object.values(filters).every((value) => value === 'all')}><RotateCcw size={13} />{t('filters.reset')}</button>
    </div>
  )
}
