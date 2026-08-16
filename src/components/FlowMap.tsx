import { useEffect, useMemo, useState } from 'react'
import Map, { FullscreenControl, Marker, NavigationControl, Source, Layer, useControl } from 'react-map-gl/maplibre'
import { MapboxOverlay } from '@deck.gl/mapbox'
import { ArcLayer } from '@deck.gl/layers'
import { feature } from 'topojson-client'
import countries from 'world-atlas/countries-110m.json'
import 'maplibre-gl/dist/maplibre-gl.css'
import { EDGES, getNode, NETWORK_COLORS, NODES } from '../data'
import type { FlowEdge, Locale, NetworkId } from '../types'

const WORLD = feature(countries as never, (countries as { objects: { countries: never } }).objects.countries) as unknown as GeoJSON.FeatureCollection
const BASE_STYLE = { version: 8 as const, sources: {}, layers: [{ id: 'background', type: 'background' as const, paint: { 'background-color': '#061728' } }] }

const SEMANTIC_LABELS: Record<FlowEdge['semantic'], { ko: string; en: string }> = {
  message: { ko: '메시지 전달', en: 'Message transfer' },
  authorization: { ko: '승인', en: 'Authorization' },
  clearing: { ko: '청산', en: 'Clearing' },
  settlement: { ko: '결제', en: 'Settlement' },
  asset_transfer: { ko: '자산 이전', en: 'Asset transfer' },
  issuance: { ko: '발행', en: 'Issuance' },
}

const NETWORK_TABLE_SCOPE: Partial<Record<NetworkId, { ko: string; en: string }>> = {
  'bond-issuance': { ko: '채권 발행의 1차 시장 구조도', en: 'Primary-market bond issuance schematic' },
  'bond-servicing': { ko: '채권 사후지급·상환 구조도', en: 'Post-issuance bond servicing and redemption schematic' },
  derivatives: { ko: 'OTC 파생상품 청산 경로 구조도', en: 'OTC derivatives clearing-path schematic' },
  'listed-derivatives': { ko: '상장 파생상품 청산·일일 정산 구조도', en: 'Listed-derivatives clearing and daily-settlement schematic' },
}

function DeckOverlay({ layers }: { layers: ArcLayer<FlowEdge>[] }) {
  const overlay = useControl(() => new MapboxOverlay({ interleaved: false, layers }))
  overlay.setProps({ layers })
  return null
}

export default function FlowMap({ selected, proMode, locale }: { selected: NetworkId; proMode: boolean; locale: Locale }) {
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 820px)').matches)
  useEffect(() => {
    const query = window.matchMedia('(max-width: 820px)')
    const update = () => setMobile(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  const [activeNode, setActiveNode] = useState(mobile ? '' : 'new-york')
  const edges = proMode ? EDGES : EDGES.filter((edge) => edge.networkId === selected)
  const layers = useMemo(() => [new ArcLayer<FlowEdge>({
    id: `flows-${selected}-${proMode}`,
    data: edges,
    getSourcePosition: (edge) => getNode(edge.source).coordinates,
    getTargetPosition: (edge) => getNode(edge.target).coordinates,
    getSourceColor: (edge): [number, number, number, number] => [...NETWORK_COLORS[edge.networkId], edge.networkId === selected ? 235 : 68],
    getTargetColor: (edge): [number, number, number, number] => [...NETWORK_COLORS[edge.networkId], edge.networkId === selected ? 235 : 68],
    getWidth: (edge) => edge.networkId === selected ? 2.2 : 1,
    widthMinPixels: 1,
    getHeight: 0.22,
    greatCircle: false,
    pickable: true,
  })], [edges, proMode, selected])
  const selectedNode = NODES.find((node) => node.id === activeNode)
  const tableEdges = proMode ? edges : edges.filter((edge) => edge.networkId === selected)
  const tableScope = NETWORK_TABLE_SCOPE[selected]

  return (
    <section className="flow-map" role="region" aria-labelledby="map-title" aria-describedby="map-disclaimer">
      <Map initialViewState={{ longitude: mobile ? 15 : 22, latitude: mobile ? 20 : 25, zoom: mobile ? -0.1 : 1.25 }} minZoom={mobile ? -0.5 : 0.85} maxZoom={6} mapStyle={BASE_STYLE} attributionControl={false}>
        <Source id="countries" type="geojson" data={WORLD}>
          <Layer id="countries-fill" type="fill" paint={{ 'fill-color': '#173653', 'fill-opacity': 0.9 }} />
          <Layer id="countries-outline" type="line" paint={{ 'line-color': '#315474', 'line-width': 0.55, 'line-opacity': 0.75 }} />
        </Source>
        <DeckOverlay layers={layers} />
        {NODES.map((node) => <Marker key={node.id} longitude={node.coordinates[0]} latitude={node.coordinates[1]} anchor="center"><button type="button" className={`map-node ${node.id === activeNode ? 'active' : ''}`} onClick={() => setActiveNode(node.id)} aria-pressed={node.id === activeNode} aria-label={locale === 'ko' ? `${node.label} 노드 선택` : `Select ${node.label} node`}><i /><span>{node.label}</span></button></Marker>)}
        <NavigationControl position="bottom-right" showCompass={false} />
        <FullscreenControl position="top-right" />
      </Map>
      <h2 id="map-title" className="map-title">{locale === 'ko' ? '글로벌 지도' : 'Global map'}</h2>
      {selectedNode ? <div className="node-tooltip"><header><b>{selectedNode.label}</b><button type="button" aria-label={locale === 'ko' ? '도움말 닫기' : 'Close tooltip'} onClick={() => setActiveNode('')}>×</button></header><dl><dt>{locale === 'ko' ? '역할' : 'Role'}</dt><dd>{locale === 'ko' ? '글로벌 금융 허브' : 'Global financial hub'}</dd><dt>{locale === 'ko' ? '표현' : 'Representation'}</dt><dd>{locale === 'ko' ? '설명용 노드' : 'Schematic node'}</dd></dl></div> : null}
      <div id="map-disclaimer" className="map-disclaimer"><span className="status-dot simulation" />{locale === 'ko' ? '구조도 · 실거래 위치 아님' : 'Schematic · not transaction locations'}</div>
      <details className="map-data-table"><summary>{locale === 'ko' ? `지도 데이터 표로 보기 (${tableEdges.length}개 흐름)` : `View map data as a table (${tableEdges.length} flows)`}</summary><table><caption>{tableScope && !proMode ? tableScope[locale] : locale === 'ko' ? `${proMode ? '모든 금융망' : selected.toUpperCase()}의 설명용 흐름` : `Illustrative flows for ${proMode ? 'all financial rails' : selected.toUpperCase()}`}</caption><thead><tr><th scope="col">{locale === 'ko' ? '출발' : 'Source'}</th><th scope="col">{locale === 'ko' ? '도착' : 'Target'}</th><th scope="col">{locale === 'ko' ? '유형' : 'Type'}</th></tr></thead><tbody>{tableEdges.map((item) => <tr key={item.id}><td>{getNode(item.source).label}</td><td>{getNode(item.target).label}</td><td>{SEMANTIC_LABELS[item.semantic][locale]}</td></tr>)}</tbody></table></details>
    </section>
  )
}
