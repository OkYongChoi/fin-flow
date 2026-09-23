import type { Locale, NetworkId } from './types'

type LocalizedText = Record<Locale, string>
export interface FinanceTerm {
  id: string
  label: LocalizedText
  definition: LocalizedText
  distinction: LocalizedText
  aliases: string[]
  networks: NetworkId[]
  source: { title: string; url: string; reviewedAt: string }
}

// These dates record review of explanatory sources, not a market-data snapshot.
const reviewedAt = '2026-09-23'
const rbaGlossary = {
  title: 'Reserve Bank of Australia · Financial market infrastructure glossary',
  url: 'https://www.rba.gov.au/payments-and-infrastructure/financial-market-infrastructure/clearing-and-settlement-facilities/standards/securities-settlement-facilities/2012/glossary.html',
  reviewedAt,
}

export const FINANCE_GLOSSARY: FinanceTerm[] = [
  {
    id: 'payment-message', label: { ko: '지급 메시지', en: 'Payment message' },
    definition: { ko: '은행 등이 지급을 처리하도록 주고받는 정보입니다. SWIFT는 이런 금융 메시지를 전달합니다.', en: 'Information exchanged so banks can process a payment. SWIFT carries these financial messages.' },
    distinction: { ko: '메시지가 수취은행에 도착한 시각과 고객 계좌에 돈이 들어온 시각은 다를 수 있습니다.', en: 'A message reaching the receiving bank does not mean the customer has already been credited.' },
    aliases: ['SWIFT', '스위프트', 'messaging', '해외 송금', '해외송금', 'international transfer', 'bank transfer'], networks: ['swift', 'chips-fedwire'],
    source: { title: 'Swift · What is Swift?', url: 'https://www.swift.com/about-us/who-we-are/what-swift', reviewedAt },
  },
  {
    id: 'authorization', label: { ko: '카드 승인', en: 'Card authorization' },
    definition: { ko: '카드 결제 요청을 허용할지 결정하는 단계입니다. Visa의 설명에서는 카드 발급은행이 승인 또는 거절을 응답합니다.', en: 'The decision to allow a card payment request. In Visa’s example, the card issuer responds with approval or a decline.' },
    distinction: { ko: '승인과 청산·결제는 별도 단계입니다. 승인만으로 가맹점의 입금이 끝났다고 볼 수 없습니다.', en: 'Approval, clearing and settlement are separate stages. Approval alone does not establish that the merchant has been paid.' },
    aliases: ['approval', '카드 결제', '카드결제', 'Visa', '비자'], networks: ['visa'],
    source: { title: 'Visa · VisaNet Connect Acceptance', url: 'https://developer.visa.com/capabilities/visanet-connect-acceptance/docs', reviewedAt },
  },
  {
    id: 'clearing', label: { ko: '청산', en: 'Clearing' },
    definition: { ko: '결제 전에 거래 정보를 맞춰 보고, 주고받을 의무를 정리하는 과정입니다.', en: 'Checking transaction records and working out obligations before settlement.' },
    distinction: { ko: '얼마를 지급할지 정리하는 것과 실제 지급을 마치는 것은 다릅니다.', en: 'Working out what is owed does not itself complete the payment.' },
    aliases: ['clear', '의무 계산', '거래 확인'], networks: ['visa', 'listed-derivatives'], source: rbaGlossary,
  },
  {
    id: 'settlement', label: { ko: '결제', en: 'Settlement' },
    definition: { ko: '지급에서는 약속한 자금을 이전해 지급 의무를 이행하는 과정입니다.', en: 'For payments, transferring funds to fulfil an obligation.' },
    distinction: { ko: '지급 지시를 보내거나 카드 승인을 받는 것과 구분합니다.', en: 'Sending an instruction or receiving card approval is a different step.' },
    aliases: ['settle', '자금 이전', '자금이전', '은행 결제', '입금'], networks: ['chips-fedwire', 'fx-pvp'],
    source: { title: 'BIS · Innovations in payments', url: 'https://www.bis.org/publications/innovations-payments', reviewedAt },
  },
  {
    id: 'netting', label: { ko: '상계', en: 'Netting' },
    definition: { ko: '서로 주고받을 의무를 맞춰, 결제에 필요한 지급 건수와 금액을 줄이는 방식입니다.', en: 'Offsetting mutual obligations to reduce the payments needed for settlement.' },
    distinction: { ko: '상계 결과를 계산했다고 남은 지급까지 모두 끝난 것은 아닙니다.', en: 'Calculating a net amount does not mean the remaining payment is complete.' },
    aliases: ['net', '차액', 'offset', 'CHIPS', '칩스'], networks: ['chips-fedwire', 'fx-pvp'], source: rbaGlossary,
  },
  {
    id: 'collateral', label: { ko: '담보', en: 'Collateral' },
    definition: { ko: '채무 이행을 뒷받침하도록 제공하는 자산이나 제삼자의 약속입니다.', en: 'An asset or third-party commitment used to secure an obligation.' },
    distinction: { ko: '담보를 제공하는 것과 빚을 갚는 것은 같은 일이 아닙니다.', en: 'Providing collateral is different from repaying the debt.' },
    aliases: ['담보자산', '담보 자산', '증거금', 'margin', 'repo', '레포'], networks: ['repo-financing', 'securities-lending'], source: rbaGlossary,
  },
  {
    id: 'reserve-balances', label: { ko: '준비금 잔액', en: 'Reserve balances' },
    definition: { ko: '미국의 예에서는 예금취급기관이 연방준비은행 계좌에 보유하며 지급에 사용하는 잔액입니다.', en: 'In the US example, balances that depository institutions hold at Federal Reserve Banks and use for payments.' },
    distinction: { ko: '고객이 상업은행에 가진 예금과, 은행이 중앙은행에 가진 잔액은 서로 다른 계좌의 기록입니다.', en: 'A customer’s bank deposit and a bank’s balance at the central bank are entries in different accounts.' },
    aliases: ['reserves', '준비금', '중앙은행', 'central bank', 'Fed', '연준'], networks: ['chips-fedwire'],
    source: { title: 'Federal Reserve · Federal Reserve liabilities', url: 'https://www.federalreserve.gov/monetarypolicy/bst_frliabilities.htm', reviewedAt },
  },
  {
    id: 'primary-market', label: { ko: '발행·1차시장', en: 'Issuance and primary market' },
    definition: { ko: '새로 발행한 증권을 투자자에게 팔고, 발행자가 그 대금을 받는 시장입니다.', en: 'The market where newly issued securities are sold and the issuer receives the proceeds.' },
    distinction: { ko: '이미 발행된 증권을 투자자끼리 사고파는 거래와 구분합니다.', en: 'This differs from investors trading securities that have already been issued.' },
    aliases: ['issuance', '발행', '공모', 'IPO', '기업공개', '채권 발행', 'bond issue'], networks: ['bond-issuance', 'securities-issuance'],
    source: { title: 'Investor.gov · Primary Market', url: 'https://www.investor.gov/introduction-investing/investing-basics/glossary/primary-market', reviewedAt },
  },
  {
    id: 'rtgs', label: { ko: '실시간 총액결제', en: 'Real-time gross settlement' },
    definition: { ko: '지급 지시를 한 건씩, 실시간으로 결제하는 방식입니다.', en: 'Settling payment instructions individually, in real time.' },
    distinction: { ko: '여러 지급을 상계한 차액을 나중에 결제하는 방식과 구분합니다.', en: 'This differs from settling netted payment batches later.' },
    aliases: ['RTGS', 'gross settlement', '총액', 'Fedwire', '페드와이어'], networks: ['chips-fedwire'], source: rbaGlossary,
  },
]

const normalize = (text: string) => text.normalize('NFKC').toLowerCase()
export function findFinanceTerms(query: string): FinanceTerm[] {
  const words = normalize(query).trim().split(/\s+/).filter(Boolean)
  if (!words.length) return FINANCE_GLOSSARY
  return FINANCE_GLOSSARY.filter(term => {
    const searchable = normalize([term.label.ko, term.label.en, ...term.aliases, term.definition.ko, term.definition.en].join(' '))
    return words.every(word => searchable.includes(word))
  })
}
