import { Pause, Play, RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Locale, NetworkId } from '../types'

const EVENTS = [
  ['00:00', '지급 지시', 'Instruction'], ['00:10', '메시지 전달', 'Message'], ['00:20', '경로 선택', 'Rail selection'], ['00:35', '청산·상계', 'Clearing'], ['00:50', '최종 결제', 'Final settlement'], ['01:00', '수취 확인', 'Confirmation'],
]

export function FlowTimeline({ selected, locale }: { selected: NetworkId; locale: Locale }) {
  const { t } = useTranslation()
  const [playing, setPlaying] = useState(false)
  const [step, setStep] = useState(2)
  const [view, setView] = useState<'timeline' | 'comparison' | 'institution'>('timeline')
  const [speed, setSpeed] = useState(1)
  useEffect(() => {
    if (!playing) return
    const timer = window.setInterval(() => setStep((current) => current >= EVENTS.length - 1 ? 0 : current + 1), 1100)
    return () => window.clearInterval(timer)
  }, [playing, speed])
  return (
    <section className="flow-timeline">
      <header><h2>{t('timeline.title')}</h2><nav>{(['timeline', 'comparison', 'institution'] as const).map((item) => <button key={item} className={view === item ? 'active' : ''} onClick={() => setView(item)}>{t(`timeline.${item}`)}</button>)}</nav><div className="simulation-badge"><i />{t('inspector.simulation')}</div></header>
      <div className="timeline-body">
        <div className="playback"><span>{t('timeline.play')}</span><div><button onClick={() => { setPlaying(false); setStep(0) }} aria-label="Restart"><RotateCcw size={15} /></button><button className="play" onClick={() => setPlaying((value) => !value)} aria-label={playing ? t('timeline.pause') : t('timeline.play')}>{playing ? <Pause /> : <Play />}</button><button className="speed-button" onClick={() => setSpeed((value) => value === 1 ? 2 : 1)} aria-label={`Playback speed ${speed}x`}>{speed}×</button></div><small>{t('notices.simulated')}</small></div>
        <div className="timeline-track" style={{ '--progress': `${step / (EVENTS.length - 1) * 100}%` } as React.CSSProperties}>
          <span className="track-line" />
          {EVENTS.map(([time, ko, en], index) => <button key={time} className={index <= step ? 'complete' : ''} onClick={() => setStep(index)}><time>{time}</time><i /><b>{locale === 'ko' ? ko : en}</b><small>{index === step ? (selected === 'chips-fedwire' ? 'CHIPS / Fedwire' : selected.toUpperCase()) : '—'}</small></button>)}
        </div>
        <div className="event-summary"><span>{view === 'timeline' ? (locale === 'ko' ? '선택 단계' : 'Selected stage') : view === 'comparison' ? (locale === 'ko' ? '비교 관점' : 'Comparison lens') : (locale === 'ko' ? '기관 관점' : 'Institution lens')}</span><b>{view === 'timeline' ? (locale === 'ko' ? EVENTS[step][1] : EVENTS[step][2]) : view === 'comparison' ? (locale === 'ko' ? '망별 역할 비교' : 'Rail roles compared') : (locale === 'ko' ? '장부 간 전달' : 'Across ledgers')}</b><small>{locale === 'ko' ? '인과관계를 주장하지 않는 설명용 재생' : 'Illustrative playback; no causal claim'}</small></div>
      </div>
    </section>
  )
}
