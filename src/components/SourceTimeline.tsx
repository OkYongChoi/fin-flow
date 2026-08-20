import { CalendarDays, ExternalLink } from 'lucide-react'
import { NETWORKS } from '../data'
import type { Locale, NetworkId, SourceRecord } from '../types'

export function SourceTimeline({ selected, sources, generatedAt, locale }: { selected: NetworkId; sources: SourceRecord[]; generatedAt?: string; locale: Locale }) {
  const network = NETWORKS.find((item) => item.id === selected)!
  const records = [...sources].sort((left, right) => right.retrievedAt.localeCompare(left.retrievedAt))
  return (
    <section className="source-timeline" aria-labelledby="source-timeline-title">
      <header><div><span>{locale === 'ko' ? '데이터 이력' : 'Data history'}</span><h2 id="source-timeline-title">{locale === 'ko' ? `${network.label} 출처 발행 이력` : `${network.labelEn} source history`}</h2></div><small><CalendarDays size={13} aria-hidden="true" />{locale === 'ko' ? `스냅샷 ${generatedAt?.slice(0, 10) ?? '—'}` : `Snapshot ${generatedAt?.slice(0, 10) ?? '—'}`}</small></header>
      <div className="source-history-list">
        {records.map((source) => <article key={source.id}><time dateTime={source.retrievedAt}>{source.retrievedAt}</time><div><b>{source.provider}</b><span>{source.coveragePeriod} · {source.cadence}</span></div><a href={source.url} target="_blank" rel="noreferrer" aria-label={locale === 'ko' ? `${source.provider} 원문 열기` : `Open ${source.provider} primary source`}><ExternalLink size={14} aria-hidden="true" /></a></article>)}
        {records.length === 0 ? <p className="source-empty">{locale === 'ko' ? '선택한 네트워크의 출처 이력이 없습니다.' : 'No source history is available for this network.'}</p> : null}
      </div>
    </section>
  )
}
