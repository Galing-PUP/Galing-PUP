import { DocumentChunkParams } from '@/lib/ai/chunker'
import { genAI } from '@/lib/ai/gemini' // Use direct client
import { AiCitation, AiInsightResult, LlmResponse } from '@/types/ai-insights'

interface SummaryContext {
  chunks: (DocumentChunkParams & {
    id?: string | bigint | number
    documentId?: number
    embedding?: number[]
  })[]
}

/**
 * Generates a Critical Technical Summary using Gemini with verifiable citations.
 */
export async function generateDocumentSummary(
  context: SummaryContext,
): Promise<string> {
  // 1. Prepare Context & Mapping
  let contextText = ''
  const chunkMap = new Map<number, any>()

  context.chunks.forEach((chunk, index) => {
    // [CitationID: X]
    contextText += `[CitationID: ${index}]\nDocumentID: ${chunk.documentId || 'Unknown'}\nPage: ${chunk.pageStart}-${chunk.pageEnd}\nPhrase: "${chunk.phrase}"\nContent:\n${chunk.content}\n\n`
    chunkMap.set(index, chunk)
  })

  // 2. System Prompt
  const systemPrompt = `
You must output valid JSON only.
No prose outside JSON.
No first-person language.
No role references.
No meta commentary.

Task:
Generate a Critical Technical Summary grounded ONLY in the provided context.

Rules:
- Every factual claim MUST reference one or more CitationIDs.
- You MUST insert citation references in the text using the format \`[refIndex]\` (e.g., \`[1]\`, \`[2]\`) immediately following the claim.
- These \`[refIndex]\` markers must correspond to the \`refIndex\` in the citations array.
- Do NOT use standard Markdown links for citations. Use simple bracketed numbers.
- Do NOT invent information.
- If information is missing, omit it.

Output schema:
{
  "sections": {
    "methodology": "...",
    "mechanism": "...",
    "results": "...",
    "conclusion": "..."
  },
  "citations": [
    {
      "refIndex": 1,
      "citationIds": [0, 3]
    }
  ]
}

CONTEXT:
${contextText}
`

  // 3. Call Gemini with JSON enforcement
  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: systemPrompt,
      config: {
        responseMimeType: 'application/json',
      },
    })

    const textResponse = response.text

    if (!textResponse) throw new Error('Empty response from Gemini')

    // 4. Parse & Resolve
    let llmOutput: LlmResponse
    try {
      llmOutput = JSON.parse(textResponse) as LlmResponse
    } catch (e) {
      console.error('Failed to parse JSON from AI response', textResponse)
      throw new Error('Invalid JSON response from AI')
    }

    return resolveCitations(llmOutput, chunkMap)
  } catch (error) {
    console.error('AI Summary Generation Failed:', error)
    return JSON.stringify({
      sections: {
        methodology: 'Summary generation failed.',
        mechanism: 'Please try again later.',
        results: '',
        conclusion: '',
      },
      citations: [],
    })
  }
}

function resolveCitations(
  llmOutput: LlmResponse,
  chunkMap: Map<number, any>,
): string {
  const resolvedCitations: AiCitation[] = []

  llmOutput.citations.forEach((citation) => {
    // Resolve each context ID to a real chunk
    citation.citationIds.forEach((ctxId) => {
      const chunk = chunkMap.get(ctxId)
      if (chunk) {
        resolvedCitations.push({
          refIndex: citation.refIndex,
          chunkId: Number(chunk.id), // Handle BigInt
          documentId: chunk.documentId || 0, // Fallback
          pageStart: chunk.pageStart,
          pageEnd: chunk.pageEnd,
          phrase: chunk.phrase,
          charStart: chunk.charStart,
          charEnd: chunk.charEnd,
        })
      }
    })
  })

  const finalResult: AiInsightResult = {
    sections: llmOutput.sections,
    citations: resolvedCitations,
  }

  return JSON.stringify(finalResult)
}
