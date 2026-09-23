import { NETWORKS, networkSources } from './data'
import { FLOW_GUIDES, type FlowGuide } from './flowGuides'
import type { DataBundle, Locale, Metric, NetworkId, SourceRecord } from './types'

type LocalizedText = Record<Locale, string>
type ProcessReference = NonNullable<FlowGuide['references']>[number]

export interface BriefNetworkEvidence {
  id: NetworkId
  label: LocalizedText
  scope: LocalizedText
  steps: FlowGuide['steps']
  roles: LocalizedText[]
  boundary: LocalizedText
  metrics: Array<Metric & { source: SourceRecord | null }>
  sources: SourceRecord[]
  references: ProcessReference[]
  oldestRetrievedAt: string | null
  newestRetrievedAt: string | null
}

export interface BriefEvidence {
  networks: BriefNetworkEvidence[]
  sources: SourceRecord[]
  references: ProcessReference[]
  metricCount: number
  sourceCount: number
  referenceCount: number
  networksWithoutMetrics: NetworkId[]
  oldestRetrievedAt: string | null
  newestRetrievedAt: string | null
}

function retrievalRange(sources: SourceRecord[]) {
  const dates = sources.map(source => source.retrievedAt)
    .filter(date => Number.isFinite(Date.parse(date)))
    .sort((a, b) => Date.parse(a) - Date.parse(b))
  return { oldestRetrievedAt: dates[0] ?? null, newestRetrievedAt: dates.at(-1) ?? null }
}

const uniqueSources = (sources: SourceRecord[]) => [...new Map(sources.map(source => [source.id, source])).values()]

// Preserve recorded values and provenance. Different metrics are not normalized
// into a common KPI, and unavailable metrics are never filled in with zero.
export function buildBriefEvidence(selected: NetworkId[], data: DataBundle): BriefEvidence {
  const sourceById = new Map(data.sources.map(source => [source.id, source]))
  const networks = [...new Set(selected)].map(id => {
    const network = NETWORKS.find(network => network.id === id)!
    const guide = FLOW_GUIDES[id]
    const sources = uniqueSources(networkSources([id], data))
    return {
      id,
      label: { ko: network.label, en: network.labelEn },
      scope: { ko: network.description, en: network.descriptionEn },
      steps: guide.steps,
      roles: guide.roles,
      boundary: guide.boundary,
      metrics: data.metrics.filter(metric => metric.networkId === id).map(metric => ({ ...metric, source: sourceById.get(metric.sourceId) ?? null })),
      sources,
      references: guide.references ?? [],
      ...retrievalRange(sources),
    }
  })
  const sources = uniqueSources(networkSources(selected, data))
  const references = [...new Map(networks.flatMap(network => network.references).map(reference => [reference.url, reference])).values()]
  return {
    networks,
    sources,
    references,
    metricCount: networks.reduce((count, network) => count + network.metrics.length, 0),
    sourceCount: sources.length,
    referenceCount: references.length,
    networksWithoutMetrics: networks.filter(network => !network.metrics.length).map(network => network.id),
    ...retrievalRange(sources),
  }
}
