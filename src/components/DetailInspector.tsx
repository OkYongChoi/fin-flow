import { ExternalLink, FileText, Landmark, MessageCircle, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NETWORKS } from '../data'
import { getFlowGuide } from '../flowGuides'
import type { Locale, Metric, NetworkId, SourceRecord } from '../types'

export function DetailInspector({ selected, metrics, sources, locale }: { selected: NetworkId; metrics: Metric[]; sources: SourceRecord[]; locale: Locale }) {
  const { t } = useTranslation()
  const [tab, setTab] = useState('route')
  useEffect(() => { setTab('route') }, [selected])
  const network = NETWORKS.find((item) => item.id === selected)!
  const guide = getFlowGuide(selected)
  const tabs = ['route', 'institutions', 'statistics', 'documents'] as const
  const moveTab = (event: React.KeyboardEvent<HTMLButtonElement>, item: typeof tabs[number]) => {
    const current = tabs.indexOf(item)
    const target = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : event.key === 'ArrowRight' ? (current + 1) % tabs.length : event.key === 'ArrowLeft' ? (current - 1 + tabs.length) % tabs.length : -1
    if (target < 0) return
    event.preventDefault()
    setTab(tabs[target])
    document.getElementById(`inspector-tab-${tabs[target]}`)?.focus()
  }
  return (
    <aside className="detail-inspector" aria-labelledby="detail-inspector-title">
      <div className="sheet-handle" />
      <header><div><span>{locale === 'ko' ? '선택 네트워크' : 'Selected network'}</span><h2 id="detail-inspector-title">{selected === 'chips-fedwire' ? t('inspector.title') : (locale === 'ko' ? network.label : network.labelEn)}</h2></div><ShieldCheck size={19} /></header>
      <div className="representation-label"><i />{t('inspector.schematic')}<span>≠ LIVE</span></div>
      <nav className="inspector-tabs" role="tablist" aria-label={locale === 'ko' ? '네트워크 상세 탭' : 'Network detail tabs'}>
        {tabs.map((item) => <button key={item} id={`inspector-tab-${item}`} role="tab" aria-selected={tab === item} aria-controls={`inspector-panel-${item}`} tabIndex={tab === item ? 0 : -1} className={tab === item ? 'active' : ''} onClick={() => setTab(item)} onKeyDown={(event) => moveTab(event, item)}>{t(`inspector.${item}`)}</button>)}
      </nav>
      {tab === 'route' ? <div id="inspector-panel-route" role="tabpanel" aria-labelledby="inspector-tab-route" className="settlement-steps">
        {guide.steps.map((item, index) => <div key={item.en} className="settlement-step"><span>{index + 1}</span><i>{index === 1 ? <MessageCircle /> : <Landmark />}</i><div><b>{locale === 'ko' ? item.ko : item.en}</b><small>{locale === 'ko' ? item.noteKo : item.noteEn}</small></div></div>)}
      </div> : null}
      {tab === 'institutions' ? <section className="inspector-panel"><h3>{locale === 'ko' ? '관여 기관' : 'Participating institutions'}</h3><p>{locale === 'ko' ? '이 구조도는 발신·수취 기관, 네트워크 운영자, 청산·결제 기관의 역할을 구분해 설명합니다. 실제 거래 상대방이나 개별 장부를 나타내지 않습니다.' : 'This schematic separates sending and receiving institutions, network operators, and clearing or settlement roles. It does not identify real counterparties or individual ledgers.'}</p><ul>{guide.roles.map((role) => <li key={role.en}>{locale === 'ko' ? role.ko : role.en}</li>)}</ul><small>{locale === 'ko' ? guide.boundary.ko : guide.boundary.en}</small></section> : null}
      {tab === 'route' && guide.concepts?.length ? <section className="inspector-panel"><h3>{locale === 'ko' ? '핵심 구분' : 'Key distinctions'}</h3><ul>{guide.concepts.map((concept) => <li key={concept.en}>{locale === 'ko' ? concept.ko : concept.en}</li>)}</ul></section> : null}
      {tab === 'route' || tab === 'statistics' ? <section className="metric-section"><h3>{t('inspector.compare')}</h3><div className="metric-table">
        {metrics.map((metric) => <div key={metric.id}><span>{locale === 'ko' ? metric.labelKo : metric.labelEn}</span><strong>{metric.display}</strong><small>{metric.coveragePeriod}</small></div>)}
        {metrics.length === 0 ? <p>—</p> : null}
      </div></section> : null}
      {tab === 'documents' ? <section className="source-section"><h3><FileText size={14} />{t('common.sourceDate')}</h3>{sources.map((source) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer"><span><b>{source.provider}</b><small>{source.coveragePeriod} · {source.cadence}</small></span><ExternalLink size={13} /></a>)}</section> : null}
    </aside>
  )
}
