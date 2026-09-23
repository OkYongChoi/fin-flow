import { parseBrief, type BriefDraft } from './briefs'
import type { Locale } from './types'

export const LOCAL_DRAFT_KEY = 'fin-flow:brief-draft:v1'
const HANDOFF_KEY = 'fin-flow:sign-in-draft:v1'
const workingKey = (owner: string) => `fin-flow:working-draft:v2:${owner}`
export interface WorkingDraft { draft: BriefDraft; id: string | null; revision: number | null; savedFingerprint: string | null }
export const fingerprint = (draft: BriefDraft) => JSON.stringify(draft)
export const blankDraft = (locale: Locale): BriefDraft => ({ title: locale === 'ko' ? '금융 흐름 비교 브리핑' : 'Financial flow comparison', notes: '', networks: ['swift', 'chips-fedwire'], locale })
export const freshWorking = (draft: BriefDraft): WorkingDraft => ({ draft, id: null, revision: null, savedFingerprint: null })
export function parseEditableDraft(value: unknown): BriefDraft | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as BriefDraft
  if (typeof raw.title !== 'string' || raw.title.length > 120 || !Array.isArray(raw.networks)) return null
  // Incomplete edits (empty title/selection) must survive reload, but cannot be exported/saved.
  if (!parseBrief({ ...raw, title: raw.title.trim() ? raw.title : 'Untitled', networks: raw.networks.length ? raw.networks : ['swift'] })) return null
  return { title: raw.title, notes: raw.notes, networks: raw.networks, locale: raw.locale }
}
export function pendingHandoff(owner?: string | null): BriefDraft | null {
  try {
    const raw = JSON.parse(sessionStorage.getItem(HANDOFF_KEY) ?? 'null')
    if (!raw || typeof raw.at !== 'number' || !Number.isFinite(raw.at) || Date.now() - raw.at >= 3600000 || raw.at > Date.now() || (raw.owner && raw.owner !== owner)) return null
    if (owner && !raw.owner) sessionStorage.setItem(HANDOFF_KEY, JSON.stringify({ ...raw, owner }))
    return parseEditableDraft(raw.draft)
  } catch { return null }
}
export function stageHandoff(draft: BriefDraft) {
  sessionStorage.setItem(HANDOFF_KEY, JSON.stringify({ draft, at: Date.now() }))
}
export function clearHandoff() { try { sessionStorage.removeItem(HANDOFF_KEY) } catch { /* Original guest copy remains. */ } }
export function loadWorking(owner: string | null, locale: Locale): WorkingDraft {
  try {
    if (owner) {
      const raw = JSON.parse(sessionStorage.getItem(workingKey(owner)) ?? 'null')
      const draft = parseEditableDraft(raw?.draft)
      if (draft) return { draft, id: typeof raw.id === 'string' ? raw.id : null, revision: Number.isSafeInteger(raw.revision) ? raw.revision : null, savedFingerprint: typeof raw.savedFingerprint === 'string' ? raw.savedFingerprint : null }
      const handoff = pendingHandoff(owner)
      if (handoff) return freshWorking(handoff)
    } else {
      const draft = parseEditableDraft(JSON.parse(localStorage.getItem(LOCAL_DRAFT_KEY) ?? 'null'))
      if (draft) return freshWorking(draft)
    }
  } catch { /* Storage unavailable or invalid: keep the editor usable. */ }
  return freshWorking(blankDraft(locale))
}
export function persistWorking(owner: string | null, working: WorkingDraft) {
  if (owner) sessionStorage.setItem(workingKey(owner), JSON.stringify(working))
  else localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify(working.draft))
}

