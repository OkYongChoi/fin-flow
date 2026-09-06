import type { IssuanceFlow } from '../issuanceFlows'

export const flow: IssuanceFlow = {
  id: 'us-direct-registration-offering',
  label: { ko: '미국 직접 등록 유통', en: 'U.S. direct-registration offering' },
  summary: {
    ko: '직접 등록 방식은 중개사 심사 대신 공개등록 기반 공개자료와 계정 절차를 중심으로 발행 경로를 운영하는 방식입니다.',
    en: 'A direct-registration offering relies on the issuer’s registration statement and distribution accounting rather than a traditional underwriting syndicate process.'
  },
  steps: [
    { ko: '기초 증권 및 등록 계획 수립', en: 'Define base security and registration plan' },
    { ko: '등록 신고·심사 대응', en: 'File registration documents and address review questions' },
    { ko: '공개 공개 및 주문 수요 수집', en: 'Disclose details and collect subscription demand' },
    { ko: '발행·결제', en: 'Issue and settle' },
  ],
  boundary: {
    ko: '이 설명은 절차적 분류일 뿐 배정 가격, 조달 규모, 초기 유통 유동성, 투자자 적격성 결과를 계산하지 않습니다.',
    en: 'This is a procedural classification only and does not calculate pricing, funding volume, initial liquidity, or investor eligibility outcomes.'
  },
  source: {
    provider: 'SEC',
    title: 'Direct listing and direct registration overview',
    url: 'https://www.sec.gov/fast-answers/answers-directlisting.html'
  },
}
