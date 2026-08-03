import { Pause, Play, RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Locale, NetworkId } from '../types'

const EVENTS: Record<NetworkId, Array<[string, string, string]>> = {
  swift: [['00:00', '지급 지시', 'Instruction'], ['00:10', '메시지 생성', 'Message creation'], ['00:20', '형식 검증', 'Validation'], ['00:35', '은행 간 전달', 'Delivery'], ['00:50', '상태 갱신', 'Status update'], ['01:00', '수취 확인', 'Confirmation']],
  visa: [['00:00', '결제 제시', 'Purchase presented'], ['00:10', '승인 요청', 'Authorization'], ['00:20', '발급사 응답', 'Issuer response'], ['00:35', '거래 청산', 'Clearing'], ['00:50', '회원사 결제', 'Member settlement'], ['01:00', '가맹점 반영', 'Merchant posting']],
  'chips-fedwire': [['00:00', '지급 지시', 'Instruction'], ['00:10', '메시지 검증', 'Validation'], ['00:20', '결제망 선택', 'Rail selection'], ['00:35', '상계 또는 총액', 'Net or gross'], ['00:50', '최종 결제', 'Final settlement'], ['01:00', '수취 확인', 'Confirmation']],
  derivatives: [['00:00', '계약 체결', 'Execution'], ['00:10', '거래 확인', 'Confirmation'], ['00:20', '가치평가', 'Valuation'], ['00:35', '증거금 산정', 'Margin call'], ['00:50', '담보 이전', 'Collateral transfer'], ['01:00', '정산 확인', 'Settlement confirmation']],
  usdc: [['00:00', '법정화폐 입금', 'Fiat deposit'], ['00:10', '발행 요청', 'Mint request'], ['00:20', 'USDC 발행', 'USDC issuance'], ['00:35', '온체인 이전', 'On-chain transfer'], ['00:50', '상환 요청', 'Redemption request'], ['01:00', '소각·지급', 'Burn & payout']],
}

const SPEEDS = [0.5, 1, 2] as const

export function FlowTimeline({ selected, locale }: { selected: NetworkId; locale: Locale }) {
  const { t } = useTranslation()
  const [playing, setPlaying] = useState(false)
  const [step, setStep] = useState(2)
  const [speedIndex, setSpeedIndex] = useState(1)
  const events = EVENTS[selected]
  const speed = SPEEDS[speedIndex]
  useEffect(() => {
    if (!playing) return
    const timer = window.setInterval(() => setStep((current) => current >= events.length - 1 ? 0 : current + 1), 1100 / speed)
    return () => window.clearInterval(timer)
  }, [events.length, playing, speed])
  useEffect(() => { setStep(0); setPlaying(false) }, [selected])
  return (
    <section className="flow-timeline">
      <header><h2>{t('timeline.title')}</h2><div /><div className="simulation-badge"><i />{t('inspector.simulation')}</div></header>
      <div className="timeline-body">
        <div className="playback"><span>{t('timeline.play')}</span><div><button onClick={() => { setStep(0); setPlaying(false) }} aria-label={locale === 'ko' ? '처음부터 재생' : 'Restart'}><RotateCcw size={15} /></button><button className="play" onClick={() => setPlaying((value) => !value)} aria-label={playing ? t('timeline.pause') : t('timeline.play')}>{playing ? <Pause /> : <Play />}</button><button className="speed" onClick={() => setSpeedIndex((index) => (index + 1) % SPEEDS.length)} aria-label={locale === 'ko' ? `재생 속도 ${speed}배` : `Playback speed ${speed}x`}>{speed}×</button></div><small>{t('notices.simulated')}</small></div>
        <div className="timeline-track" style={{ '--progress': `${step / (events.length - 1) * 100}%` } as React.CSSProperties}>
          <span className="track-line" />
          {events.map(([time, ko, en], index) => <button key={time} className={index <= step ? 'complete' : ''} onClick={() => { setStep(index); setPlaying(false) }}><time>{time}</time><i /><b>{locale === 'ko' ? ko : en}</b><small>{index === step ? (selected === 'chips-fedwire' ? 'CHIPS / Fedwire' : selected.toUpperCase()) : '—'}</small></button>)}
        </div>
        <div className="event-summary"><span>{locale === 'ko' ? '선택 단계' : 'Selected stage'}</span><b>{locale === 'ko' ? events[step][1] : events[step][2]}</b><small>{locale === 'ko' ? '인과관계를 주장하지 않는 설명용 재생' : 'Illustrative playback; no causal claim'}</small></div>
      </div>
    </section>
  )
}
