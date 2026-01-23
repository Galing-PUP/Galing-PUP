export interface PageContent {
  pageNumber: number
  text: string
}

/**
 * Dynamically imports pdf-parse only at runtime to avoid Next.js build issues
 */
async function getPDFParse() {
  // Dynamic import to avoid Next.js bundling issues
  const pdfParse = await import('pdf-parse')
  return pdfParse.PDFParse
}

/**
 * Extracts text from a PDF buffer using Node.js-compatible pdf-parse.
 * Returns text split by page for compatibility with existing code.
 * @param buffer Buffer or ArrayBuffer of the PDF file
 * @returns Array of page content with text per page
 */
export async function extractTextFromPdf(
  buffer: Buffer | ArrayBuffer,
): Promise<PageContent[]> {
  // Convert ArrayBuffer to Buffer if needed
  const pdfBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer)

  // Get PDFParse class dynamically
  const PDFParse = await getPDFParse()

  // Create parser instance and extract text with page information
  const parser = new PDFParse({ data: pdfBuffer })
  const result = await parser.getText()

  const pages: PageContent[] = []

  // pdf-parse's getText returns an object with pages array
  if (result.pages && Array.isArray(result.pages)) {
    for (const page of result.pages) {
      const cleanText = page.text.replace(/\s+/g, ' ').trim()
      if (cleanText.length > 0) {
        pages.push({
          pageNumber: page.num,
          text: cleanText,
        })
      }
    }
  }

  // Fallback if no pages extracted
  if (pages.length === 0) {
    pages.push({
      pageNumber: 1,
      text: result.text?.replace(/\s+/g, ' ').trim() || '',
    })
  }

  return pages
}
