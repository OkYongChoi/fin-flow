import { ExternalLink, FileText, Landmark, MessageCircle, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NETWORKS } from '../data'
import type { Locale, Metric, NetworkId, SourceRecord } from '../types'

const STEPS = {
  'chips-fedwire': [['은행의 지급 지시', 'Originating bank'], ['SWIFT 메시지', 'SWIFT message'], ['CHIPS 또는 Fedwire', 'CHIPS or Fedwire'], ['수취은행 반영', 'Beneficiary bank']],
  swift: [['지급 지시 생성', 'Payment instruction'], ['메시지 검증', 'Message validation'], ['은행 간 전달', 'Interbank delivery'], ['수취 확인', 'Confirmation']],
  visa: [['승인 요청', 'Authorization'], ['거래 승인', 'Approval'], ['청산', 'Clearing'], ['은행 간 결제', 'Interbank settlement']],
  'bond-issuance': [['발행 조건 설계', 'Structure the offering'], ['IB 주관·인수', 'Lead and underwrite'], ['예탁결제 적격성', 'Depository eligibility'], ['배정·인도대금결제', 'Allocation and delivery versus payment']],
  derivatives: [['계약 체결', 'Execution'], ['포지션·가치평가', 'Position & valuation'], ['담보·청산', 'Collateral & clearing'], ['만기·정산', 'Maturity & settlement']],
  usdc: [['USD 입금', 'USD deposit'], ['USDC 발행', 'USDC issuance'], ['온체인 이전', 'On-chain transfer'], ['상환', 'Redemption']],
} as const

export function DetailInspector({ selected, metrics, sources, locale }: { selected: NetworkId; metrics: Metric[]; sources: SourceRecord[]; locale: Locale }) {
  const { t } = useTranslation()
  const [tab, setTab] = useState('route')
  useEffect(() => { setTab('route') }, [selected])
  const network = NETWORKS.find((item) => item.id === selected)!
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
        {STEPS[selected].map(([ko, en], index) => <div key={ko} className="settlement-step"><span>{index + 1}</span><i>{index === 1 ? <MessageCircle /> : <Landmark />}</i><div><b>{locale === 'ko' ? ko : en}</b><small>{index === 2 && selected === 'chips-fedwire' ? (locale === 'ko' ? '별도 결제 경로 · 직렬 아님' : 'Alternative rails · not sequential') : (locale === 'ko' ? '설명용 단계' : 'Explanatory stage')}</small></div></div>)}
      </div> : null}
      {tab === 'institutions' ? <section className="inspector-panel"><h3>{locale === 'ko' ? '관여 기관' : 'Participating institutions'}</h3><p>{locale === 'ko' ? '이 구조도는 발신·수취 기관, 네트워크 운영자, 청산·결제 기관의 역할을 구분해 설명합니다. 실제 거래 상대방이나 개별 장부를 나타내지 않습니다.' : 'This schematic separates sending and receiving institutions, network operators, and clearing or settlement roles. It does not identify real counterparties or individual ledgers.'}</p></section> : null}
      {tab === 'route' || tab === 'statistics' ? <section className="metric-section"><h3>{t('inspector.compare')}</h3><div className="metric-table">
        {metrics.map((metric) => <div key={metric.id}><span>{locale === 'ko' ? metric.labelKo : metric.labelEn}</span><strong>{metric.display}</strong><small>{metric.coveragePeriod}</small></div>)}
        {metrics.length === 0 ? <p>—</p> : null}
      </div></section> : null}
      {tab === 'documents' ? <section className="source-section"><h3><FileText size={14} />{t('common.sourceDate')}</h3>{sources.map((source) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer"><span><b>{source.provider}</b><small>{source.coveragePeriod} · {source.cadence}</small></span><ExternalLink size={13} /></a>)}</section> : null}
    </aside>
  )
}
