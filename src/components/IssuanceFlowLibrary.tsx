import { ExternalLink, FileStack } from 'lucide-react'
import { useState } from 'react'
import { ISSUANCE_FLOWS } from '../issuanceFlows'
import type { Locale } from '../types'

export function IssuanceFlowLibrary({ locale }: { locale: Locale }) {
  const [selectedId, setSelectedId] = useState(ISSUANCE_FLOWS[0].id)
  const flow = ISSUANCE_FLOWS.find((item) => item.id === selectedId) ?? ISSUANCE_FLOWS[0]
  return <section className="issuance-library" aria-labelledby="issuance-library-title">
    <header><span><FileStack size={15} aria-hidden="true" />{locale === 'ko' ? '증권 발행 절차' : 'Securities issuance procedures'}</span><h3 id="issuance-library-title">{locale === 'ko' ? '유형을 선택해 발행 경로를 비교하세요' : 'Choose a security type to compare the issuance path'}</h3></header>
    <label>{locale === 'ko' ? '발행 유형' : 'Issuance type'}<select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>{ISSUANCE_FLOWS.map((item) => <option value={item.id} key={item.id}>{item.label[locale]}</option>)}</select></label>
    <p>{flow.summary[locale]}</p>
    <ol>{flow.steps.map((step) => <li key={step.en}>{step[locale]}</li>)}</ol>
    <small>{flow.boundary[locale]}</small>
    <a href={flow.source.url} target="_blank" rel="noreferrer"><span><b>{flow.source.provider}</b><small>{flow.source.title}</small></span><ExternalLink size={14} aria-hidden="true" /></a>
  </section>
}
