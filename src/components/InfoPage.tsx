import { ArrowLeft, ArrowRight, BookOpen, Landmark, Network } from 'lucide-react'
import { AppHeader } from '../App'
import { NETWORKS } from '../data'
import type { Locale } from '../types'
import { useRouter } from '../router'

type PageType = 'networks' | 'institutions' | 'assets' | 'learn'

type LocalizedText = {
  ko: string
  en: string
}

type InfoCard = {
  id: string
  title: LocalizedText
  description: LocalizedText
  detail: LocalizedText
}

const COPY: Record<PageType, { title: LocalizedText; lead: LocalizedText; summary: LocalizedText }> = {
  networks: {
    title: { ko: '금융 네트워크', en: 'Financial networks' },
    lead: { ko: '돈이 움직이기 전에, 메시지와 장부가 먼저 움직입니다.', en: 'Messages and ledgers move before money does.' },
    summary: { ko: '각 네트워크가 메시징, 승인, 청산, 결제 중 어떤 역할을 맡는지 분리해 살펴보세요.', en: 'See exactly which network handles messaging, authorization, clearing or settlement.' },
  },
  institutions: {
    title: { ko: '기관', en: 'Institutions' },
    lead: { ko: '같은 거래도 여러 기관의 장부를 통과합니다.', en: 'A single transaction crosses several institutional ledgers.' },
    summary: { ko: '중앙은행, 상업은행, 카드 네트워크, 청산기관과 스테이블코인 발행자의 역할을 비교합니다.', en: 'Compare central banks, commercial banks, card networks, clearing houses and stablecoin issuers.' },
  },
  assets: {
    title: { ko: '자산의 흐름', en: 'Asset flows' },
    lead: { ko: 'USD와 USDC는 같은 단위를 쓰지만 움직이는 장부가 다릅니다.', en: 'USD and USDC share a unit, but live on different ledgers.' },
    summary: { ko: '은행 예금, 중앙은행 준비금, 파생상품 담보와 온체인 토큰의 이동을 구분합니다.', en: 'Separate bank deposits, central-bank reserves, derivatives collateral and on-chain tokens.' },
  },
  learn: {
    title: { ko: '배우기', en: 'Learn' },
    lead: { ko: '국제 금융 인프라를 단계별로 해체합니다.', en: 'Break international financial infrastructure into observable stages.' },
    summary: { ko: '복잡한 거래를 메시지, 승인, 청산, 상계, 최종결제와 자산 이전으로 나눠 이해합니다.', en: 'Understand complex transactions as messaging, authorization, clearing, netting, settlement and asset transfer.' },
  },
}

const NETWORK_DETAILS: Record<string, LocalizedText> = {
  swift: {
    ko: 'SWIFT는 금융기관 사이에서 표준화된 지급 지시와 상태 메시지를 전달합니다. 실제 자금의 최종 이전은 연결된 결제 시스템과 은행 장부에서 별도로 일어납니다.',
    en: 'SWIFT carries standardized payment instructions and status messages between financial institutions. Final value moves separately across connected payment systems and bank ledgers.',
  },
  visa: {
    ko: 'Visa는 카드 거래의 승인 요청을 전달하고 거래를 청산한 뒤, 회원 금융기관 사이의 결제 의무가 이행되도록 조정합니다.',
    en: 'Visa routes card authorization requests, clears transactions and coordinates the settlement obligations between participating financial institutions.',
  },
  'chips-fedwire': {
    ko: 'CHIPS는 다자간 상계로 유동성 사용을 줄이고, Fedwire는 연방준비은행 계좌에서 실시간 총액결제를 수행합니다. 둘은 직렬 단계가 아니라 별도의 달러 결제 경로입니다.',
    en: 'CHIPS reduces liquidity needs through multilateral netting, while Fedwire provides real-time gross settlement in Federal Reserve accounts. They are alternative dollar rails, not sequential stages.',
  },
  derivatives: {
    ko: 'OTC 파생상품 흐름은 계약 체결, 가치평가, 증거금과 담보 이전, 청산 또는 만기 정산으로 나뉩니다. 명목금액은 실제 결제액과 같지 않습니다.',
    en: 'OTC derivatives flows separate execution, valuation, margin and collateral transfers, clearing and maturity settlement. Notional amount is not the same as cash settled.',
  },
  usdc: {
    ko: 'USDC는 준비자산과 연결된 발행·상환 절차와 퍼블릭 블록체인상의 토큰 이전을 결합합니다. 온체인 이동과 법정통화 은행 결제는 서로 다른 장부에서 일어납니다.',
    en: 'USDC combines reserve-backed issuance and redemption with token transfers on public blockchains. On-chain movement and fiat bank settlement occur on different ledgers.',
  },
}

