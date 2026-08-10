import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  ko: {
    translation: {
      nav: { map: '글로벌 지도', networks: '네트워크', institutions: '기관', assets: '자산', data: '데이터' },
      view: { basic: '기본', pro: '전문', density: '화면 밀도' },
      filters: { period: '기간', currency: '통화', network: '네트워크', institution: '기관 유형', region: '지역', observed: '실거래 통계', simulation: '시뮬레이션', reset: '필터 초기화', all: '전체' },
      sidebar: { title: '금융 네트워크', legend: '범례', message: '메시지', payment: '결제', clearing: '청산', onchain: '온체인', nodeSize: '노드 크기 · 처리량' },
      inspector: { title: '미국 달러 결제 경로', route: '경로', institutions: '기관', statistics: '통계', documents: '문서', compare: '경로 비교', source: '원문 보기', actual: '공개 통계', schematic: '구조도', simulation: '시뮬레이션', updated: '최근 업데이트', coverage: '기준일', latency: '데이터 지연' },
      timeline: { title: '시장 이벤트와 자금 이동', timeline: '타임라인', comparison: '거래망 비교', institution: '기관 흐름', play: '시뮬레이션 재생', pause: '일시정지' },
      notices: { schematic: '경로는 설명용 구조도입니다. 공개 집계 통계와 개별 거래 위치는 다릅니다.', simulated: '재생되는 흐름은 실거래가 아닌 학습용 시뮬레이션입니다.' },
      data: { loadError: '출처 데이터를 불러올 수 없습니다.', retry: '다시 시도', loadingMap: '지도 레이어를 불러오는 중…' },
      pages: { networks: '금융 네트워크', assets: '자산의 흐름', learn: '배우기', data: '데이터와 방법론', back: '지도로 돌아가기' },
      common: { learnMore: '자세히 보기', sourceDate: '출처 및 기준일', accessibility: '지도 데이터 표로 보기' },
    },
  },
  en: {
    translation: {
      nav: { map: 'Global map', networks: 'Networks', institutions: 'Institutions', assets: 'Assets', data: 'Data' },
      view: { basic: 'Basic', pro: 'Pro', density: 'View density' },
      filters: { period: 'Period', currency: 'Currency', network: 'Network', institution: 'Institution type', region: 'Region', observed: 'Observed statistics', simulation: 'Simulation', reset: 'Reset filters', all: 'All' },
      sidebar: { title: 'Financial networks', legend: 'Legend', message: 'Message', payment: 'Payment', clearing: 'Clearing', onchain: 'On-chain', nodeSize: 'Node size · throughput' },
      inspector: { title: 'US dollar payment paths', route: 'Path', institutions: 'Institutions', statistics: 'Statistics', documents: 'Documents', compare: 'Path comparison', source: 'Open source', actual: 'Public statistic', schematic: 'Schematic', simulation: 'Simulation', updated: 'Last updated', coverage: 'As of', latency: 'Data latency' },
      timeline: { title: 'Market events and money flows', timeline: 'Timeline', comparison: 'Network comparison', institution: 'Institution flows', play: 'Play simulation', pause: 'Pause' },
      notices: { schematic: 'Routes are explanatory schematics. Public aggregates do not reveal individual transaction locations.', simulated: 'Playback is a learning simulation, not a live transaction feed.' },
      data: { loadError: 'Source data could not be loaded.', retry: 'Retry', loadingMap: 'Loading map layers…' },
      pages: { networks: 'Financial networks', assets: 'Asset flows', learn: 'Learn', data: 'Data & methodology', back: 'Back to map' },
      common: { learnMore: 'Learn more', sourceDate: 'Sources & dates', accessibility: 'View map data as a table' },
    },
  },
}

void i18n.use(initReactI18next).init({ resources, lng: 'ko', fallbackLng: 'en', interpolation: { escapeValue: false } })

export default i18n
