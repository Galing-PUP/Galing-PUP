// Use standard build
// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist/build/pdf.min.mjs'
import './polyfill'

// Standard build in Node 18+ uses worker_threads automatically
// No manual workerSrc config needed

export interface PageContent {
  pageNumber: number
  text: string
}

/**
 * Extracts text from a PDF buffer while preserving page numbers.
 * @param buffer Buffer or ArrayBuffer of the PDF file
 */
export async function extractTextFromPdf(
  buffer: Buffer | ArrayBuffer,
): Promise<PageContent[]> {
  // Convert standard Buffer to Uint8Array if needed
  const data = new Uint8Array(buffer)

  /* console.log('Starting PDF extraction with buffer size:', data.length) */
  const loadingTask = pdfjsLib.getDocument({
    data,
    useSystemFonts: true, // Avoid font loading errors
    disableFontFace: true, // Avoid font loading errors
  })

  const pdfDocument = await loadingTask.promise
  // console.log('PDF Document loaded. Pages:', pdfDocument.numPages)
  const numPages = pdfDocument.numPages
  const pages: PageContent[] = []

  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDocument.getPage(i)
    const textContent = await page.getTextContent()

    // items usually contains { str: string, ... }
    // We join them with space.
    // Ideally we should respect layout but for simple RAG this is usually enough.
    const text = textContent.items.map((item: any) => item.str).join(' ')

    // Normalize whitespace
    const cleanText = text.replace(/\s+/g, ' ').trim()

    if (cleanText.length > 0) {
      pages.push({
        pageNumber: i,
        text: cleanText,
      })
    }
  }

  return pages
}