const CARDS: Record<Exclude<PageType, 'networks'>, InfoCard[]> = {
  institutions: [
    {
      id: 'central-banks',
      title: { ko: '중앙은행', en: 'Central banks' },
      description: { ko: '준비금 계좌와 핵심 결제 인프라를 운영합니다.', en: 'Operate reserve accounts and core settlement infrastructure.' },
      detail: { ko: '중앙은행 화폐로 이루어진 결제는 상업은행 사이의 의무를 가장 높은 수준에서 소멸시키며, 통화정책과 금융안정 운영에도 연결됩니다.', en: 'Settlement in central-bank money extinguishes obligations between commercial banks at the highest level and connects payment operations to monetary and financial-stability policy.' },
    },
    {
      id: 'commercial-banks',
      title: { ko: '상업은행', en: 'Commercial banks' },
      description: { ko: '고객 예금을 기록하고 지급 지시를 보내고 받습니다.', en: 'Record customer deposits and send and receive payment instructions.' },
      detail: { ko: '고객이 보는 예금 이동과 은행 사이의 준비금 또는 환거래 계좌 이동은 별개의 장부 기록이며, 중개은행이 경로에 추가될 수 있습니다.', en: 'The deposit movement customers see is distinct from reserve or correspondent-account movements between banks, and intermediary banks may be added to the route.' },
    },
    {
      id: 'clearing-houses',
      title: { ko: '청산기관', en: 'Clearing houses' },
      description: { ko: '참가자의 의무를 계산하고 상계하며 결제를 준비합니다.', en: 'Calculate and net participant obligations before settlement.' },
      detail: { ko: '청산은 누가 얼마를 지급해야 하는지 확정하는 과정입니다. 실제 자산 이전인 최종결제와 구분해야 합니다.', en: 'Clearing determines who owes what. It should be distinguished from final settlement, where the asset itself is transferred.' },
    },
    {
      id: 'card-networks',
      title: { ko: '카드 네트워크', en: 'Card networks' },
      description: { ko: '가맹점, 매입사와 발급사 사이의 승인·청산을 연결합니다.', en: 'Connect authorization and clearing across merchants, acquirers and issuers.' },
      detail: { ko: '승인은 거래 가능 여부를 확인하지만 최종 자금 이동은 아닙니다. 거래 묶음은 이후 청산되고 회원 금융기관 사이에서 결제됩니다.', en: 'Authorization confirms whether a transaction may proceed; it is not final money movement. Batches are cleared later and settled between member financial institutions.' },
    },
    {
      id: 'stablecoin-issuers',
      title: { ko: '스테이블코인 발행자', en: 'Stablecoin issuers' },
      description: { ko: '준비자산을 관리하고 토큰의 발행과 상환을 수행합니다.', en: 'Manage reserves and issue and redeem tokens.' },
      detail: { ko: '발행자는 법정통화 입금과 토큰 발행을 연결하고, 상환 시 토큰을 소각한 뒤 법정통화를 지급합니다. 블록체인 검증자와는 역할이 다릅니다.', en: 'Issuers connect fiat deposits to token minting and burn tokens before paying fiat on redemption. Their role differs from that of blockchain validators.' },
    },
  ],
  assets: [
    {
      id: 'bank-deposits',
      title: { ko: '은행 예금', en: 'Bank deposits' },
      description: { ko: '상업은행이 고객에게 진 장부상 채무입니다.', en: 'Book-entry liabilities commercial banks owe to customers.' },
      detail: { ko: '예금 지급은 고객 계좌를 바꾸며, 다른 은행으로 이동할 때는 은행 간 결제 자산의 이전이 함께 필요합니다.', en: 'A deposit payment changes customer accounts; when it crosses banks, a corresponding transfer of interbank settlement assets is also required.' },
    },
    {
      id: 'central-bank-reserves',
      title: { ko: '중앙은행 준비금', en: 'Central-bank reserves' },
      description: { ko: '은행이 중앙은행에 보유하는 결제 자산입니다.', en: 'Settlement assets banks hold at a central bank.' },
      detail: { ko: '준비금은 일반 고객이 직접 보유하는 예금이 아니며, 지정된 금융기관 사이의 최종결제와 유동성 관리에 사용됩니다.', en: 'Reserves are not retail customer deposits; eligible institutions use them for final settlement and liquidity management.' },
    },
    {
      id: 'derivatives-collateral',
      title: { ko: '파생상품 담보', en: 'Derivatives collateral' },
      description: { ko: '시장가치 변동과 거래상대방 위험을 뒷받침합니다.', en: 'Covers market-value changes and counterparty exposure.' },
      detail: { ko: '증거금과 담보는 계약의 명목금액 전체가 이동하는 것이 아닙니다. 가치평가와 위험 규칙에 따라 현금 또는 증권이 이전됩니다.', en: 'Margin and collateral do not represent movement of the full contract notional. Cash or securities move according to valuation and risk rules.' },
    },
    {
      id: 'usdc',
      title: { ko: 'USDC', en: 'USDC' },
      description: { ko: '지원 블록체인에서 이전되는 달러 표시 토큰입니다.', en: 'A dollar-denominated token transferred on supported blockchains.' },
      detail: { ko: '지갑 사이의 토큰 이전은 온체인에서 완결되지만, 발행과 상환은 발행자 및 은행 시스템의 법정통화 흐름에 의존합니다.', en: 'Wallet-to-wallet token transfers settle on-chain, while issuance and redemption depend on fiat flows through the issuer and banking system.' },
    },
  ],
  learn: [
    {
      id: 'messages-vs-money',
      title: { ko: '메시지와 돈', en: 'Messages vs money' },
      description: { ko: '지급 지시의 전달과 실제 자산 이전을 구분합니다.', en: 'Separate payment instructions from the transfer of value.' },
      detail: { ko: '메시징 네트워크는 누가 누구에게 무엇을 지급할지 전달합니다. 결제 시스템과 은행 장부가 그 지시에 따른 실제 잔액 변화를 기록합니다.', en: 'Messaging networks communicate who should pay whom and how much. Payment systems and bank ledgers record the resulting changes in balances.' },
    },
    {
      id: 'clearing-vs-settlement',
      title: { ko: '청산과 최종결제', en: 'Clearing vs settlement' },
      description: { ko: '의무 계산과 장부상 최종 이전을 구분합니다.', en: 'Distinguish obligation calculation from final ledger transfer.' },
      detail: { ko: '청산은 거래를 확인하고 참가자별 의무를 계산합니다. 최종결제는 합의된 결제 자산을 이전해 그 의무를 이행합니다.', en: 'Clearing confirms transactions and calculates participant obligations. Final settlement fulfills them by transferring the agreed settlement asset.' },
    },
    {
      id: 'netting-liquidity',
      title: { ko: '상계와 유동성', en: 'Netting and liquidity' },
      description: { ko: '여러 지급 의무를 압축해 필요한 결제 자금을 줄입니다.', en: 'Compress payment obligations to reduce settlement funding needs.' },
      detail: { ko: '상계는 반대 방향의 의무를 서로 차감합니다. 총액결제보다 적은 유동성으로 처리할 수 있지만, 규칙과 위험 통제가 필요합니다.', en: 'Netting offsets obligations in opposite directions. It can use less liquidity than gross settlement, but requires rules and risk controls.' },
    },
    {
      id: 'derivatives-collateral',
      title: { ko: '파생상품 담보', en: 'Derivatives collateral' },
      description: { ko: '명목금액, 시장가치, 증거금과 현금 이동을 구분합니다.', en: 'Separate notional, market value, margin and cash movement.' },
      detail: { ko: '명목금액은 계약 규모를 나타내는 기준값입니다. 실제 자금 이동은 시장가치 변화, 증거금 요구와 계약 정산 조건에 따라 달라집니다.', en: 'Notional is a reference amount describing contract scale. Actual money movement depends on market-value changes, margin requirements and settlement terms.' },
    },
  ],
}

