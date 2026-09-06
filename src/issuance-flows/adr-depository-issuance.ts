import type { IssuanceFlow } from '../issuanceFlows'

export const flow: IssuanceFlow = {
  id: 'adr-depository-issuance',
  label: { ko: 'ADR 유가증권 예탁발행', en: 'ADR depository-issued securities' },
  summary: {
    ko: 'ADR는 해외 발행증권을 예탁기관이 보관·표시하고 통화 또는 주식 배분 규칙을 적용해 발행절차를 분리해서 설명하는 입문형 경로입니다.',
    en: 'An ADR follows a schematic process where a depositary organizes overseas shares for trading and applies its own custody and distribution rules.'
  },
  steps: [
    { ko: '기본 증권 기준선', en: 'Identify underlying security and depositary terms' },
    { ko: '예탁기관 등록 절차', en: 'Complete depositary onboarding and custody setup' },
    { ko: '유통 경로 공시', en: 'Publish listing and distribution mechanics' },
    { ko: '장부상 발행 및 분배', en: 'Issue on depositary books and distribute' },
  ],
  boundary: {
    ko: 'ADR는 실제 기초증권 조건, 분배 비율, 회계 처리 및 외환 위험을 계산하지 않고, 예탁 방식의 절차적 뼈대를 설명합니다.',
    en: 'This is a procedural view of depositary handling for an ADR; it does not calculate underlying security terms, ratio, accounting, or FX risk.'
  },
  source: {
    provider: 'Federal Reserve / SEC guidance references',
    title: 'ADR structure and depository mechanics overview',
    url: 'https://www.sec.gov/fast-answers/answers-amdrc.html'
  },
}
