import { FLOW_GUIDES } from '../../flowGuides'
import type { Locale } from '../../types'
import { useRouter } from '../../router'

export function FinanceBasics({ locale }: { locale: Locale }) {
  const { navigate } = useRouter()
  const ko = locale === 'ko'
  const swift = FLOW_GUIDES.swift
  const reference = swift.references?.[0]
  return <details className="finance-basics">
    <summary>{ko ? '처음이라면: 비교표 읽는 법' : 'New here? Read the comparison'}</summary>
    <dl>
      <dt>{ko ? '무엇을 설명하나요?' : 'What does it explain?'}</dt>
      <dd>{ko ? '범위는 이 설명에서 다루는 일입니다. 먼저 각 항목이 어떤 일을 설명하는지 비교해 보세요.' : 'Scope means the activity this explanation covers. Start by comparing what each entry describes.'}</dd>
      <dt>{ko ? '누가 어떤 일을 하나요?' : 'Who does what?'}</dt>
      <dd>{ko ? '참여자는 그 일에 관여하는 기관이나 사람입니다. 역할을 읽으면 누가 어느 부분을 맡는지 알 수 있습니다.' : 'Participants are the institutions or people involved. Their roles explain who handles each part.'}</dd>
      <dt>{ko ? '어디까지 알 수 있나요?' : 'What can you conclude?'}</dt>
      <dd><p>{ko ? '주의점은 이 설명으로 알 수 있는 범위를 짚어 줍니다. 예를 들어 SWIFT에서는:' : 'Boundaries explain the limits of the description. For example, with SWIFT:'} {swift.boundary[locale]}</p>{reference && <a href={reference.url} target="_blank" rel="noreferrer">{ko ? 'SWIFT 원문 확인' : 'Read SWIFT’s explanation'} ↗</a>}</dd>
      <dt>{ko ? '날짜는 무엇을 뜻하나요?' : 'What do the dates mean?'}</dt>
      <dd>{ko ? '스냅샷은 앱에 담긴 출처 묶음의 버전입니다. 대상 기간은 자료가 설명하는 시기이고, 확인일은 원문을 확인한 날짜입니다. 확인일이 최근이어도 자료의 대상 기간까지 최근이라는 뜻은 아닙니다.' : 'The snapshot identifies the version of the app’s collected sources. The covered period is the time the information describes; the retrieval date is when the source was checked. A recent retrieval date does not mean the information covers a recent period.'}</dd>
    </dl>
    <button type="button" className="brief-button" onClick={() => navigate(`/${locale}/learn`)}>{ko ? '금융 용어 찾아보기' : 'Look up financial terms'}</button>
  </details>
}
