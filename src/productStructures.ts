import type { NetworkId } from './types'

type LocalizedText = { ko: string; en: string }

export interface ProductStructure {
  id: string
  name: LocalizedText
  objective: LocalizedText
  portfolio: LocalizedText
  rebalance: LocalizedText
  holdingPeriod: LocalizedText
}

export interface ProductStructureGuide {
  introduction: LocalizedText
  sourceIds: string[]
  products: ProductStructure[]
}

const ETF_STRUCTURE_GUIDE: ProductStructureGuide = {
  introduction: {
    ko: '실제 편입자산과 파생상품 비중은 상품별 투자설명서를 따라야 합니다. 아래 비교는 대표적인 구성 원리를 설명하며 특정 종목의 현재 보유내역을 뜻하지 않습니다.',
    en: 'The prospectus for each fund governs its actual holdings and derivative mix. This comparison explains common structures; it is not a current holdings report for a specific ticker.',
  },
  sourceIds: ['sec-etf', 'sec-leveraged-inverse-etfs'],
  products: [
    {
      id: 'index-etf',
      name: { ko: '일반 지수 ETF', en: 'Traditional index ETF' },
      objective: { ko: '기준지수의 성과 추종', en: 'Track benchmark performance' },
      portfolio: {
        ko: '주식·채권 등 바스켓과 현금 조정분을 보유하고, AP가 설정 단위로 바스켓을 교환합니다.',
        en: 'Holds a basket of assets such as stocks or bonds plus cash adjustments; APs exchange the basket in creation units.',
      },
      rebalance: { ko: '지수 변경과 운용 방식에 따라 조정', en: 'Adjusted with index changes and fund methodology' },
      holdingPeriod: { ko: '일일 고정 배수 목표가 아님', en: 'No fixed daily multiple objective' },
    },
    {
      id: 'leveraged-etf',
      name: { ko: '레버리지 ETF', en: 'Leveraged ETF' },
      objective: { ko: '예: 기준지수 일간 수익률의 +2배', en: 'For example, +2x the benchmark’s daily return' },
      portfolio: {
        ko: '스왑·선물·기타 파생상품과 현금·담보를 조합해 노출을 만듭니다. 지수 구성종목을 단순히 2배씩 담는 구조로 한정되지 않습니다.',
        en: 'Combines swaps, futures, other derivatives, and cash or collateral to create exposure. It is not limited to holding twice each index constituent.',
      },
      rebalance: { ko: '매 거래일 목표 노출로 재조정', en: 'Reset to target exposure each trading day' },
      holdingPeriod: { ko: '하루 초과 수익률은 목표 배수와 크게 달라질 수 있음', en: 'Returns beyond one day can differ significantly from the stated multiple' },
    },
    {
      id: 'inverse-etf',
      name: { ko: '인버스 ETF', en: 'Inverse ETF' },
      objective: { ko: '예: 기준지수 일간 수익률의 -1배 또는 -2배', en: 'For example, -1x or -2x the benchmark’s daily return' },
      portfolio: {
        ko: '공매도 포지션, 스왑·선물 등 파생상품을 상품 조건에 따라 활용해 반대 방향 노출을 만듭니다.',
        en: 'Uses short positions, swaps, futures, or other derivatives under the fund terms to create inverse exposure.',
      },
      rebalance: { ko: '대부분 매 거래일 목표 역노출로 재조정', en: 'Most reset to target inverse exposure each trading day' },
      holdingPeriod: { ko: '변동성과 일일 복리로 장기 지수 수익률의 단순 역수가 아님', en: 'Volatility and daily compounding mean it is not a simple long-term inverse' },
    },
  ],
}

export function getProductStructureGuide(networkId: NetworkId): ProductStructureGuide | undefined {
  return networkId === 'etf-primary-market' ? ETF_STRUCTURE_GUIDE : undefined
}
