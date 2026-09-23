import { memo } from 'react'
import { NETWORKS } from '../../data'
import { briefSources } from '../../briefs'
import { FLOW_GUIDES } from '../../flowGuides'
import type { DataBundle, Locale, NetworkId } from '../../types'
import { BriefComparison } from './BriefComparison'
import { FinanceBasics } from './FinanceBasics'

// Notes and titles change on every keystroke. Keep the source-backed portion
// independent so editing does not reconcile its comparison tables and guides.
export const BriefReferenceContent = memo(function BriefReferenceContent({ networks, data, locale }: {
  networks: NetworkId[]; data: DataBundle | null; locale: Locale
}) {
  const ko = locale === 'ko'
  return <>
    <FinanceBasics locale={locale} />
    {data && <BriefComparison networks={networks} data={data} locale={locale} />}
    {networks.length === 0 && <p>{ko ? '비교할 네트워크를 하나 이상 선택하세요.' : 'Choose at least one network.'}</p>}
    {networks.map(id => {
      const network = NETWORKS.find(network => network.id === id)!
      const guide = FLOW_GUIDES[id]
      return <details key={id} className="comparison-block brief-flow-detail">
        <summary><h3>{ko ? network.label : network.labelEn}</h3><span>{ko ? '과정 자세히 보기' : 'Explore the stages'}</span></summary>
        <p>{ko ? network.description : network.descriptionEn}</p>
        <ol>{guide.steps.map((step, index) => <li key={index}>{step[locale]}<small className="flow-step-note">{ko ? step.noteKo : step.noteEn}</small></li>)}</ol>
        <ul>{guide.roles.map((role, index) => <li key={index}>{role[locale]}</li>)}</ul>
        <p className="brief-boundary">{guide.boundary[locale]}</p>
        <div className="brief-sources">
          {guide.references?.map(ref => <a key={ref.url} href={ref.url} target="_blank" rel="noreferrer">{ref.title} ↗</a>)}
          {data && briefSources([id], data).map(source => <a href={source.url} key={source.id} target="_blank" rel="noreferrer">{source.provider} ↗</a>)}
        </div>
      </details>
    })}
  </>
})