function cardsFor(type: PageType): InfoCard[] {
  if (type !== 'networks') return CARDS[type]
  return NETWORKS.map((network) => ({
    id: network.id,
    title: { ko: network.label, en: network.labelEn },
    description: { ko: network.description, en: network.descriptionEn },
    detail: NETWORK_DETAILS[network.id],
  }))
}

export function InfoPage({ type, locale, slug }: { type: PageType; locale: Locale; slug?: string }) {
  const { navigate, pathname } = useRouter()
  const routeSlug = slug ?? pathname.split('/').filter(Boolean)[2]
  const copy = COPY[type]
  const cards = cardsFor(type)
  const selected = routeSlug ? cards.find((card) => card.id === routeSlug) : undefined
  const unknownSlug = Boolean(routeSlug && !selected)
  const basePath = `/${locale}/${type}`

  const followLink = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault()
    navigate(href)
  }

  return (
    <main className="info-page">
      <AppHeader locale={locale} />
      <section className="info-hero">
        <button className="back-link" onClick={() => navigate(`/${locale}/map`)}><ArrowLeft size={15} />{locale === 'ko' ? '지도로 돌아가기' : 'Back to map'}</button>
        <h1>{copy.title[locale]}</h1>
        <p>{copy.lead[locale]}</p>
        <small>{copy.summary[locale]}</small>
      </section>
      <section className="editorial-grid">
        {cards.map((card, index) => {
          const isSelected = card.id === routeSlug
          const href = `${basePath}/${card.id}`
          return (
            <a key={card.id} href={href} onClick={(event) => followLink(event, href)} aria-current={isSelected ? 'page' : undefined}>
              <article className={isSelected ? 'active' : ''}>
                <span>0{index + 1}</span>
                <div>
                  <h2>{card.title[locale]}</h2>
                  <p>{card.description[locale]}{isSelected ? <><br /><br />{card.detail[locale]}</> : null}</p>
                </div>
                <ArrowRight aria-hidden="true" />
              </article>
            </a>
          )
        })}
        {unknownSlug ? (
          <a href={basePath} onClick={(event) => followLink(event, basePath)}>
            <article className="active">
              <span>!</span>
              <div>
                <h2>{locale === 'ko' ? '항목을 찾을 수 없습니다' : 'Topic not found'}</h2>
                <p>{locale === 'ko' ? '이 주소의 항목은 존재하지 않습니다. 전체 목록으로 돌아가 다른 항목을 선택하세요.' : 'This address does not match an available topic. Return to the full list and choose another item.'}</p>
              </div>
              <ArrowLeft aria-hidden="true" />
            </article>
          </a>
        ) : null}
      </section>
      <section className="flow-principles">
        <div><Network /><h2>{locale === 'ko' ? '하나의 선, 하나의 의미' : 'One line, one meaning'}</h2><p>{locale === 'ko' ? '메시지·청산·결제·자산 이전을 서로 다른 선으로 구분합니다.' : 'Messaging, clearing, settlement and asset transfer use distinct visual encodings.'}</p></div>
        <div><Landmark /><h2>{locale === 'ko' ? '출처가 있는 숫자' : 'Source-backed figures'}</h2><p>{locale === 'ko' ? '모든 수치에 기관, 기준 기간과 갱신 주기를 연결합니다.' : 'Every figure links to its provider, coverage period and release cadence.'}</p></div>
        <div><BookOpen /><h2>{locale === 'ko' ? '두 단계의 깊이' : 'Two levels of depth'}</h2><p>{locale === 'ko' ? '기본 보기는 개념을, 전문 보기는 비교와 방법론을 강조합니다.' : 'Basic mode teaches concepts; Pro mode emphasizes comparison and methodology.'}</p></div>
      </section>
    </main>
  )
}
