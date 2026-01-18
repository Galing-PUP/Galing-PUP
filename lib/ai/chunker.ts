import { PageContent } from './pdf-loader'

export interface DocumentChunkParams {
  content: string
  phrase: string
  pageStart: number
  pageEnd: number
  charStart: number
  charEnd: number
}

const CHUNK_SIZE_TOKENS = 500
const OVERLAP_TOKENS = 80
const CHARS_PER_TOKEN = 4 // Approximate

const CHUNK_SIZE_CHARS = CHUNK_SIZE_TOKENS * CHARS_PER_TOKEN // 2000
const OVERLAP_CHARS = OVERLAP_TOKENS * CHARS_PER_TOKEN // 320

/**
 * Splits extracted page contents into chunks suitable for embedding.
 * Uses character-based approximation for tokens.
 */
export function chunkDocument(pages: PageContent[]): DocumentChunkParams[] {
  // 1. Create a global text map to track page boundaries
  let fullText = ''
  const pageMap: { page: number; start: number; end: number }[] = []

  for (const p of pages) {
    const start = fullText.length
    fullText += p.text + ' ' // Add space separator
    const end = fullText.length
    // Store original page mapping
    // Note: The added space is counted towards the current page
    pageMap.push({ page: p.pageNumber, start, end })
  }

  const chunks: DocumentChunkParams[] = []
  let startIdx = 0

  while (startIdx < fullText.length) {
    let endIdx = startIdx + CHUNK_SIZE_CHARS

    // Don't cut in the middle of a word if possible (simple heuristic)
    if (endIdx < fullText.length) {
      // Look for next space
      const nextSpace = fullText.indexOf(' ', endIdx)
      if (nextSpace !== -1 && nextSpace - endIdx < 100) {
        endIdx = nextSpace
      }
    } else {
      endIdx = fullText.length
    }

    const chunkContent = fullText.slice(startIdx, endIdx).trim()

    if (chunkContent.length === 0) {
      startIdx += CHUNK_SIZE_CHARS - OVERLAP_CHARS
      continue
    }

    // Determine page range
    // chunk spans from startIdx to endIdx (exclusive) in fullText
    const pStartRaw = startIdx
    const pEndRaw = endIdx

    let pageStart = 0
    let pageEnd = 0

    // Find pageStart
    const startPageObj = pageMap.find(
      (m) => pStartRaw >= m.start && pStartRaw < m.end,
    )
    pageStart = startPageObj ? startPageObj.page : pageMap[0].page

    // Find pageEnd
    // pEndRaw - 1 to get the last character's page
    const endPageObj = pageMap.find(
      (m) => pEndRaw - 1 >= m.start && pEndRaw - 1 < m.end,
    )
    pageEnd = endPageObj ? endPageObj.page : pageMap[pageMap.length - 1].page

    // Fallback if not found (shouldn't happen with correct logic)
    if (!pageStart) pageStart = pageMap[0].page
    if (!pageEnd) pageEnd = pageMap[pageMap.length - 1].page

    // Generate phrase (first 20 words)
    const words = chunkContent.split(/\s+/)
    const phrase = words.slice(0, 20).join(' ')

    chunks.push({
      content: chunkContent,
      phrase,
      pageStart,
      pageEnd,
      charStart: pStartRaw,
      charEnd: pEndRaw,
    })

    if (endIdx >= fullText.length) break

    // Move forward by chunk size - overlap
    startIdx += CHUNK_SIZE_CHARS - OVERLAP_CHARS
  }

  return chunks
}
