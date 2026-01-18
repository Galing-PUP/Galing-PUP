export interface AiInsightSection {
  methodology: string
  mechanism: string
  results: string
  conclusion: string
}

export interface AiCitation {
  refIndex: number
  chunkId: number // BigInt serialized to number or string? strict number in requirements, but DB is BigInt.
  // We will need to serialize BigInts to numbers where safe, or strings.
  // The user prompt says "chunkId: number".
  documentId: number
  pageStart: number
  pageEnd: number
  phrase: string
  charStart: number
  charEnd: number
}

export interface AiInsightResult {
  sections: AiInsightSection
  citations: AiCitation[]
}

// LLM Output Schema (before resolution)
export interface LlmCitation {
  refIndex: number
  citationIds: number[] // Maps to the context CitationID (0, 1, 2...)
}

export interface LlmResponse {
  sections: AiInsightSection
  citations: LlmCitation[]
}
