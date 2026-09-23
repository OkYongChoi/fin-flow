import { ArrowLeft, ArrowRight, BookOpen, Cable, CircleDollarSign, Landmark, Network } from 'lucide-react'
import { lazy, Suspense, useEffect, useRef } from 'react'
import { AppHeader } from '../App'
import { NETWORKS } from '../data'
import type { Locale, NetworkId } from '../types'
import { useRouter } from '../router'
import { NetworkGuide } from './NetworkGuide'

const FinanceGlossary = lazy(() => import('./FinanceGlossary'))

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

const GUIDE_NETWORKS: Record<'institutions' | 'assets' | 'learn', readonly NetworkId[]> = {
  institutions: ['chips-fedwire', 'swift', 'visa', 'usdc'],
  assets: ['swift', 'chips-fedwire', 'derivatives', 'usdc'],
  learn: ['swift', 'visa', 'chips-fedwire', 'derivatives'],
}

export function InfoPage({ type, locale, slug }: { type: 'networks' | 'institutions' | 'assets' | 'learn'; locale: Locale; slug?: string }) {
  const { navigate } = useRouter()
  const detailRef = useRef<HTMLDivElement>(null)
  const validSlugs = type === 'networks' ? NETWORKS.map((network) => network.id) : GUIDES[type].map((_, index) => String(index + 1))
  useEffect(() => { if (slug && !validSlugs.includes(slug)) navigate(`/${locale}/${type}`, true) }, [locale, navigate, slug, type, validSlugs])
  useEffect(() => { if (slug) { detailRef.current?.focus({ preventScroll: true }); detailRef.current?.scrollIntoView({ block: 'nearest' }) } }, [slug, type])
  const openItem = (target: string) => navigate(target)
  const copy = COPY[locale][type]
  return (
    <main id="main-content" tabIndex={-1} className="info-page">
      <AppHeader locale={locale} />
      <section className="info-hero"><button className="back-link" onClick={() => navigate(`/${locale}/map`)}><ArrowLeft size={15} />{locale === 'ko' ? '지도로 돌아가기' : 'Back to map'}</button><h1>{copy[0]}</h1><p>{copy[1]}</p><small>{copy[2]}</small></section>
      {type === 'learn' && <Suspense fallback={<p role="status">{locale === 'ko' ? '금융 용어집을 불러오는 중…' : 'Loading the finance glossary…'}</p>}><FinanceGlossary locale={locale} /></Suspense>}
      <section className="editorial-grid">
        {(type === 'networks' ? NETWORKS : GUIDES[type]).map((item, index) => {
          const network = 'id' in item ? item : null
          const itemSlug = network ? network.id : String(index + 1)
          const guide = item as readonly [string, string, string, string]
          const title = network ? (locale === 'ko' ? network.label : network.labelEn) : guide[locale === 'ko' ? 0 : 1]
          const description = network ? (locale === 'ko' ? network.description : network.descriptionEn) : guide[locale === 'ko' ? 2 : 3]
          const target = network ? `/${locale}/map?network=${network.id}` : `/${locale}/${type}/${itemSlug}`
          const related = !network && type !== 'networks' ? GUIDE_NETWORKS[type][index] : null
          const relatedNetwork = NETWORKS.find(item => item.id === related)
          return <article key={itemSlug} className={slug === itemSlug ? 'active' : ''}><button type="button" aria-current={slug === itemSlug ? 'page' : undefined} aria-expanded={!network ? slug === itemSlug : undefined} aria-controls={!network ? `guide-${itemSlug}` : undefined} onClick={() => openItem(target)}><span>{String(index + 1).padStart(2, '0')}</span><div><h2>{title}</h2><p>{description}</p></div><ArrowRight aria-hidden="true" /></button>
            {related && relatedNetwork && <div id={`guide-${itemSlug}`} className="guide-detail" hidden={slug !== itemSlug} ref={slug === itemSlug ? detailRef : undefined} tabIndex={-1} role="region" aria-label={`${title} · ${locale === 'ko' ? '상세 가이드' : 'Detailed guide'}`}>
              <p>{locale === 'ko' ? '관련 흐름' : 'Related flow'}: <strong>{locale === 'ko' ? relatedNetwork.label : relatedNetwork.labelEn}</strong></p>
              <NetworkGuide network={related} locale={locale} id={`guide-flow-${itemSlug}`} />
              <div className="brief-actions"><button className="brief-button" onClick={() => navigate(`/${locale}/map?network=${related}`)}>{locale === 'ko' ? '원문과 지표 보기' : 'View sources and metrics'}<ArrowRight size={16} /></button><button className="brief-button primary" onClick={() => navigate(`/${locale}/workspace?network=${related}`)}>{locale === 'ko' ? '이 흐름으로 브리핑 작성' : 'Create a brief from this flow'}</button></div>
            </div>}
          </article>
        })}
      </section>
      <section className="flow-principles"><div><Network /><h2>{locale === 'ko' ? '역할부터 이해하기' : 'Start with the roles'}</h2><p>{locale === 'ko' ? '메시지·청산·결제·자산 이전의 역할과 경계를 단계별로 확인합니다.' : 'Follow the roles and boundaries of messaging, clearing, settlement and asset transfer.'}</p></div><div><Landmark /><h2>{locale === 'ko' ? '출처가 있는 숫자' : 'Source-backed figures'}</h2><p>{locale === 'ko' ? '모든 수치에 기관, 기준 기간과 갱신 주기를 연결합니다.' : 'Every figure links to its provider, coverage period and release cadence.'}</p></div><div><BookOpen /><h2>{locale === 'ko' ? '이해에서 내 문서로' : 'From understanding to your own brief'}</h2><p>{locale === 'ko' ? '원문을 확인하고 내 질문을 더해 무료로 브리핑을 내보내세요.' : 'Check the sources, add your questions and export a brief for free.'}</p></div></section>
    </main>
  )
}
