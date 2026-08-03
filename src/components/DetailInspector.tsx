import { ExternalLink, FileText, Landmark, MessageCircle, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NETWORKS } from '../data'
import type { Locale, Metric, NetworkId, SourceRecord } from '../types'

const STEPS = {
  'chips-fedwire': [['은행의 지급 지시', 'Originating bank'], ['SWIFT 메시지', 'SWIFT message'], ['CHIPS 또는 Fedwire', 'CHIPS or Fedwire'], ['수취은행 반영', 'Beneficiary bank']],
  swift: [['지급 지시 생성', 'Payment instruction'], ['메시지 검증', 'Message validation'], ['은행 간 전달', 'Interbank delivery'], ['수취 확인', 'Confirmation']],
  visa: [['승인 요청', 'Authorization'], ['거래 승인', 'Approval'], ['청산', 'Clearing'], ['은행 간 결제', 'Interbank settlement']],
  derivatives: [['계약 체결', 'Execution'], ['포지션·가치평가', 'Position & valuation'], ['담보·청산', 'Collateral & clearing'], ['만기·정산', 'Maturity & settlement']],
  usdc: [['USD 입금', 'USD deposit'], ['USDC 발행', 'USDC issuance'], ['온체인 이전', 'On-chain transfer'], ['상환', 'Redemption']],
} as const

const INSTITUTIONS = {
  'chips-fedwire': [['송금은행', 'Originating bank'], ['CHIPS · Fedwire', 'CHIPS · Fedwire'], ['수취은행', 'Beneficiary bank']],
  swift: [['송신은행', 'Sending bank'], ['SWIFT', 'SWIFT'], ['수신은행', 'Receiving bank']],
  visa: [['카드회원·가맹점', 'Cardholder & merchant'], ['매입사·Visa', 'Acquirer & Visa'], ['발급사', 'Issuer']],
  derivatives: [['거래상대방', 'Counterparties'], ['청산기관', 'Clearing house'], ['수탁·결제기관', 'Custody & settlement agents']],
  usdc: [['고객·은행', 'Customer & bank'], ['Circle', 'Circle'], ['블록체인 네트워크', 'Blockchain network']],
} as const

export function DetailInspector({ selected, metrics, sources, locale }: { selected: NetworkId; metrics: Metric[]; sources: SourceRecord[]; locale: Locale }) {
  const { t } = useTranslation()
  const [tab, setTab] = useState('route')
  const network = NETWORKS.find((item) => item.id === selected)!
  return (
    <aside className="detail-inspector">
      <div className="sheet-handle" />
      <header><div><span>{locale === 'ko' ? '선택 네트워크' : 'Selected network'}</span><h2>{selected === 'chips-fedwire' ? t('inspector.title') : (locale === 'ko' ? network.label : network.labelEn)}</h2></div><ShieldCheck size={19} /></header>
      <div className="representation-label"><i />{t('inspector.schematic')}<span>≠ LIVE</span></div>
      <nav className="inspector-tabs" role="tablist" aria-label={locale === 'ko' ? '네트워크 세부 정보' : 'Network details'}>
        {['route', 'institutions', 'statistics', 'documents'].map((item) => <button key={item} id={`tab-${item}`} role="tab" aria-selected={tab === item} aria-controls={`panel-${item}`} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>{t(`inspector.${item}`)}</button>)}
      </nav>
      {tab === 'route' ? <div id="panel-route" role="tabpanel" aria-labelledby="tab-route" className="settlement-steps">
        {STEPS[selected].map(([ko, en], index) => <div key={ko} className="settlement-step"><span>{index + 1}</span><i>{index === 1 ? <MessageCircle /> : <Landmark />}</i><div><b>{locale === 'ko' ? ko : en}</b><small>{index === 2 && selected === 'chips-fedwire' ? (locale === 'ko' ? '별도 결제 경로 · 직렬 아님' : 'Alternative rails · not sequential') : (locale === 'ko' ? '설명용 단계' : 'Explanatory stage')}</small></div></div>)}
      </div> : null}
      {tab === 'institutions' ? <section id="panel-institutions" role="tabpanel" aria-labelledby="tab-institutions" className="inspector-panel institution-panel"><h3>{locale === 'ko' ? '참여 기관' : 'Participating institutions'}</h3>{INSTITUTIONS[selected].map(([ko, en], index) => <div key={ko}><span>{index + 1}</span><b>{locale === 'ko' ? ko : en}</b></div>)}</section> : null}
      {tab === 'statistics' ? <section id="panel-statistics" role="tabpanel" aria-labelledby="tab-statistics" className="metric-section"><h3>{t('inspector.compare')}</h3><div className="metric-table">
        {metrics.map((metric) => <div key={metric.id}><span>{locale === 'ko' ? metric.labelKo : metric.labelEn}</span><strong>{metric.id === 'bis-cadence' && locale === 'en' ? 'Semiannual' : metric.display}</strong><small>{metric.coveragePeriod}</small></div>)}
        {metrics.length === 0 ? <p className="empty-metrics">{locale === 'ko' ? '현재 기간에 공개 통계가 없습니다.' : 'No public statistics match this period.'}</p> : null}
      </div></section> : null}
      {tab === 'documents' ? <section id="panel-documents" role="tabpanel" aria-labelledby="tab-documents" className="source-section"><h3><FileText size={14} />{t('common.sourceDate')}</h3>{sources.length ? sources.map((source) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer"><span><b>{source.provider}</b><small>{source.coveragePeriod} · {source.cadence}</small></span><ExternalLink size={13} /></a>) : <p className="empty-metrics">{locale === 'ko' ? '표시할 출처가 없습니다.' : 'No sources are available for this selection.'}</p>}</section> : null}
    </aside>
  )
}
