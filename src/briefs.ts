import { EDGES, NETWORKS } from './data'
import { FLOW_GUIDES } from './flowGuides'
import type { DataBundle, Locale, NetworkId } from './types'

export const PRO_PRICE_USD = 49
export const CLOUD_BRIEF_LIMIT = 50
export interface BriefDraft { title: string; notes: string; networks: NetworkId[]; locale: Locale }
export interface SavedBrief { id: string; draft: BriefDraft; markdown: string; snapshotVersion: string; updatedAt: number }
export function parseBrief(value: unknown): BriefDraft | null {
  if (!value || typeof value !== 'object') return null
  const v = value as Record<string, unknown>
  if (typeof v.title !== 'string' || !v.title.trim() || v.title.length > 120 || typeof v.notes !== 'string' || v.notes.length > 6000 || !['ko', 'en'].includes(String(v.locale)) || !Array.isArray(v.networks) || v.networks.length < 1 || v.networks.length > 4 || new Set(v.networks).size !== v.networks.length || !v.networks.every(id => NETWORKS.some(n => n.id === id))) return null
  return { title: v.title.trim(), notes: v.notes, networks: v.networks as NetworkId[], locale: v.locale as Locale }
}
export function briefSources(networks: NetworkId[], data: DataBundle) {
  const ids = new Set(EDGES.filter(edge => networks.includes(edge.networkId)).flatMap(edge => edge.sourceIds))
  return data.sources.filter(source => ids.has(source.id))
}
const plain = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/([\\`*_\[\]#])/g, '\\$1')
export function briefMarkdown(draft: BriefDraft, data: DataBundle) {
  const ko = draft.locale === 'ko'
  const lines = [`# ${plain(draft.title)}`, '', `Flow of Money · ${ko ? '데이터 스냅샷' : 'Data snapshot'} ${data.version}`, `${ko ? '다음 출처 검토 기한' : 'Source review due'}: ${data.reviewDueAt}`, '', ko ? '금융 구조 학습용 도식입니다. 실시간 거래 데이터나 투자 조언이 아닙니다.' : 'An educational financial-infrastructure schematic, not live transaction data or investment advice.', '']
  for (const id of draft.networks) {
    const network = NETWORKS.find(n => n.id === id)!
    const guide = FLOW_GUIDES[id]
    lines.push(`## ${plain(ko ? network.label : network.labelEn)}`, '', plain(ko ? network.description : network.descriptionEn), '', ...(guide?.steps ?? []).map((step, i) => `${i + 1}. ${plain(ko ? step.ko : step.en)} — ${plain(ko ? step.noteKo : step.noteEn)}`), '', `> ${plain(guide ? (ko ? guide.boundary.ko : guide.boundary.en) : (ko ? '설명용 구조도이며 개별 거래를 재현하지 않습니다.' : 'An explanatory schematic; it does not reproduce individual transactions.'))}`, '', ...(guide?.roles ?? []).map(role => `- ${plain(ko ? role.ko : role.en)}`), '', ...briefSources([id], data).map(s => `- [${plain(s.provider)}: ${plain(s.title)}](${s.url}) · ${plain(s.coveragePeriod)} · ${ko ? '확인일' : 'retrieved'} ${s.retrievedAt}`), '')
  }
  lines.push(`## ${ko ? '작성자 메모' : 'Author notes'}`, '', plain(draft.notes || (ko ? '메모 없음' : 'No notes')), '')
  return lines.join('\n')
}
