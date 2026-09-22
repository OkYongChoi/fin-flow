import { getFlowGuide } from '../flowGuides'
import type { Locale, NetworkId } from '../types'

export function NetworkGuide({ network, locale, id = 'network-guide-title' }: { network: NetworkId; locale: Locale; id?: string }) {
  const guide = getFlowGuide(network)
  const ko = locale === 'ko'
  return <section className="network-guide" aria-labelledby={id}>
    <h3 id={id}>{ko ? '흐름 이해하기' : 'Understand the flow'}</h3>
    <p>{ko ? '단계별 역할을 확인한 뒤 원문과 대조하세요.' : 'Follow the stages, then check them against the original sources.'}</p>
    <ol>{guide.steps.map((step, index) => <li key={index}><strong>{step[locale]}</strong><small>{ko ? step.noteKo : step.noteEn}</small></li>)}</ol>
    <ul>{guide.roles.map((role, index) => <li key={index}>{role[locale]}</li>)}</ul>
    <blockquote>{guide.boundary[locale]}</blockquote>
    {guide.references?.map(ref => <a key={ref.url} href={ref.url} target="_blank" rel="noreferrer">{ref.title} ↗</a>)}
  </section>
}
