import path from 'path'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'
import { pathToFileURL } from 'url'
import './polyfill'

// Disable worker for server-side usage
// Convert absolute path to file:// URL for cross-platform compatibility
// @ts-ignore
pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(
  path.join(
    process.cwd(),
    'node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs',
  ),
).href

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

  const loadingTask = pdfjsLib.getDocument({
    data,
    useSystemFonts: true, // Avoid font loading errors
    disableFontFace: true, // Avoid font loading errors
  })

  const pdfDocument = await loadingTask.promise
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
