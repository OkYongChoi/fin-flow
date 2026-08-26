import type { Locale } from './types'

export interface IssuanceFlow {
  id: string
  label: Record<Locale, string>
  summary: Record<Locale, string>
  steps: Array<Record<Locale, string>>
  boundary: Record<Locale, string>
  source: { provider: string; title: string; url: string }
}

export const ISSUANCE_FLOWS: IssuanceFlow[] = [
  {
    id: 'us-treasury-marketable-auction',
    label: { ko: '미국 국채 시장성 증권 경매', en: 'U.S. Treasury marketable-security auction' },
    summary: { ko: '공고된 경매에서 입찰을 받고, 낙찰 뒤 발행일에 장부상 증권을 발행하는 경로입니다.', en: 'A public auction receives bids, then issues book-entry securities on the issue date after awards.' },
    steps: [
      { ko: '경매 공고', en: 'Announce auction' },
      { ko: '경쟁·비경쟁 입찰 접수', en: 'Receive competitive and noncompetitive bids' },
      { ko: '낙찰·결과 공표', en: 'Award bids and publish results' },
      { ko: '발행일 결제·장부상 발행', en: 'Settle and issue in book-entry form' },
    ],
    boundary: { ko: '시장성 미 재무부 증권의 공식 경매를 설명합니다. 개별 입찰 자격·낙찰·수익률·보유를 예측하거나 권유하지 않습니다.', en: 'This describes the official auction of marketable U.S. Treasury securities. It does not predict or recommend a bid, award, yield, eligibility, or holding.' },
    source: { provider: 'TreasuryDirect', title: 'About Auctions', url: 'https://www.treasurydirect.gov/auctions/' },
  },
]
