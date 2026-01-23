import { extractTextFromPdf } from '@/lib/ai/pdf-loader'
import { describe, expect, it } from 'bun:test'

describe('PDF Loader (Node.js Compatible)', () => {
  it('should extract text from a simple PDF buffer', async () => {
    // Create a minimal PDF buffer for testing
    // This is a valid minimal PDF with one page containing "Hello World"
    const minimalPdf = Buffer.from(
      '%PDF-1.4\n' +
        '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n' +
        '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n' +
        '3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> ' +
        '/MediaBox [0 0 612 792] /Contents 5 0 R >>\nendobj\n' +
        '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n' +
        '5 0 obj\n<< /Length 44 >>\nstream\nBT\n/F1 24 Tf\n100 700 Td\n(Hello World) Tj\nET\nendstream\nendobj\n' +
        'xref\n0 6\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n' +
        '0000000115 00000 n\n0000000261 00000 n\n0000000340 00000 n\ntrailer\n' +
        '<< /Size 6 /Root 1 0 R >>\nstartxref\n441\n%%EOF',
    )

    const result = await extractTextFromPdf(minimalPdf)

    expect(result).toBeDefined()
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
    expect(result[0]).toHaveProperty('pageNumber')
    expect(result[0]).toHaveProperty('text')
    expect(typeof result[0].text).toBe('string')
  })

  it('should handle Buffer and ArrayBuffer inputs', async () => {
    const minimalPdf = Buffer.from(
      '%PDF-1.4\n' +
        '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n' +
        '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n' +
        '3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << >> /MediaBox [0 0 612 792] >>\nendobj\n' +
        'xref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n' +
        '0000000115 00000 n\ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n200\n%%EOF',
    )

    // Test with Buffer
    const resultBuffer = await extractTextFromPdf(minimalPdf)
    expect(resultBuffer).toBeDefined()
    expect(Array.isArray(resultBuffer)).toBe(true)

    // Test with ArrayBuffer
    const arrayBuffer = minimalPdf.buffer.slice(
      minimalPdf.byteOffset,
      minimalPdf.byteOffset + minimalPdf.byteLength,
    )
    const resultArrayBuffer = await extractTextFromPdf(arrayBuffer)
    expect(resultArrayBuffer).toBeDefined()
    expect(Array.isArray(resultArrayBuffer)).toBe(true)
  })

  it('should return pages with proper structure', async () => {
    const minimalPdf = Buffer.from(
      '%PDF-1.4\n' +
        '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n' +
        '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n' +
        '3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << >> /MediaBox [0 0 612 792] >>\nendobj\n' +
        'xref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n' +
        '0000000115 00000 n\ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n200\n%%EOF',
    )

    const result = await extractTextFromPdf(minimalPdf)

    expect(result.length).toBeGreaterThan(0)
    expect(result[0].pageNumber).toBeGreaterThanOrEqual(1)
    expect(typeof result[0].text).toBe('string')
  })
})
