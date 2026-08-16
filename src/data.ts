import type { DataBundle, FlowEdge, FlowNode, Metric, NetworkId, SourceRecord } from './types'

export const NETWORKS: Array<{ id: NetworkId; label: string; labelEn: string; description: string; descriptionEn: string }> = [
  { id: 'swift', label: 'SWIFT', labelEn: 'SWIFT', description: '은행 간 메시지 네트워크', descriptionEn: 'Interbank messaging network' },
  { id: 'visa', label: 'Visa', labelEn: 'Visa', description: '카드 승인·청산·결제 네트워크', descriptionEn: 'Card authorization, clearing and settlement' },
  { id: 'chips-fedwire', label: 'CHIPS · Fedwire', labelEn: 'CHIPS · Fedwire', description: '미국 달러 고액 결제', descriptionEn: 'High-value US dollar payments' },
  { id: 'bond-issuance', label: '채권 발행', labelEn: 'Bond issuance', description: '발행사·IB·예탁결제의 1차 시장 배정·결제 구조', descriptionEn: 'Primary-market allocation and settlement across issuer, IB and depository' },
  { id: 'bond-servicing', label: '채권 사후지급', labelEn: 'Bond servicing', description: '이표·상환 공시와 지급대행·예탁결제 배분 구조', descriptionEn: 'Coupon and redemption announcement, paying-agent, and depository allocation structure' },
  { id: 'derivatives', label: '파생상품', labelEn: 'OTC derivatives', description: 'OTC 계약·확인·담보·청산의 수명주기', descriptionEn: 'OTC contract, confirmation, collateral, and clearing lifecycle' },
  { id: 'listed-derivatives', label: '상장 파생상품', labelEn: 'Listed derivatives', description: '거래소 체결·청산회원·일일 정산·만기의 상장상품 구조', descriptionEn: 'Exchange execution, clearing-member, daily settlement, and expiry structure' },
  { id: 'fx-pvp', label: 'FX PvP 결제', labelEn: 'FX PvP settlement', description: '외환 지급지시의 동시 결제와 다자간 상계 구조', descriptionEn: 'Simultaneous settlement and multilateral netting of FX payment instructions' },
  { id: 'repo-financing', label: '레포 자금조달', labelEn: 'Repo financing', description: '담보증권을 이용한 단기 자금조달·반환 구조', descriptionEn: 'Short-term funding and return structure using securities collateral' },
  { id: 'etf-primary-market', label: 'ETF 1차시장', labelEn: 'ETF primary market', description: 'AP의 설정·환매와 바스켓 인도 구조', descriptionEn: 'AP creation/redemption and basket-delivery structure' },
  { id: 'securities-lending', label: '증권대차', labelEn: 'Securities lending', description: '대차·담보·시가평가·반환 구조', descriptionEn: 'Loan, collateral, mark-to-market, and return structure' },
  { id: 'syndicated-loans', label: '신디케이트 론', labelEn: 'Syndicated loans', description: '주선·신디케이션·종결·에이전시 구조', descriptionEn: 'Arrange, syndicate, close, and agency structure' },
  { id: 'usdc', label: 'Circle USDC', labelEn: 'Circle USDC', description: '발행·상환·온체인 이동', descriptionEn: 'Issuance, redemption and on-chain transfer' },
]

export const NETWORK_COLORS: Record<NetworkId, [number, number, number]> = {
  swift: [48, 194, 241],
  visa: [43, 119, 255],
  'chips-fedwire': [255, 169, 36],
  'bond-issuance': [255, 122, 89],
  'bond-servicing': [235, 180, 65],
  derivatives: [173, 92, 255],
  'listed-derivatives': [141, 112, 255],
  'fx-pvp': [41, 185, 133],
  'repo-financing': [224, 135, 49],
  'etf-primary-market': [34, 155, 219],
  'securities-lending': [209, 85, 137],
  'syndicated-loans': [100, 167, 72],
  usdc: [63, 211, 185],
}

export const NODES: FlowNode[] = [
  { id: 'new-york', label: 'New York', coordinates: [-74, 40.7], kind: 'financial_center' },
  { id: 'chicago', label: 'Chicago', coordinates: [-87.63, 41.88], kind: 'financial_center' },
  { id: 'london', label: 'London', coordinates: [-0.1, 51.5], kind: 'financial_center' },
  { id: 'frankfurt', label: 'Frankfurt', coordinates: [8.7, 50.1], kind: 'financial_center' },
  { id: 'seoul', label: 'Seoul', coordinates: [126.98, 37.57], kind: 'financial_center' },
  { id: 'tokyo', label: 'Tokyo', coordinates: [139.7, 35.7], kind: 'financial_center' },
  { id: 'hong-kong', label: 'Hong Kong', coordinates: [114.17, 22.32], kind: 'financial_center' },
  { id: 'singapore', label: 'Singapore', coordinates: [103.82, 1.35], kind: 'financial_center' },
  { id: 'dubai', label: 'Dubai', coordinates: [55.27, 25.2], kind: 'financial_center' },
  { id: 'sao-paulo', label: 'São Paulo', coordinates: [-46.63, -23.55], kind: 'financial_center' },
]

const edge = (id: string, networkId: NetworkId, source: string, target: string, semantic: FlowEdge['semantic'], sourceIds: string[]): FlowEdge => ({
  id, networkId, source, target, semantic, representation: 'schematic', sourceIds, coveragePeriod: 'illustrative system path',
})

