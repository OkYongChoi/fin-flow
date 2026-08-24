import { CalendarClock, ExternalLink, FileCheck2, Layers3 } from 'lucide-react'
import { isSnapshotReviewOverdue, NETWORKS } from '../data'
import { getProductStructureGuide } from '../productStructures'
import type { Locale, Metric, NetworkId, SourceRecord } from '../types'

const formatDate = (value: string | undefined, locale: Locale) => value ? new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', { dateStyle: 'medium' }).format(new Date(value)) : '—'

export function SourceDataBoard({ selected, metrics, sources, generatedAt, reviewDueAt, locale }: { selected: NetworkId; metrics: Metric[]; sources: SourceRecord[]; generatedAt?: string; reviewDueAt?: string; locale: Locale }) {
  const network = NETWORKS.find((item) => item.id === selected)!
  const sourceById = new Map(sources.map((source) => [source.id, source]))
  const structureGuide = getProductStructureGuide(selected)
  const reviewOverdue = reviewDueAt ? isSnapshotReviewOverdue(reviewDueAt) : false
  return (
    <section className="source-data-board" aria-labelledby="source-data-board-title">
      <header className="source-data-heading">
        <div><span>{locale === 'ko' ? '출처 기반 데이터' : 'Source-backed data'}</span><h2 id="source-data-board-title">{locale === 'ko' ? network.label : network.labelEn}</h2></div>
        <dl><div><dt>{locale === 'ko' ? '지표' : 'Metrics'}</dt><dd>{metrics.length}</dd></div><div><dt>{locale === 'ko' ? '스냅샷 생성' : 'Snapshot generated'}</dt><dd><time dateTime={generatedAt}>{formatDate(generatedAt, locale)}</time></dd></div><div><dt>{reviewOverdue ? (locale === 'ko' ? '검토 기한 경과' : 'Review overdue') : (locale === 'ko' ? '다음 검토' : 'Next review')}</dt><dd><time dateTime={reviewDueAt}>{formatDate(reviewDueAt, locale)}</time></dd></div></dl>
      </header>
      {structureGuide ? <section className="product-structure" aria-labelledby="product-structure-title">
        <header><span><Layers3 size={15} aria-hidden="true" />{locale === 'ko' ? '상품 이해' : 'Product mechanics'}</span><h3 id="product-structure-title">{locale === 'ko' ? '상품 구성 방식' : 'How the products are constructed'}</h3><p>{structureGuide.introduction[locale]}</p></header>
        <div className="product-structure-grid">
          {structureGuide.products.map((product) => <article key={product.id}>
            <h4>{product.name[locale]}</h4>
            <dl>
              <div><dt>{locale === 'ko' ? '목표' : 'Objective'}</dt><dd>{product.objective[locale]}</dd></div>
              <div><dt>{locale === 'ko' ? '구성' : 'Portfolio'}</dt><dd>{product.portfolio[locale]}</dd></div>
              <div><dt>{locale === 'ko' ? '재조정' : 'Reset'}</dt><dd>{product.rebalance[locale]}</dd></div>
              <div><dt>{locale === 'ko' ? '보유기간 경계' : 'Holding-period boundary'}</dt><dd>{product.holdingPeriod[locale]}</dd></div>
            </dl>
          </article>)}
        </div>
      </section> : null}
      <div className="source-metric-grid" aria-label={locale === 'ko' ? '검증 지표' : 'Verified metrics'}>
        {metrics.map((metric) => <article key={metric.id} className="source-metric-card"><span>{locale === 'ko' ? metric.labelKo : metric.labelEn}</span><strong>{metric.display}</strong><small>{metric.unit} · {metric.coveragePeriod}</small><p><FileCheck2 size={13} aria-hidden="true" />{sourceById.get(metric.sourceId)?.provider ?? metric.sourceId}</p></article>)}
        {metrics.length === 0 ? <p className="source-empty">{locale === 'ko' ? '표시할 검증 지표가 없습니다.' : 'No verified metrics are available.'}</p> : null}
      </div>
      <section className="source-quick-links" aria-labelledby="source-quick-links-title">
        <h3 id="source-quick-links-title"><CalendarClock size={15} aria-hidden="true" />{locale === 'ko' ? '원문 발행·조회 정보' : 'Publication and retrieval records'}</h3>
        <div>
          {sources.map((source) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer"><span><b>{source.provider}</b><small>{source.title}</small><small>{locale === 'ko' ? `발행 ${source.publishedAt} · 조회 ${source.retrievedAt}` : `Published ${source.publishedAt} · retrieved ${source.retrievedAt}`}</small></span><ExternalLink size={14} aria-hidden="true" /></a>)}
          {sources.length === 0 ? <p className="source-empty">{locale === 'ko' ? '연결된 원문이 없습니다.' : 'No linked primary sources.'}</p> : null}
        </div>
      </section>
    </section>
  )
}
