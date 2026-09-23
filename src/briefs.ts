import { NETWORKS, networkSources } from './data'
import { buildBriefEvidence } from './briefEvidence'
import type { DataBundle, Locale, NetworkId } from './types'

export const PRO_PRICE_USD = 49
export const CLOUD_BRIEF_LIMIT = 50
export interface BriefDraft { title: string; notes: string; networks: NetworkId[]; locale: Locale }
export interface SavedBrief { id: string; draft: BriefDraft; markdown: string; snapshotVersion: string; updatedAt: number }
export function parseBrief(value: unknown): BriefDraft | null {
  if (!value || typeof value !== 'object') return null
  const v = value as Record<string, unknown>
  if (typeof v.title !== 'string' || !v.title.trim() || v.title.length > 120 || typeof v.notes !== 'string' || v.notes.length > 6000 || (v.locale !== 'ko' && v.locale !== 'en') || !Array.isArray(v.networks) || v.networks.length < 1 || v.networks.length > 4 || new Set(v.networks).size !== v.networks.length || !v.networks.every(id => NETWORKS.some(n => n.id === id))) return null
  return { title: v.title.trim(), notes: v.notes, networks: v.networks as NetworkId[], locale: v.locale as Locale }
}
export function briefSources(networks: NetworkId[], data: DataBundle) {
  return networkSources(networks, data)
}
const plain = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/([\\`*_\[\]#|])/g, '\\$1')
const cell = (text: string) => plain(text).replace(/[\r\n]+/g, ' ')
function link(title: string, url: string) {
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) return cell(title)
    const destination = parsed.href.replace(/[()|\\]/g, character => '%' + character.charCodeAt(0).toString(16).toUpperCase())
    return `[${cell(title)}](${destination})`
  } catch { return cell(title) }
}
export function briefMarkdown(draft: BriefDraft, data: DataBundle) {
  const ko = draft.locale === 'ko'
  const evidence = buildBriefEvidence(draft.networks, data)
  const text = (koText: string, enText: string) => ko ? koText : enText
  const lines = [
    `# ${cell(draft.title)}`, '',
    `Flow of Money · ${text('데이터 스냅샷', 'Data snapshot')} ${plain(data.version)}`,
    `${text('스냅샷 생성일', 'Snapshot generated')}: ${plain(data.generatedAt)}`,
    `${text('다음 출처 검토 기한', 'Source review due')}: ${plain(data.reviewDueAt)}`, '',
    text('금융 구조 학습용 도식입니다. 실시간 거래 데이터나 투자 조언이 아닙니다.', 'An educational financial-infrastructure schematic, not live transaction data or investment advice.'), '',
    `## ${text('한눈에 비교', 'At a glance')}`, '',
    text('각 흐름의 범위·참여자·설명 한계를 비교합니다. 지표의 정의·단위·기간이 다르므로 합산하거나 순위로 해석하지 않습니다.', 'Compare scope, participants, and limits. Metrics have different definitions, units, and periods; they are not additive or a ranking.'), '',
    `| ${text('비교 항목', 'Compare')} | ${evidence.networks.map(network => cell(network.label[draft.locale])).join(' | ')} |`,
    `| --- | ${evidence.networks.map(() => '---').join(' | ')} |`,
  ]
  const comparison: Array<[string, string[]]> = [
    [text('무엇을 다루나요?', 'What does it cover?'), evidence.networks.map(network => network.scope[draft.locale])],
    [text('누가 참여하나요?', 'Who is involved?'), evidence.networks.map(network => network.roles.map(role => role[draft.locale]).join(' / '))],
    [text('어디까지 설명하나요?', 'What are the limits?'), evidence.networks.map(network => network.boundary[draft.locale])],
    [text('스냅샷 지표', 'Snapshot metrics'), evidence.networks.map(network => network.metrics.length ? text(`${network.metrics.length}개 기록`, `${network.metrics.length} recorded`) : text('지표 미제공', 'Not available'))],
  ]
  for (const [label, values] of comparison) lines.push(`| ${label} | ${values.map(cell).join(' | ')} |`)
  lines.push('', text(`선택한 흐름 ${evidence.networks.length}개 · 지표 ${evidence.metricCount}개 · 중복 제외 데이터 출처 ${evidence.sourceCount}개 · 절차 참고 링크 ${evidence.referenceCount}개`, `Selected flows: ${evidence.networks.length} · Metrics: ${evidence.metricCount} · Distinct data sources: ${evidence.sourceCount} · Process reference links: ${evidence.referenceCount}`), '')
  for (const network of evidence.networks) {
    lines.push(`## ${plain(network.label[draft.locale])}`, '', plain(network.scope[draft.locale]), '', `### ${text('출처가 연결된 스냅샷 지표', 'Source-linked snapshot metrics')}`, '')
    if (network.metrics.length) {
      lines.push(
        `| ${text('지표', 'Metric')} | ${text('기록된 값', 'Recorded value')} | ${text('단위', 'Unit')} | ${text('대상 기간', 'Coverage period')} | ${text('출처', 'Source')} | ${text('확인일', 'Retrieved')} |`,
        '| --- | --- | --- | --- | --- | --- |',
        ...network.metrics.map(metric => `| ${cell(ko ? metric.labelKo : metric.labelEn)} | ${cell(metric.display)} | ${cell(metric.unit)} | ${cell(metric.coveragePeriod)} | ${metric.source ? link(`${metric.source.provider}: ${metric.source.title}`, metric.source.url) : text('출처 정보 없음', 'Source record unavailable')} | ${metric.source ? cell(metric.source.retrievedAt) : text('확인일 없음', 'Unavailable')} |`), '',
      )
    } else lines.push(text('이 스냅샷에 연결된 지표가 없습니다. 지표 미제공은 값이 0임을 뜻하지 않습니다.', 'No linked metrics in this snapshot. Unavailable metrics do not imply a zero value.'), '')
    lines.push(
      `### ${text('절차와 역할', 'Process and roles')}`, '',
      ...network.steps.map((step, i) => `${i + 1}. ${plain(step[draft.locale])} — ${plain(ko ? step.noteKo : step.noteEn)}`), '',
      `> ${plain(network.boundary[draft.locale])}`, '',
      ...network.roles.map(role => `- ${plain(role[draft.locale])}`), '',
      `### ${text('데이터 출처와 확인일', 'Data sources and retrieval dates')}`, '',
    )
    if (network.sources.length) lines.push(...network.sources.map(source => `- ${link(`${source.provider}: ${source.title}`, source.url)} · ${plain(source.coveragePeriod)} · ${text('발행일', 'published')} ${plain(source.publishedAt)} · ${text('확인일', 'retrieved')} ${plain(source.retrievedAt)}`), '')
    else lines.push(text('이 스냅샷에 연결된 데이터 출처가 없습니다.', 'No linked data sources in this snapshot.'), '')
  }
  if (evidence.references.length) lines.push(`## ${text('절차 설명의 근거', 'Process references')}`, '', ...evidence.references.map(ref => `- ${link(ref.title, ref.url)}`), '')
  lines.push(`## ${text('작성자 메모', 'Author notes')}`, '', plain(draft.notes || text('메모 없음', 'No notes')), '')
  return lines.join('\n')
}
