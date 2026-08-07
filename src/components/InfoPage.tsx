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

const GUIDES = {
  institutions: [
    ['중앙은행과 준비금', 'Central banks & reserves', '중앙은행 장부의 준비금은 은행 간 최종결제에 쓰이며, 고객 예금과는 구분됩니다.', 'Central-bank reserve balances support interbank finality and differ from customer deposits.'],
    ['상업은행', 'Commercial banks', '발신·수취 은행은 고객 지시를 검증하고 각자의 장부에 거래 결과를 반영합니다.', 'Sending and receiving banks validate customer instructions and update their own ledgers.'],
    ['네트워크와 청산기관', 'Networks & clearing houses', '메시지 전달, 의무 계산, 결제는 한 기관이 아닌 여러 역할로 나뉠 수 있습니다.', 'Messaging, obligation calculation, and settlement can be split across different institutions.'],
    ['발행자와 수탁자', 'Issuers & custodians', '스테이블코인 발행과 준비자산 수탁은 은행 장부와 별도의 운영·공시 체계를 가질 수 있습니다.', 'Stablecoin issuance and reserve custody can have operations and disclosure separate from bank ledgers.'],
  ],
  assets: [
    ['은행 예금', 'Bank deposits', '은행 예금은 상업은행의 고객 부채이며 지급 지시와 결제 결과에 따라 장부에서 이동합니다.', 'Bank deposits are commercial-bank liabilities that move on ledgers as instructions settle.'],
    ['중앙은행 준비금', 'Central-bank reserves', '준비금은 적격 기관 사이의 결제 자산으로, 일반 고객이 직접 보유하지 않습니다.', 'Reserves are settlement assets between eligible institutions, not direct consumer holdings.'],
    ['파생상품 담보', 'Derivatives collateral', '명목금액, 시장가치, 증거금과 실제 현금 이동을 같은 수치로 취급하지 않습니다.', 'Notional, market value, margin, and cash movement are distinct measures.'],
    ['온체인 토큰', 'On-chain tokens', 'USDC 전송은 공개 체인 상태를 바꾸지만, 발행·상환은 별도의 법정화폐 운영 절차를 포함합니다.', 'USDC transfers change public-chain state, while issuance and redemption include separate fiat operations.'],
  ],
  learn: [
    ['메시지와 돈', 'Messages vs money', 'SWIFT는 지급 지시를 전달하지만 자금 자체를 보유하거나 결제하지 않습니다.', 'SWIFT carries payment instructions; it does not hold or settle the funds themselves.'],
    ['청산과 최종결제', 'Clearing vs settlement', '의무를 계산하는 과정과 중앙은행·상업은행 장부의 최종 이전을 구분합니다.', 'Separate calculating obligations from final ledger transfer at central or commercial banks.'],
    ['상계와 유동성', 'Netting & liquidity', 'CHIPS가 다수 지급 의무를 효율적으로 처리하는 원리를 살펴봅니다.', 'Explore how CHIPS processes many payment obligations efficiently.'],
    ['파생상품 담보', 'Derivatives collateral', '명목금액, 시장가치, 증거금과 실제 자금 이동의 차이를 이해합니다.', 'Understand the difference between notional, market value, margin, and actual cash movement.'],
  ],
} as const


export function InfoPage({ type, locale, slug }: { type: 'networks' | 'institutions' | 'assets' | 'learn'; locale: Locale; slug?: string }) {
  const { navigate } = useRouter()
  const openItem = (target: string) => navigate(target)
  const copy = COPY[locale][type]
  return (
    <main id="main-content" tabIndex={-1} className="info-page">
      <AppHeader locale={locale} />
      <section className="info-hero"><button className="back-link" onClick={() => navigate(`/${locale}/map`)}><ArrowLeft size={15} />{locale === 'ko' ? '지도로 돌아가기' : 'Back to map'}</button><h1>{copy[0]}</h1><p>{copy[1]}</p><small>{copy[2]}</small></section>
      <section className="editorial-grid">
        {(type === 'networks' ? NETWORKS : GUIDES[type]).map((item, index) => {
          const network = 'id' in item ? item : null
          const itemSlug = network ? network.id : String(index + 1)
          const guide = item as readonly [string, string, string, string]
          const title = network ? (locale === 'ko' ? network.label : network.labelEn) : guide[locale === 'ko' ? 0 : 1]
          const description = network ? (locale === 'ko' ? network.description : network.descriptionEn) : guide[locale === 'ko' ? 2 : 3]
          const target = network ? `/${locale}/map?network=${network.id}` : `/${locale}/${type}/${itemSlug}`
          return <article key={itemSlug} className={slug === itemSlug ? 'active' : ''}><button type="button" aria-current={slug === itemSlug ? 'page' : undefined} onClick={() => openItem(target)}><span>0{index + 1}</span><div><h2>{title}</h2><p>{description}</p></div><ArrowRight aria-hidden="true" /></button></article>
        })}
      </section>
      <section className="flow-principles"><div><Network /><h2>{locale === 'ko' ? '하나의 선, 하나의 의미' : 'One line, one meaning'}</h2><p>{locale === 'ko' ? '메시지·청산·결제·자산 이전을 서로 다른 선으로 구분합니다.' : 'Messaging, clearing, settlement and asset transfer use distinct visual encodings.'}</p></div><div><Landmark /><h2>{locale === 'ko' ? '출처가 있는 숫자' : 'Source-backed figures'}</h2><p>{locale === 'ko' ? '모든 수치에 기관, 기준 기간과 갱신 주기를 연결합니다.' : 'Every figure links to its provider, coverage period and release cadence.'}</p></div><div><BookOpen /><h2>{locale === 'ko' ? '두 단계의 깊이' : 'Two levels of depth'}</h2><p>{locale === 'ko' ? '기본 보기는 개념을, 전문 보기는 비교와 방법론을 강조합니다.' : 'Basic mode teaches concepts; Pro mode emphasizes comparison and methodology.'}</p></div></section>
    </main>
  )
}
