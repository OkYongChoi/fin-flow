import { ArrowLeft, ArrowRight, BookOpen, Cable, CircleDollarSign, Landmark, Network } from 'lucide-react'
import { AppHeader } from '../App'
import { NETWORKS } from '../data'
import type { Locale } from '../types'
import { useRouter } from '../router'

const COPY = {
  ko: {
    networks: ['금융 네트워크', '돈이 움직이기 전에, 메시지와 장부가 먼저 움직입니다.', '각 네트워크가 메시징, 승인, 청산, 결제 중 어떤 역할을 맡는지 분리해 살펴보세요.'],
    institutions: ['기관', '같은 거래도 여러 기관의 장부를 통과합니다.', '중앙은행, 상업은행, 카드 네트워크, 청산기관과 스테이블코인 발행자의 역할을 비교합니다.'],
    assets: ['자산의 흐름', 'USD와 USDC는 같은 단위를 쓰지만 움직이는 장부가 다릅니다.', '은행 예금, 중앙은행 준비금, 파생상품 담보와 온체인 토큰의 이동을 구분합니다.'],
    learn: ['배우기', '국제 금융 인프라를 단계별로 해체합니다.', '복잡한 거래를 메시지, 승인, 청산, 상계, 최종결제와 자산 이전으로 나눠 이해합니다.'],
  },
  en: {
    networks: ['Financial networks', 'Messages and ledgers move before money does.', 'See exactly which network handles messaging, authorization, clearing or settlement.'],
    institutions: ['Institutions', 'A single transaction crosses several institutional ledgers.', 'Compare central banks, commercial banks, card networks, clearing houses and stablecoin issuers.'],
    assets: ['Asset flows', 'USD and USDC share a unit, but live on different ledgers.', 'Separate bank deposits, central-bank reserves, derivatives collateral and on-chain tokens.'],
    learn: ['Learn', 'Break international financial infrastructure into observable stages.', 'Understand complex transactions as messaging, authorization, clearing, netting, settlement and asset transfer.'],
  },
}

const LESSONS = [
  ['메시지와 돈', 'Messages vs money', 'SWIFT는 지급 지시를 전달하지만 자금 자체를 보유하거나 결제하지 않습니다.'],
  ['청산과 최종결제', 'Clearing vs settlement', '의무를 계산하는 과정과 중앙은행·상업은행 장부의 최종 이전을 구분합니다.'],
  ['상계와 유동성', 'Netting & liquidity', 'CHIPS가 다수 지급 의무를 효율적으로 처리하는 원리를 살펴봅니다.'],
  ['파생상품 담보', 'Derivatives collateral', '명목금액, 시장가치, 증거금과 실제 자금 이동의 차이를 이해합니다.'],
]

export function InfoPage({ type, locale, slug }: { type: 'networks' | 'institutions' | 'assets' | 'learn'; locale: Locale; slug?: string }) {
  const { navigate } = useRouter()
  const openItem = (item: (typeof NETWORKS)[number] | (typeof LESSONS)[number]) => {
    if ('id' in item) navigate(`/${locale}/map?network=${item.id}`)
  }
  const copy = COPY[locale][type]
  return (
    <main className="info-page">
      <AppHeader locale={locale} />
      <section className="info-hero"><button className="back-link" onClick={() => navigate(`/${locale}/map`)}><ArrowLeft size={15} />{locale === 'ko' ? '지도로 돌아가기' : 'Back to map'}</button><h1>{copy[0]}</h1><p>{copy[1]}</p><small>{copy[2]}</small></section>
      <section className="editorial-grid">
        {(type === 'networks' ? NETWORKS : LESSONS).map((item, index) => {
          const title = 'id' in item ? (locale === 'ko' ? item.label : item.labelEn) : item[locale === 'ko' ? 0 : 1]
          const description = 'id' in item ? (locale === 'ko' ? item.description : item.descriptionEn) : item[2]
          return <article key={title} className={slug === ('id' in item ? item.id : '') ? 'active' : ''} tabIndex={('id' in item) ? 0 : undefined} role={('id' in item) ? 'link' : undefined} onClick={() => openItem(item)} onKeyDown={(event) => { if ('id' in item && (event.key === 'Enter' || event.key === ' ')) openItem(item) }}><span>0{index + 1}</span><div><h2>{title}</h2><p>{description}</p></div><ArrowRight /></article>
        })}
      </section>
      <section className="flow-principles"><div><Network /><h2>{locale === 'ko' ? '하나의 선, 하나의 의미' : 'One line, one meaning'}</h2><p>{locale === 'ko' ? '메시지·청산·결제·자산 이전을 서로 다른 선으로 구분합니다.' : 'Messaging, clearing, settlement and asset transfer use distinct visual encodings.'}</p></div><div><Landmark /><h2>{locale === 'ko' ? '출처가 있는 숫자' : 'Source-backed figures'}</h2><p>{locale === 'ko' ? '모든 수치에 기관, 기준 기간과 갱신 주기를 연결합니다.' : 'Every figure links to its provider, coverage period and release cadence.'}</p></div><div><BookOpen /><h2>{locale === 'ko' ? '두 단계의 깊이' : 'Two levels of depth'}</h2><p>{locale === 'ko' ? '기본 보기는 개념을, 전문 보기는 비교와 방법론을 강조합니다.' : 'Basic mode teaches concepts; Pro mode emphasizes comparison and methodology.'}</p></div></section>
    </main>
  )
}
