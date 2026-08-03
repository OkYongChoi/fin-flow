import { CalendarDays, RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const FILTERS = [
  ['period', '2025–2026'], ['currency', 'USD'], ['network', '5'], ['institution', 'all'], ['region', 'all'],
] as const

export function FilterBar({ proMode, onReset }: { proMode: boolean; onReset: () => void }) {
  const { t } = useTranslation()
  if (!proMode) return <div className="basic-notice"><span>{t('notices.schematic')}</span></div>
  return (
    <div className="filter-bar">
      {FILTERS.map(([label, value], index) => (
        <label key={label} className="filter-control">
          <span>{t(`filters.${label}`)}</span>
          <button>{index === 0 ? <CalendarDays size={13} /> : null}<b>{value === 'all' ? t('filters.all') : value}</b><i>⌄</i></button>
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
