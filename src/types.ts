export type Locale = 'ko' | 'en'
export type NetworkId = 'swift' | 'visa' | 'chips-fedwire' | 'derivatives' | 'usdc'
export type FlowSemantic = 'message' | 'authorization' | 'clearing' | 'settlement' | 'asset_transfer'
export type Representation = 'observed_aggregate' | 'schematic' | 'simulated'

export interface SourceRecord {
  id: string
  provider: string
  title: string
  url: string
  publishedAt: string
  retrievedAt: string
  coveragePeriod: string
  cadence: string
}

export interface Metric {
  id: string
  networkId: NetworkId
  labelKo: string
  labelEn: string
  value: number
  display: string
  unit: string
  coveragePeriod: string
  sourceId: string
}

export interface FlowNode {
  id: string
  label: string
  coordinates: [number, number]
  kind: 'financial_center' | 'system' | 'chain'
}

export interface FlowEdge {
  id: string
  networkId: NetworkId
  source: string
  target: string
  semantic: FlowSemantic
  representation: Representation
  sourceIds: string[]
  coveragePeriod: string
}

export interface DataBundle {
  version: string
  generatedAt: string
  coverageNotice: string
  sources: SourceRecord[]
  metrics: Metric[]
}
