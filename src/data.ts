import type { DataBundle, FlowEdge, FlowNode, Metric, NetworkId, SourceRecord } from './types'

export const NETWORKS: Array<{ id: NetworkId; label: string; labelEn: string; description: string; descriptionEn: string }> = [
  { id: 'swift', label: 'SWIFT', labelEn: 'SWIFT', description: '은행 간 메시지 네트워크', descriptionEn: 'Interbank messaging network' },
  { id: 'visa', label: 'Visa', labelEn: 'Visa', description: '카드 승인·청산·결제 네트워크', descriptionEn: 'Card authorization, clearing and settlement' },
  { id: 'chips-fedwire', label: 'CHIPS · Fedwire', labelEn: 'CHIPS · Fedwire', description: '미국 달러 고액 결제', descriptionEn: 'High-value US dollar payments' },
  { id: 'derivatives', label: '파생상품', labelEn: 'OTC derivatives', description: 'OTC 계약·담보·청산', descriptionEn: 'OTC contracts, collateral and clearing' },
  { id: 'usdc', label: 'Circle USDC', labelEn: 'Circle USDC', description: '발행·상환·온체인 이동', descriptionEn: 'Issuance, redemption and on-chain transfer' },
]

export const NETWORK_COLORS: Record<NetworkId, [number, number, number]> = {
  swift: [48, 194, 241],
  visa: [43, 119, 255],
  'chips-fedwire': [255, 169, 36],
  derivatives: [173, 92, 255],
  usdc: [63, 211, 185],
}

export const NODES: FlowNode[] = [
  { id: 'new-york', label: 'New York', coordinates: [-74, 40.7], kind: 'financial_center' },
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
  edge('d1', 'derivatives', 'london', 'new-york', 'clearing', ['bis-otc']), edge('d2', 'derivatives', 'london', 'tokyo', 'clearing', ['bis-otc']), edge('d3', 'derivatives', 'new-york', 'hong-kong', 'clearing', ['bis-otc']),
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
