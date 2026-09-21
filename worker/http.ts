export class HttpError extends Error { constructor(public status: number, public code: string) { super(code) } }
export const json = (value: unknown, status = 200) => Response.json(value, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } })
export async function boundedText(body: ReadableStream<Uint8Array> | null, limit = 65536): Promise<string> {
  if (!body) return ''
  const reader = body.getReader(); const chunks: Uint8Array[] = []; let size = 0
  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > limit) { await reader.cancel(); throw new HttpError(413, 'body_too_large') }
      chunks.push(value)
    }
  } finally { reader.releaseLock() }
  const bytes = new Uint8Array(size); let offset = 0
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length }
  return new TextDecoder().decode(bytes)
}
export async function requestJson(request: Request) {
  try { return JSON.parse(await boundedText(request.body)) as unknown } catch (error) {
    if (error instanceof HttpError) throw error
    throw new HttpError(400, 'invalid_json')
  }
}
export function object(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
}
export const idOf = (value: unknown): string => typeof value === 'string' ? value : typeof object(value).id === 'string' ? object(value).id as string : ''