export const BRIEF_TEMPLATES = [
  { id: 'everyday-transfer', title: { ko: '해외 송금은 어떻게 도착할까?', en: 'How does money travel abroad?' }, description: { ko: 'SWIFT 메시지와 달러 결제의 역할을 구분해 보기', en: 'Explore the roles of Swift messages and dollar settlement' }, networks: ['swift', 'chips-fedwire'], notes: { ko: '내가 궁금한 점: 송금 메시지가 도착하면 돈도 도착한 걸까?\n내 말로 설명하기: \n새롭게 알게 된 점: \n더 알아볼 질문: ', en: 'My question: when a payment message arrives, has the money arrived too?\nIn my own words: \nWhat I learned: \nWhat I want to explore next: ' } },
  { id: 'everyday-card', title: { ko: '카드 결제와 계좌이체는 어떻게 다를까?', en: 'How do cards and bank transfers differ?' }, description: { ko: 'Visa와 미국 달러 결제의 참여자와 단계를 비교하기', en: 'Compare participants and stages in Visa and US dollar settlement' }, networks: ['visa', 'chips-fedwire'], notes: { ko: '내가 궁금한 점: 카드의 승인과 은행의 결제는 어떤 차이가 있을까?\n내 말로 설명하기: \n공통점과 차이점: \n더 알아볼 질문: ', en: 'My question: how does card authorization differ from bank settlement?\nIn my own words: \nSimilarities and differences: \nWhat I want to explore next: ' } },
  { id: 'everyday-dollar', title: { ko: '디지털 달러는 어떻게 움직일까?', en: 'How does a digital dollar move?' }, description: { ko: 'USDC 전송과 은행 결제의 범위와 주의점 살펴보기', en: 'Explore the scope and limits of USDC transfers and bank settlement' }, networks: ['usdc', 'chips-fedwire'], notes: { ko: '내가 궁금한 점: 토큰을 보내는 것과 은행에서 달러를 보내는 것은 어떻게 다를까?\n내 말로 설명하기: \n혼동하지 말아야 할 점: \n더 알아볼 질문: ', en: 'My question: how does sending a token differ from sending dollars through a bank?\nIn my own words: \nWhat I should not confuse: \nWhat I want to explore next: ' } },
  { id: 'payments', title: { ko: '결제 흐름 설명', en: 'Explain payment rails' }, description: { ko: '메시지와 결제를 구분하는 온보딩 자료', en: 'An onboarding brief separating messaging from settlement' }, networks: ['swift', 'chips-fedwire'], notes: { ko: '독자: 신규 팀원\n핵심 질문: 메시지 전달과 실제 결제는 어디서 구분되는가?\n우리 제품에 적용할 점: ', en: 'Audience: new teammates\nKey question: where does messaging end and settlement begin?\nImplications for our product: ' } },
  { id: 'issuance', title: { ko: '발행 절차 비교', en: 'Compare issuance workflows' }, description: { ko: '채권과 자산유동화의 역할·절차 정리', en: 'Roles and steps across bonds and securitization' }, networks: ['bond-issuance', 'asset-backed-securitization'], notes: { ko: '독자: 제품·운영 담당자\n핵심 질문: 참여자의 역할과 인계 지점은 어떻게 다른가?\n추가 확인할 원문: ', en: 'Audience: product and operations\nKey question: how do roles and handoffs differ?\nSources to review further: ' } },
  { id: 'lesson', title: { ko: '교육 자료 만들기', en: 'Prepare a lesson' }, description: { ko: 'ETF와 증권대차를 설명할 질문과 근거', en: 'Questions and evidence for ETFs and securities lending' }, networks: ['etf-primary-market', 'securities-lending'], notes: { ko: '학습 목표: 참여자와 자산 이동 구분하기\n토론 질문: 두 구조에서 담보와 결제의 역할은 무엇인가?\n수업 후 확인할 점: ', en: 'Learning goal: distinguish participants and asset transfers\nDiscussion: what roles do collateral and settlement play?\nFollow-up questions: ' } },
] as const
export function templateDraft(id: string, locale: Locale): BriefDraft | null {
  const template = BRIEF_TEMPLATES.find(item => item.id === id)
  return template ? { title: template.title[locale], notes: template.notes[locale], networks: [...template.networks], locale } : null
}
