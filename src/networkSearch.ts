import { NETWORKS } from './data'
import type { NetworkId } from './types'

// Discovery terms point to related guides; the guides retain their own scope and boundaries.
const SEARCH_ALIASES: Record<NetworkId, readonly string[]> = {
  swift: ['bank transfer', '계좌이체', '송금', '해외 송금', '국제 송금', '은행 송금', '은행 간 메시지', 'international transfer', 'money transfer', 'send money abroad', 'remittance', 'cross-border payment'],
  visa: ['카드 결제', '신용카드', '체크카드', '가맹점 결제', '카드 승인', 'card payment', 'credit card', 'debit card', 'pay by card', 'merchant payment'],
  'chips-fedwire': ['bank transfer', '계좌이체', '달러 송금', '고액 송금', '미국 달러 결제', '은행 간 결제', 'dollar transfer', 'dollar settlement', 'wire transfer', 'interbank settlement'],
  'bond-issuance': ['회사채', '채권 발행', '회사 자금 조달', 'corporate bond', 'new bond', 'bond offering', 'issuing bonds'],
  'securities-issuance': ['공모주', '주식 공모', '청약', '국채 입찰', '주식 발행', 'IPO', 'initial public offering', 'stock offering', 'treasury auction'],
  'bond-servicing': ['채권 이자', '이자 지급', '만기 상환', '채권 상환', 'bond interest', 'coupon payment', 'bond repayment', 'bond maturity'],
  'multi-bond-issuance': ['회차별 채권', '여러 채권 발행', '분할 발행', '발행 프로그램', 'multiple bond offerings', 'bond programme', 'bond program', 'bond tranches'],
  'asset-backed-securitization': ['대출 유동화', '대출 묶음', '자산 담보 증권', '주택저당증권', 'ABS', 'MBS', 'loan pool', 'asset backed securities', 'mortgage backed securities'],
  derivatives: ['장외 파생상품', '스왑', '위험 헤지', '금리 스왑', 'swap', 'interest rate swap', 'hedging', 'over the counter'],
  'leveraged-derivatives-issuance': ['레버리지 상품', '배율 상품', '지렛대 투자', 'leveraged product', 'leveraged derivative', 'leverage'],
  'credit-derivatives': ['신용부도스왑', '부도 위험', '채무 불이행', '신용 사건', 'CDS', 'credit default swap', 'default risk', 'credit event'],
  'listed-derivatives': ['선물', '옵션', '거래소 파생상품', '증거금', 'futures', 'options', 'exchange traded derivatives', 'margin'],
  'fx-pvp': ['환전', '외환 거래', '통화 교환', '환율', 'CLS', 'currency exchange', 'foreign exchange', 'currency settlement', 'forex'],
  'repo-financing': ['환매조건부', '담보 대출', '단기 자금', '증권 담보', 'repurchase agreement', 'secured funding', 'short term funding', 'securities collateral'],
  'triparty-collateral': ['담보 관리', '담보 배정', '담보 보관', '삼자 담보', 'collateral management', 'collateral allocation', 'collateral custody', 'tri party'],
  'etf-primary-market': ['ETF', '상장지수펀드', 'ETF 설정', 'ETF 환매', '레버리지 ETF', 'exchange traded fund', 'ETF creation', 'ETF redemption', 'leveraged ETF'],
  'securities-lending': ['주식 빌리기', '주식 대여', '주식 대차', '증권 대여', 'stock lending', 'share lending', 'borrow shares', 'borrow stock'],
  'syndicated-loans': ['공동 대출', '여러 은행 대출', '기업 대출', '대주단', 'syndicated loan', 'loan syndication', 'corporate loan', 'lending syndicate'],
  usdc: ['디지털 달러', '스테이블코인', '달러 토큰', '온체인 전송', 'digital dollar', 'stablecoin', 'dollar token', 'onchain transfer'],
}

const normalize = (value: string) => value.normalize('NFKC').toLowerCase().replace(/[\s_-]+/g, '')
const SEARCH_INDEX = NETWORKS.map(network => ({
  network,
  terms: [network.label, network.labelEn, network.description, network.descriptionEn, ...SEARCH_ALIASES[network.id]].map(normalize),
}))

export function searchNetworks(query: string): typeof NETWORKS {
  const needle = normalize(query)
  if (!needle) return NETWORKS
  return SEARCH_INDEX.filter(({ terms }) => terms.some(term => term.includes(needle))).map(({ network }) => network)
}
