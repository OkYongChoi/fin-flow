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
  'bond-servicing': {
    steps: [
      { ko: '공시·지급 일정', en: 'Announce payment terms and date', noteKo: '공시는 시장가격이나 신규 발행 배정을 뜻하지 않습니다.', noteEn: 'An announcement is not a market price or a new-issue allocation.' },
      { ko: '기준일·권리 확정', en: 'Set record-date entitlement', noteKo: '권리 기준일은 개별 보유자 장부를 표시하지 않습니다.', noteEn: 'The record date does not display individual holder ledgers.' },
      { ko: '지급대행 자금 납부', en: 'Fund the paying agent', noteKo: '발행사·지급대행자의 자금 제공과 예탁결제 배분은 분리됩니다.', noteEn: 'Issuer/paying-agent funding is distinct from depository allocation.' },
      { ko: '예탁결제 배분·상환', en: 'Allocate payment and reduce position', noteKo: '상환일 처리 예시이며, 이표·세금·개별 계좌를 재현하지 않습니다.', noteEn: 'An example of payment-date processing, not a replay of coupons, tax, or individual accounts.' },
    ],
    roles: [
      { ko: '발행사: 약관과 지급 또는 상환 의무를 정합니다.', en: 'Issuer: sets the terms and payment or redemption obligation.' },
      { ko: '지급대행인: 공시·지급 자금을 준비하고 운영합니다.', en: 'Paying agent: prepares notices and payment funding operations.' },
      { ko: 'DTC: 적격 증권의 공시·권리·배분·기록상 포지션 조정을 지원합니다.', en: 'DTC: supports notices, entitlements, allocation, and record-position updates for eligible securities.' },
    ],
    boundary: { ko: '이 안내는 DTC 상환 서비스 가이드의 적격 증권 처리 예시입니다. 모든 이표·세금·투자자 보유·유통시장 거래 또는 실시간 지급 상태를 표시하지 않습니다.', en: 'This guide is an eligible-security servicing example based on the DTC Redemptions Service Guide. It does not depict every coupon, tax treatment, investor holding, secondary-market trade, or live payment status.' },
    concepts: [
      { ko: '채권 발행 화면은 신규 증권의 주관·배정·DvP를 다루고, 이 화면은 발행 후 공시와 현금 권리 처리라는 별도 수명주기를 다룹니다.', en: 'Bond issuance covers underwriting, allocation, and DvP for new securities; this route covers the separate post-issuance lifecycle of notices and cash entitlements.' },
      { ko: '지급대행인 또는 발행사가 자금을 제공하는 단계와 DTC가 참여자에게 수령액을 배분하는 단계는 서로 다른 역할입니다.', en: 'Funding by a paying agent or issuer and allocation of received proceeds by DTC to participants are different roles.' },
      { ko: '기준일의 권리 판단·상환 공시·지급일 배분은 유통시장 매매를 새로 체결하거나 보유자의 개별 거래를 표시하는 것이 아닙니다.', en: 'Record-date entitlement, redemption notice, and payment-date allocation do not execute a new secondary-market trade or reveal a holder’s individual transaction.' },
      { ko: '만기·전부 또는 일부 상환·환매는 해당 약관과 DTC 절차에 따르며, 하나의 보편적 이표 계산이나 세금 처리로 일반화하지 않습니다.', en: 'Maturity, full/partial redemption, and calls follow the applicable terms and DTC procedures; they are not generalised into one universal coupon or tax calculation.' },
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
      { ko: '변동증거금은 합의된 가치변동에 따라 이동할 수 있지만, 이는 계약의 명목금액이나 만기 시 최종 정산과 같은 값이 아닙니다.', en: 'Variation margin can move with agreed value changes, but it is not the contract notional or the same as final maturity settlement.' },
      { ko: '증거금 콜의 산정·통지·이행 시점은 상품과 운영 약정에 따라 다를 수 있으므로, 하나의 즉시 결제 이벤트로 가정하지 않습니다.', en: 'Margin-call calculation, notice, and performance can occur at different times under product and operational terms; they are not assumed to be one instant settlement event.' },
      { ko: '중앙청산 거래의 노베이션은 CCP가 당사자 사이에 개입하는 법적·운영적 전환을 설명하며, 모든 양자 OTC 계약의 자동 이전을 뜻하지 않습니다.', en: 'Novation for a cleared trade describes the legal and operational interposition of a CCP; it does not mean every bilateral OTC contract is automatically transferred.' },
      { ko: '청산 거래의 디폴트 관리는 CCP 규정에 따른 위험 관리 절차이며, 일반적인 만기 정산 단계나 모든 양자 거래에 동일하게 적용되는 절차로 표시하지 않습니다.', en: 'Default management for a cleared trade is a CCP rule-governed risk process; it is not an ordinary maturity settlement step or a process identical for every bilateral trade.' },
      { ko: '파생상품의 만기 및 정산은 상품 조건에 따르며, 현금결제와 실물인도는 구분됩니다. 명목금액만으로 결제 방식을 추정하지 않습니다.', en: 'Derivative maturity and settlement follow the product terms: cash settlement and physical delivery are distinct, and the method cannot be inferred from notional alone.' },
      { ko: '명목금액은 계약의 기준 금액일 수 있지만, 시장가치나 신용 노출액과 같지 않습니다. 따라서 명목금액만으로 현금흐름 또는 위험 규모를 판단하지 않습니다.', en: 'Notional is a contractual reference amount, not the same as market value or credit exposure; it alone does not determine cash flow or risk size.' },
      { ko: '담보의 이전과 계약상 정산자산의 인도는 서로 바꿔 쓸 수 없습니다. 담보 적격성·통화·시점은 해당 담보 약정과 상품 조건을 따릅니다.', en: 'Collateral movement is not interchangeable with delivery of a settlement asset; eligibility, currency, and timing follow the collateral and product terms.' },
    ],
  },
  'listed-derivatives': {
    steps: [
      { ko: '거래소 주문 체결', en: 'Exchange execution', noteKo: '표준화된 상장계약의 체결 단계이며, OTC 양자 협상이 아닙니다.', noteEn: 'Execution of a standardised listed contract, not bilateral OTC negotiation.' },
      { ko: '청산회원 제출·노베이션', en: 'Submit through a clearing member', noteKo: '고객은 통상 FCM을 통해 접근하고, 적격 거래에서 CCP가 개입합니다.', noteEn: 'Customers ordinarily access through an FCM; the CCP interposes for eligible cleared trades.' },
      { ko: '일일 시가평가·증거금', en: 'Daily mark-to-market and margin', noteKo: '일일 손익 정산과 초기증거금은 같은 의무가 아닙니다.', noteEn: 'Daily gain/loss settlement is distinct from initial performance-bond coverage.' },
      { ko: '만기·행사 또는 인도', en: 'Expiry, exercise, or delivery', noteKo: '현금결제·행사·인도 여부는 상품 조건에 따릅니다.', noteEn: 'Cash settlement, exercise, or delivery follows the product terms.' },
    ],
    roles: [
      { ko: '거래소: 표준화된 상장계약의 체결 장소를 제공합니다.', en: 'Exchange: provides a venue for standardised listed-contract execution.' },
      { ko: 'FCM·청산회원: 고객 접근과 청산소에 대한 재무 의무를 지원합니다.', en: 'FCM and clearing member: support customer access and financial obligations to the clearinghouse.' },
      { ko: '중앙청산소(CCP): 적격 청산 거래에서 매수자와 매도자 사이에 개입합니다.', en: 'CCP: interposes between buyer and seller for eligible cleared trades.' },
    ],
    boundary: { ko: '이 안내는 CME 교육 자료를 바탕으로 한 상장 파생상품 청산 수명주기이며, OTC 경로·실시간 증거금 계산·거래별 포지션·지리적 서비스 범위를 나타내지 않습니다.', en: 'This guide describes a listed-derivatives clearing lifecycle using a CME educational reference; it is not an OTC lifecycle, live margin calculation, trade-specific position, or geographic service map.' },
    concepts: [
      { ko: '상장 파생상품은 거래소의 표준계약 체결과 청산회원 경로를 설명하며, 기존 OTC 화면의 양자 계약·확인 절차와 동일시하지 않습니다.', en: 'Listed derivatives use exchange-standardised execution and a clearing-member route; they are not the bilateral OTC contract-and-confirmation lifecycle.' },
      { ko: '청산회원은 고객의 CME Clearing 접근을 제공할 수 있고 고객 의무를 보증하지만, 모든 시장참가자가 CCP의 직접 회원이라는 뜻은 아닙니다.', en: 'A clearing member can provide customer access to CME Clearing and guarantee customer obligations; this does not make every market participant a direct CCP member.' },
      { ko: '일일 시가평가는 청산주기마다 손익 현금을 이동시킬 수 있으며, 잠재 미래 손실을 담보하는 초기증거금과 최종 만기정산을 구분합니다.', en: 'Daily mark-to-market can move gain/loss cash at a clearing cycle; it is distinct from initial margin for potential future loss and from final expiry settlement.' },
      { ko: '만기 시 현금결제·옵션행사·실물인도는 상품 규칙에 따르므로, 하나의 모든 상장상품에 공통인 결과로 표시하지 않습니다.', en: 'Cash settlement, option exercise, and physical delivery at expiry follow product rules; they are not one universal outcome for every listed product.' },
    ],
  },
  'fx-pvp': {
    steps: [
      { ko: 'FX 거래 정보 포착', en: 'Capture FX trade details', noteKo: '기초 거래 체결 자체를 재현하지 않습니다.', noteEn: 'Does not reproduce the underlying trade execution.' },
      { ko: '지급지시 제출', en: 'Submit payment instructions', noteKo: '각 통화 지급지시는 별도 자금조달과 구분됩니다.', noteEn: 'Each currency instruction is distinct from funding.' },
      { ko: 'PvP 동시 결제', en: 'Settle payment versus payment', noteKo: '두 통화 지급이 함께 결제되는 설명용 단계입니다.', noteEn: 'Illustrates linked settlement of the two currency payments.' },
      { ko: '잔액 반환·확인', en: 'Return balances and confirm', noteKo: '상계 결과는 개별 거래의 가격이나 포지션이 아닙니다.', noteEn: 'Netting results are not trade prices or positions.' },
    ],
    roles: [
      { ko: '결제 회원: 지급지시와 필요한 자금을 관리합니다.', en: 'Settlement member: manages payment instructions and required funding.' },
      { ko: 'CLS: 해당 서비스 범위에서 다자간 상계와 PvP 결제를 운영합니다.', en: 'CLS: operates multilateral netting and PvP settlement within its service scope.' },
      { ko: '중앙은행 RTGS: 적격 통화의 계좌·지급 인프라를 제공합니다.', en: 'Central-bank RTGS: provides account and payment infrastructure for eligible currencies.' },
    ],
    boundary: { ko: '이 흐름은 CLS 서비스 범위의 FX 지급결제를 설명하며, 모든 FX 거래 또는 통화를 나타내지 않습니다.', en: 'This route explains FX payment settlement within CLS service scope; it does not represent every FX trade or currency.' },
    concepts: [
      { ko: 'PvP는 두 통화 지급을 연계해 결제위험을 줄이는 방식이며, FX 가격 합의나 거래 체결 그 자체와 다릅니다.', en: 'PvP links the two currency payments to mitigate settlement risk; it is distinct from agreeing an FX price or executing the trade.' },
      { ko: '다자간 상계는 결제 회원의 총 지급 필요액을 줄일 수 있지만, 각 기초 거래의 법적 조건이나 경제적 노출을 대체하지 않습니다.', en: 'Multilateral netting can reduce a member’s aggregate payment need; it does not replace the legal terms or economic exposure of each underlying trade.' },
      { ko: 'CLSSettlement의 통화·회원·운영 시간 범위는 제한되어 있으므로, 이 구조도를 모든 통화쌍의 보편적 결제 경로로 해석하지 않습니다.', en: 'CLSSettlement has defined currency, membership, and operating-hour scope; this schematic is not a universal settlement route for every currency pair.' },
    ],
  },
  'repo-financing': {
    steps: [
      { ko: '레포 조건 합의', en: 'Agree repo terms', noteKo: '매도·환매 약정이며 현물 매각과 구분됩니다.', noteEn: 'A sale-and-repurchase agreement, distinct from an outright sale.' },
      { ko: '담보 적격성 확인', en: 'Confirm collateral eligibility', noteKo: '적격성은 가격·헤어컷·자금 지급과 별개입니다.', noteEn: 'Eligibility is distinct from price, haircut, and cash payment.' },
      { ko: '청산·상계 경로', en: 'Clear and net where applicable', noteKo: '청산 서비스 사용 여부는 거래 구조에 따라 다릅니다.', noteEn: 'Use of a clearing service depends on the trade structure.' },
      { ko: '반환 레그', en: 'Return leg', noteKo: '만기 반환은 최초 레그와 별도 이행입니다.', noteEn: 'The maturity return is a separate performance from the opening leg.' },
    ],
    roles: [
      { ko: '현금 제공자·차입자: 레포 조건과 결제 의무를 합의합니다.', en: 'Cash provider and borrower: agree repo terms and settlement obligations.' },
      { ko: '청산기관: 적격한 거래의 청산·상계 서비스를 지원할 수 있습니다.', en: 'Clearing service: can support clearing and netting for eligible trades.' },
    ],
    boundary: { ko: '레포는 환매 약정이 있는 담보부 자금조달 구조이며, 단순 현물 매각이나 개별 DvP의 재현이 아닙니다.', en: 'Repo is collateralised financing with a repurchase obligation, not an outright sale or a replay of individual DvP.' },
    concepts: [
      { ko: '레포의 최초 레그와 반환 레그는 환매 약정으로 연결되며, 최종적으로 소유권을 처분하는 현물 매각과 동일하게 보지 않습니다.', en: 'A repo opening and return leg are linked by a repurchase obligation; they are not treated as an outright disposal of ownership.' },
      { ko: '담보 적격성·배정은 거래별 DvP 자체가 아니며, 가격·헤어컷·마진·결제 세부 조건은 별도 약정에 따릅니다.', en: 'Collateral eligibility and allocation are not trade-by-trade DvP; price, haircut, margin, and settlement details follow separate terms.' },
    ],
  },
  'etf-primary-market': {
    steps: [
      { ko: '설정 바스켓 공시', en: 'Publish creation basket', noteKo: '개별 투자자의 거래 지시가 아닙니다.', noteEn: 'Not a retail investor trade instruction.' },
      { ko: 'AP 설정 단위 주문', en: 'AP orders creation units', noteKo: 'AP만 펀드와 직접 설정·환매할 수 있습니다.', noteEn: 'Only APs can create or redeem directly with the fund.' },
      { ko: '바스켓·현금 교환', en: 'Exchange basket and cash', noteKo: '현물·현금 방식은 펀드 조건에 따라 달라집니다.', noteEn: 'In-kind and cash mechanics depend on fund terms.' },
      { ko: '거래소 유통', en: 'Secondary-market trading', noteKo: '거래소 가격은 NAV와 다를 수 있습니다.', noteEn: 'Exchange price can differ from NAV.' },
    ],
    roles: [
      { ko: 'ETF: 설정 단위와 바스켓을 관리합니다.', en: 'ETF: administers creation units and baskets.' },
      { ko: 'AP: 펀드와 직접 설정·환매합니다.', en: 'Authorized participant: creates and redeems directly with the fund.' },
      { ko: '일반 투자자: 통상 거래소 유통시장에서 매매합니다.', en: 'Other investors: ordinarily trade in the exchange secondary market.' },
    ],
    boundary: { ko: 'ETF 설정·환매와 유통시장 주식 매매는 다른 흐름이며, 이 화면은 개별 주문·NAV·가격을 표시하지 않습니다.', en: 'ETF creation/redemption and secondary-market share trading are different flows; this view does not show individual orders, NAV, or prices.' },
    concepts: [
      { ko: 'AP는 대규모 설정 단위를 펀드와 직접 교환하지만, 일반 투자자는 통상 거래소에서 ETF 지분을 매매합니다.', en: 'APs exchange large creation units directly with the fund, while other investors ordinarily trade ETF shares on an exchange.' },
      { ko: '바스켓 인도·현금 조정은 설정·환매 구조의 일부이며, 유통시장 체결가나 NAV 자체를 뜻하지 않습니다.', en: 'Basket delivery and cash balancing are parts of creation/redemption mechanics, not a secondary-market execution price or NAV itself.' },
    ],
  },
  'securities-lending': {
    steps: [
      { ko: '차입 요청·계약', en: 'Request and agree loan', noteKo: '대차는 매도 체결과 다릅니다.', noteEn: 'A loan is distinct from sale execution.' },
      { ko: '증권·담보 인도', en: 'Deliver securities and collateral', noteKo: '담보 이전은 대차수수료와 분리됩니다.', noteEn: 'Collateral movement is separate from the lending fee.' },
      { ko: '시가평가·담보 조정', en: 'Mark to market and adjust collateral', noteKo: '평가는 가격 정보 제공이나 투자 권고가 아닙니다.', noteEn: 'Valuation is not a price feed or investment recommendation.' },
      { ko: '반환·담보 해제', en: 'Return securities and release collateral', noteKo: '반환 시점과 권리처리는 계약에 따릅니다.', noteEn: 'Return timing and entitlement treatment follow the agreement.' },
    ],
    roles: [
      { ko: '대여자·차입자: 증권 대여와 반환 의무를 합의합니다.', en: 'Lender and borrower: agree security loan and return obligations.' },
      { ko: '에이전트·인프라: 담보·결제·보고 운영을 지원할 수 있습니다.', en: 'Agent and infrastructure: can support collateral, settlement, and reporting operations.' },
    ],
    boundary: { ko: '증권대차는 기간성 반환의무가 있는 구조이며, 현물 매각·일반 결제·실시간 담보가치를 재현하지 않습니다.', en: 'Securities lending has a term return obligation; it does not reproduce an outright sale, ordinary settlement, or live collateral values.' },
    concepts: [
      { ko: '증권대차의 반환의무는 현물 매각의 최종 이전과 다르며, 대여 증권의 매매가격을 표시하지 않습니다.', en: 'The return obligation in securities lending differs from final transfer in an outright sale and does not show a sale price for the borrowed security.' },
      { ko: '담보 시가평가와 조정은 대차수수료 산정과 별개이며, 한 값으로 경제적 비용을 추정하지 않습니다.', en: 'Collateral mark-to-market and adjustment are separate from lending-fee calculation; one value is not used to infer the other economic cost.' },
    ],
  },
  'syndicated-loans': {
    steps: [
      { ko: '차입 조건·주선 위임', en: 'Set terms and mandate arranger', noteKo: '주선은 대주 자금 제공과 다릅니다.', noteEn: 'Arranging is distinct from lender funding.' },
      { ko: '신디케이션·참여', en: 'Syndicate and commit', noteKo: '참여 약정은 개별 대출 잔액이 아닙니다.', noteEn: 'A commitment is not an individual loan balance.' },
      { ko: '종결·자금조달', en: 'Close and fund', noteKo: '종결 조건과 자금 지급은 문서에 따릅니다.', noteEn: 'Closing conditions and funding follow documentation.' },
      { ko: '에이전시·사후 관리', en: 'Administer and service', noteKo: '에이전트는 모든 대주의 투자 결정을 대신하지 않습니다.', noteEn: 'The agent does not make every lender’s investment decision.' },
    ],
    roles: [
      { ko: '차입자: 자금조달 조건을 협의합니다.', en: 'Borrower: negotiates funding terms.' },
      { ko: '주선기관: 신디케이션과 문서·종결 조정을 지원합니다.', en: 'Arranger: supports syndication and documentation/closing coordination.' },
      { ko: '대주·행정대리인: 약정·자금조달·사후관리 역할을 분담합니다.', en: 'Lenders and administrative agent: divide commitment, funding, and servicing roles.' },
    ],
    boundary: { ko: '신디케이트 론의 1차 주선·종결과 2차 대출채권 거래는 별개이며, 이 화면은 계약상 포지션이나 가격을 표시하지 않습니다.', en: 'Primary loan arrangement/closing and secondary loan trading are separate; this view does not show contractual positions or prices.' },
    concepts: [
      { ko: '주선기관은 수요 취합·문서·종결을 조정할 수 있지만, 각 대주의 자금 제공이나 신용 판단을 대신하지 않습니다.', en: 'An arranger can coordinate commitments, documentation, and closing; it does not replace each lender’s funding or credit decision.' },
      { ko: '1차 신디케이션은 차입자의 신규 자금조달을 위한 구조이며, 기존 대출채권의 2차 양도·거래와 구분합니다.', en: 'Primary syndication structures new borrower funding and is distinct from secondary assignment or trading of an existing loan.' },
    ],
  },
}

export function getFlowGuide(networkId: NetworkId): FlowGuide {
  return FLOW_GUIDES[networkId] ?? genericGuide
}