export const EDGES: FlowEdge[] = [
  edge('s1', 'swift', 'new-york', 'london', 'message', ['swift-2025']), edge('s2', 'swift', 'london', 'singapore', 'message', ['swift-2025']), edge('s3', 'swift', 'frankfurt', 'seoul', 'message', ['swift-2025']),
  edge('v1', 'visa', 'new-york', 'sao-paulo', 'authorization', ['visa-2025']), edge('v2', 'visa', 'london', 'dubai', 'clearing', ['visa-2025']), edge('v3', 'visa', 'singapore', 'tokyo', 'settlement', ['visa-2025']),
  edge('c1', 'chips-fedwire', 'new-york', 'london', 'settlement', ['chips-2025', 'fedwire-2025']), edge('c2', 'chips-fedwire', 'new-york', 'frankfurt', 'settlement', ['chips-2025', 'fedwire-2025']), edge('c3', 'chips-fedwire', 'new-york', 'singapore', 'settlement', ['chips-2025', 'fedwire-2025']),
  edge('b1', 'bond-issuance', 'new-york', 'london', 'issuance', ['dtcc-underwriting', 'sec-t1']), edge('b2', 'bond-issuance', 'new-york', 'tokyo', 'issuance', ['dtcc-underwriting', 'sec-t1']), edge('b3', 'bond-issuance', 'london', 'singapore', 'issuance', ['dtcc-underwriting']),
  edge('bs1', 'bond-servicing', 'new-york', 'london', 'settlement', ['dtcc-redemptions']), edge('bs2', 'bond-servicing', 'new-york', 'tokyo', 'settlement', ['dtcc-redemptions']), edge('bs3', 'bond-servicing', 'new-york', 'singapore', 'settlement', ['dtcc-redemptions']),
  edge('d1', 'derivatives', 'london', 'new-york', 'clearing', ['bis-otc', 'isda-collateral']), edge('d2', 'derivatives', 'london', 'tokyo', 'clearing', ['bis-otc', 'isda-collateral']), edge('d3', 'derivatives', 'new-york', 'hong-kong', 'clearing', ['bis-otc', 'isda-collateral']),
  edge('ld1', 'listed-derivatives', 'chicago', 'new-york', 'clearing', ['cme-clearing']), edge('ld2', 'listed-derivatives', 'chicago', 'london', 'clearing', ['cme-clearing']), edge('ld3', 'listed-derivatives', 'chicago', 'singapore', 'settlement', ['cme-clearing']),
  edge('f1', 'fx-pvp', 'london', 'new-york', 'settlement', ['cls-settlement']), edge('f2', 'fx-pvp', 'tokyo', 'london', 'settlement', ['cls-settlement']), edge('f3', 'fx-pvp', 'singapore', 'new-york', 'settlement', ['cls-settlement']),
  edge('r1', 'repo-financing', 'new-york', 'london', 'clearing', ['ficc-repo']), edge('r2', 'repo-financing', 'new-york', 'tokyo', 'clearing', ['ficc-repo']), edge('r3', 'repo-financing', 'new-york', 'singapore', 'clearing', ['ficc-repo']),
  edge('e1', 'etf-primary-market', 'new-york', 'london', 'issuance', ['sec-etf']), edge('e2', 'etf-primary-market', 'new-york', 'tokyo', 'issuance', ['sec-etf']), edge('e3', 'etf-primary-market', 'new-york', 'singapore', 'issuance', ['sec-etf']),
  edge('l1', 'securities-lending', 'london', 'new-york', 'asset_transfer', ['dtcc-securities-financing']), edge('l2', 'securities-lending', 'london', 'tokyo', 'asset_transfer', ['dtcc-securities-financing']), edge('l3', 'securities-lending', 'new-york', 'hong-kong', 'asset_transfer', ['dtcc-securities-financing']),
  edge('y1', 'syndicated-loans', 'new-york', 'london', 'issuance', ['lsta-market-practice']), edge('y2', 'syndicated-loans', 'london', 'singapore', 'issuance', ['lsta-market-practice']), edge('y3', 'syndicated-loans', 'new-york', 'hong-kong', 'issuance', ['lsta-market-practice']),
  edge('u1', 'usdc', 'new-york', 'singapore', 'asset_transfer', ['circle-contracts']), edge('u2', 'usdc', 'london', 'seoul', 'asset_transfer', ['circle-contracts']), edge('u3', 'usdc', 'singapore', 'tokyo', 'asset_transfer', ['circle-contracts']),
]

export async function fetchDataBundle(): Promise<DataBundle> {
  const [manifestResponse, sourcesResponse, metricsResponse] = await Promise.all([
    fetch('/data/manifest.json'), fetch('/data/sources.json'), fetch('/data/metrics.json'),
  ])
  if (!manifestResponse.ok || !sourcesResponse.ok || !metricsResponse.ok) {
    const statuses = [manifestResponse, sourcesResponse, metricsResponse].map((response) => response.status).join(', ')
    throw new Error(`Unable to load source-backed data (${statuses})`)
  }
  const [manifest, sources, metrics] = await Promise.all([
    manifestResponse.json() as Promise<{ version: string; generatedAt: string; coverageNotice: string }>,
    sourcesResponse.json() as Promise<SourceRecord[]>,
    metricsResponse.json() as Promise<Metric[]>,
  ])
  return { ...manifest, sources, metrics }
}

export const getNode = (id: string) => NODES.find((node) => node.id === id)!
