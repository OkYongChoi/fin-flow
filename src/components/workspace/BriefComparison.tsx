import { useMemo } from 'react'
import { buildBriefEvidence } from '../../briefEvidence'
import type { DataBundle, Locale, NetworkId } from '../../types'

export function BriefComparison({ networks, data, locale }: { networks: NetworkId[]; data: DataBundle; locale: Locale }) {
  const evidence = useMemo(() => buildBriefEvidence(networks, data), [networks, data])
  const ko = locale === 'ko'
  if (!evidence.networks.length) return null
  return <section className="brief-comparison" aria-labelledby="comparison-title">
    <div className="evidence-heading"><h3 id="comparison-title">{ko ? '한눈에 비교' : 'Compare at a glance'}</h3><span>{ko ? `${networks.length}개 흐름` : `${networks.length} flows`}</span></div>
    <p className="workspace-hint">{ko ? '같은 질문으로 차이를 살펴보세요. 자세한 과정과 원문은 아래에서 확인할 수 있습니다.' : 'Ask the same questions of each flow. Explore the stages and original sources below.'}</p>
    <p className="comparison-scroll-hint">{ko ? '표가 화면보다 넓으면 표 안에서 좌우로 움직여 다른 항목을 확인하세요.' : 'If the table is wider than your screen, scroll within it to compare the other flows.'}</p>
    <div className="comparison-scroll" role="region" aria-label={ko ? '네트워크 비교표, 가로로 스크롤 가능' : 'Network comparison, scroll horizontally'} tabIndex={0}>
      <table className="brief-comparison-table">
        <caption className="sr-only">{ko ? '선택한 금융 흐름의 범위, 역할과 주의점 비교' : 'Scope, roles and boundaries of selected financial flows'}</caption>
        <thead><tr><th scope="col">{ko ? '비교 질문' : 'Question'}</th>{evidence.networks.map(network => <th scope="col" key={network.id}>{network.label[locale]}</th>)}</tr></thead>
        <tbody>
          <tr><th scope="row">{ko ? '무엇을 하나요?' : 'What does it do?'}</th>{evidence.networks.map(network => <td key={network.id}>{network.scope[locale]}</td>)}</tr>
          <tr><th scope="row">{ko ? '누가 참여하나요?' : 'Who takes part?'}</th>{evidence.networks.map(network => <td key={network.id}><ul>{network.roles.map((role, index) => <li key={index}>{role[locale]}</li>)}</ul></td>)}</tr>
          <tr><th scope="row">{ko ? '무엇을 구분해야 하나요?' : 'What should I distinguish?'}</th>{evidence.networks.map(network => <td key={network.id}>{network.boundary[locale]}</td>)}</tr>
        </tbody>
      </table>
    </div>
    <div className="evidence-heading"><h3>{ko ? '숫자와 근거 살펴보기' : 'Explore the evidence'}</h3><span>{ko ? `지표 ${evidence.metricCount}개 · 등록 출처 ${evidence.sourceCount}개` : `${evidence.metricCount} metrics · ${evidence.sourceCount} catalog sources`}</span></div>
    <p className="workspace-hint">{ko ? '각 지표는 대상·단위·기간이 다릅니다. 수치의 크기만으로 순위를 매기거나 합산하지 마세요.' : 'Metrics describe different things, units and periods. Their values are not a ranking and should not be added together.'}</p>
    <div className="brief-evidence-cards">{evidence.networks.map(network => <section key={network.id} className="brief-evidence-card" aria-label={`${network.label[locale]} ${ko ? '근거' : 'evidence'}`}>
      <h4>{network.label[locale]}</h4>
      {network.metrics.length ? <ul>{network.metrics.map(metric => <li key={metric.id}>
        <span>{ko ? metric.labelKo : metric.labelEn}</span><strong>{metric.display}</strong>
        <small>{ko ? '단위' : 'Unit'}: {metric.unit} · {ko ? '대상 기간' : 'Period'}: {metric.coveragePeriod}</small>
        {metric.source ? <a href={metric.source.url} target="_blank" rel="noreferrer">{metric.source.provider} · {ko ? '확인일' : 'Retrieved'} {metric.source.retrievedAt.slice(0, 10)} ↗</a> : <small className="evidence-warning">{ko ? '연결된 출처를 찾을 수 없습니다.' : 'The linked source is unavailable.'}</small>}
      </li>)}</ul> : <p className="workspace-hint">{ko ? '이 스냅샷에 수록된 지표가 없습니다. 값이 0이라는 뜻은 아닙니다.' : 'No metrics in this snapshot. This does not mean a value of zero.'}</p>}
      <details className="evidence-source-list"><summary>{ko ? '출처와 확인 시점' : 'Sources and retrieval dates'}</summary>
        <ul>{network.sources.map(source => <li key={source.id}><a href={source.url} target="_blank" rel="noreferrer">{source.provider}: {source.title} ↗</a><small>{source.coveragePeriod} · {ko ? '확인일' : 'Retrieved'} {source.retrievedAt.slice(0, 10)}</small></li>)}{network.references.map(ref => <li key={ref.url}><a href={ref.url} target="_blank" rel="noreferrer">{ref.title} ↗</a><small>{ko ? '절차 설명 참고 문헌 · 확인일 미등록' : 'Process reference · retrieval date not recorded'}</small></li>)}</ul>
        {!network.sources.length && !network.references.length && <p>{ko ? '등록된 출처가 없습니다.' : 'No sources recorded.'}</p>}
      </details>
    </section>)}</div>
  </section>
}
