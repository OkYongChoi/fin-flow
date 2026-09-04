import { ExternalLink, FileCheck2, ShieldCheck } from 'lucide-react'
import { NETWORKS } from '../data'
import { IssuanceFlowLibrary } from './IssuanceFlowLibrary'
import type { Locale, Metric, NetworkId, SourceRecord } from '../types'

export function SourceDetails({ selected, metrics, sources, locale }: { selected: NetworkId; metrics: Metric[]; sources: SourceRecord[]; locale: Locale }) {
  const network = NETWORKS.find((item) => item.id === selected)!
  return (
    <aside className="detail-inspector source-details" aria-labelledby="detail-inspector-title">
      <div className="sheet-handle" />
      <header><div><span>{locale === 'ko' ? '선택 네트워크' : 'Selected network'}</span><h2 id="detail-inspector-title">{locale === 'ko' ? network.label : network.labelEn}</h2></div><ShieldCheck size={19} /></header>
      <div className="representation-label"><i />{locale === 'ko' ? '공식 출처 스냅샷' : 'Official-source snapshot'}<span>{metrics.length}</span></div>
      {selected === 'securities-issuance' ? <IssuanceFlowLibrary locale={locale} /> : null}
      <section className="metric-section"><h3>{locale === 'ko' ? '검증 지표' : 'Verified metrics'}</h3><div className="metric-table">
        {metrics.map((metric) => <div key={metric.id}><span>{locale === 'ko' ? metric.labelKo : metric.labelEn}</span><strong>{metric.display}</strong><small>{metric.coveragePeriod}</small></div>)}
        {metrics.length === 0 ? <p>—</p> : null}
      </div></section>
      <section className="source-section"><h3><FileCheck2 size={14} />{locale === 'ko' ? '원문 및 기준일' : 'Primary sources and dates'}</h3>{sources.map((source) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer"><span><b>{source.provider}</b><small>{source.coveragePeriod} · {source.cadence}</small><small>{locale === 'ko' ? `발행 ${source.publishedAt} · 조회 ${source.retrievedAt}` : `Published ${source.publishedAt} · retrieved ${source.retrievedAt}`}</small></span><ExternalLink size={13} aria-hidden="true" /></a>)}</section>
    </aside>
  )
}
