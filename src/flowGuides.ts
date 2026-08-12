import type { NetworkId } from './types'

export interface FlowGuide {
  steps: Array<{ ko: string; en: string; noteKo: string; noteEn: string }>
  roles: Array<{ ko: string; en: string }>
  boundary: { ko: string; en: string }
  concepts?: Array<{ ko: string; en: string }>
}

const genericGuide: FlowGuide = {
  steps: [
    { ko: '지급 지시 생성', en: 'Payment instruction', noteKo: '설명용 단계', noteEn: 'Explanatory stage' },
    { ko: '메시지 검증', en: 'Message validation', noteKo: '설명용 단계', noteEn: 'Explanatory stage' },
    { ko: '처리 경로 선택', en: 'Processing path selection', noteKo: '설명용 단계', noteEn: 'Explanatory stage' },
    { ko: '결과 확인', en: 'Outcome confirmation', noteKo: '설명용 단계', noteEn: 'Explanatory stage' },
  ],
  roles: [{ ko: '참여 기관', en: 'Participating institutions' }],
  boundary: { ko: '이 화면은 설명용 구조도입니다.', en: 'This view is an explanatory schematic.' },
}

export const FLOW_GUIDES: Partial<Record<NetworkId, FlowGuide>> = {
  'chips-fedwire': {
    steps: [
      { ko: '은행의 지급 지시', en: 'Originating bank', noteKo: '설명용 단계', noteEn: 'Explanatory stage' },
      { ko: '지급 메시지', en: 'Payment message', noteKo: '설명용 단계', noteEn: 'Explanatory stage' },
      { ko: 'CHIPS 또는 Fedwire', en: 'CHIPS or Fedwire', noteKo: '별도 결제 경로 · 직렬 아님', noteEn: 'Alternative rails · not sequential' },
      { ko: '수취은행 반영', en: 'Beneficiary bank', noteKo: '설명용 단계', noteEn: 'Explanatory stage' },
    ],
    roles: [{ ko: '참여 기관', en: 'Participating institutions' }],
    boundary: { ko: '이 화면은 설명용 구조도입니다.', en: 'This view is an explanatory schematic.' },
  },
  'bond-issuance': {
    steps: [
      { ko: '발행 조건 설계', en: 'Structure the offering', noteKo: '발행 단계이며 유통시장 거래가 아닙니다.', noteEn: 'An issuance step, not secondary-market trading.' },
      { ko: 'IB 주관·인수', en: 'Lead and underwrite', noteKo: '주관 역할은 매수·매도 상대방의 장부를 뜻하지 않습니다.', noteEn: 'Lead management does not identify trading counterparties or ledgers.' },
      { ko: '예탁결제 적격성', en: 'Depository eligibility', noteKo: '증권 적격성 확인은 자금 결제와 구분됩니다.', noteEn: 'Security eligibility is distinct from cash settlement.' },
      { ko: '배정·인도대금결제', en: 'Allocation and delivery versus payment', noteKo: '배정과 DvP는 개별 거래를 재현하지 않습니다.', noteEn: 'Allocation and DvP do not reproduce individual transactions.' },
    ],
    roles: [
      { ko: '발행사: 자금 조달 조건을 정합니다.', en: 'Issuer: sets the funding terms.' },
      { ko: 'IB: 주관·인수 및 배정 과정을 조정합니다.', en: 'Investment bank: coordinates bookbuilding, underwriting, and allocation.' },
      { ko: '예탁결제기관: 증권 적격성과 보관·결제 인프라를 지원합니다.', en: 'Depository: supports eligibility plus custody and settlement infrastructure.' },
    ],
    boundary: { ko: '발행(1차 시장)과 유통시장 결제는 별개의 흐름입니다.', en: 'Primary issuance and secondary-market settlement are separate flows.' },
    concepts: [
      { ko: '1차 발행은 신규 증권을 배정하는 과정이고, 유통시장 매매·결제와 다릅니다.', en: 'Primary issuance allocates new securities; it differs from secondary trading and settlement.' },
      { ko: '발행사는 자금 조달 목적과 증권 조건을 정하지만, 모든 배정·결제 장부를 운영하지는 않습니다.', en: 'The issuer sets the funding purpose and security terms, but does not operate every allocation or settlement ledger.' },
      { ko: 'IB의 주관·인수 역할은 수요 취합과 배정을 조정하는 역할이며, 투자자별 거래를 표시하지 않습니다.', en: 'The IB lead-and-underwrite role coordinates demand and allocation; it does not display investor-level trades.' },
      { ko: '예탁결제기관의 증권 적격성·보관 인프라 역할은 DvP의 현금 측 결제와 구분해 봐야 합니다.', en: 'A depository’s eligibility and custody infrastructure role should be distinguished from the cash-settlement leg of DvP.' },
      { ko: '발행 배정은 신규 증권의 배분 절차이며, 이후 유통시장의 가격 발견이나 매매 체결을 뜻하지 않습니다.', en: 'Offering allocation distributes new securities; it does not represent subsequent secondary-market price discovery or trade execution.' },
    ],
  },
  derivatives: {
    steps: [
      { ko: '계약 체결', en: 'Execution', noteKo: '계약은 명목금액이나 현금 이동과 동일하지 않습니다.', noteEn: 'A contract is not the same as notional or cash movement.' },
      { ko: '확인·포지션 기록', en: 'Confirmation and position record', noteKo: '거래 확인과 가치평가 시점은 분리될 수 있습니다.', noteEn: 'Trade confirmation and valuation can occur at different times.' },
      { ko: '증거금·청산', en: 'Margin and clearing', noteKo: '양자 담보관리와 CCP 청산은 대체 경로일 수 있습니다.', noteEn: 'Bilateral collateral management and CCP clearing can be alternative paths.' },
      { ko: '만기·정산', en: 'Maturity and settlement', noteKo: '최종 정산 방식은 상품 조건에 따라 다릅니다.', noteEn: 'Final settlement method depends on the product terms.' },
    ],
    roles: [
      { ko: '거래상대방: 계약 조건과 위험 이전을 합의합니다.', en: 'Counterparties: agree contract terms and risk transfer.' },
      { ko: '담보관리자: 증거금 산정·교환 운영을 지원합니다.', en: 'Collateral manager: supports margin calculation and exchange operations.' },
      { ko: '중앙청산소(CCP): 청산되는 거래에서 당사자 사이에 개입합니다.', en: 'CCP: interposes between parties for cleared transactions.' },
    ],
    boundary: { ko: '양자 OTC 거래와 중앙청산 거래를 하나의 동일한 경로로 보지 않습니다.', en: 'Bilateral OTC and centrally cleared trades are not treated as one identical path.' },
    concepts: [
      { ko: 'OTC 거래상대방이 계약 조건과 위험 이전을 합의하더라도, 중앙청산 거래에서는 CCP가 당사자 사이에 개입할 수 있습니다.', en: 'OTC counterparties agree contract terms and risk transfer, while a CCP can interpose between them for centrally cleared trades.' },
      { ko: '거래 확인은 합의된 경제 조건을 기록하는 단계이며, 가치평가·증거금 산정·현금 이동을 그 자체로 의미하지 않습니다.', en: 'Trade confirmation records agreed economic terms; it does not itself mean valuation, margin calculation, or cash movement.' },
      { ko: '시장가치 평가는 노출액을 측정하는 과정이며, 증거금 교환이나 최종 현금 결제와 동일한 지급 이벤트가 아닙니다.', en: 'Mark-to-market valuation measures exposure; it is not the same payment event as margin exchange or final cash settlement.' },
      { ko: '양자 담보관리는 거래상대방 간 증거금 운영이며, 중앙청산소가 개입하는 청산 경로와 자동으로 동일해지지 않습니다.', en: 'Bilateral collateral management operates margin between counterparties; it does not automatically become a CCP-cleared path.' },
      { ko: '중앙청산이 적용되면 CCP는 정해진 청산 거래에서 당사자 사이에 개입하지만, 모든 OTC 계약이 자동으로 청산되는 것은 아닙니다.', en: 'For eligible cleared trades, a CCP interposes between parties; not every OTC contract is automatically cleared.' },
      { ko: '초기증거금은 잠재적 미래 노출을 위한 담보이며, 이미 발생한 일일 가치변동을 정산하는 변동증거금과 구분합니다.', en: 'Initial margin covers potential future exposure; it is distinct from variation margin that settles realized daily value changes.' },
    ],
  },
}

export function getFlowGuide(networkId: NetworkId): FlowGuide {
  return FLOW_GUIDES[networkId] ?? genericGuide
}
