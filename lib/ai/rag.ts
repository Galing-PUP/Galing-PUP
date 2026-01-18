import { generateEmbedding } from './embeddings'
import { SearchResult, similaritySearch } from './vector-store'

/**
 * Assembles a RAG prompt by retrieving relevant context for the query.
 */
export async function assembleRagContext(query: string): Promise<{
  prompt: string
  sources: SearchResult[]
}> {
  // 1. Generate embedding for the query
  const queryVector = await generateEmbedding(query)

  // 2. Retrieve relevant chunks
  // Limit to top 5, threshold 0.5 (configurable)
  const results = await similaritySearch(queryVector, 5, 0.5)

  if (results.length === 0) {
    return {
      prompt: `User Query: ${query}\n\nNo relevant sources found in the knowledge base. Please answer based on general knowledge but state that no internal documents were matched.`,
      sources: [],
    }
  }

  // 3. Assemble prompt
  let contextText = ''

  results.forEach((r, index) => {
    contextText += `[Source ${index + 1}]: (Page ${r.pageStart}-${r.pageEnd}) "${r.phrase}..."\n${r.content}\n\n`
  })

  const prompt = `
You are an intelligent assistant for the Galing-PUP academic repository.
Answer the user's question using ONLY the provided context sources below.
If the answer is not in the context, clearly state that you cannot find the answer in the provided documents.

--- CONTEXT START ---
${contextText}
--- CONTEXT END ---

User Query: ${query}

Instructions:
1. Cite sources using [Source X] notation.
2. Mention specific page numbers when relevant.
3. Be concise and accurate.
4. If the context is empty or irrelevant, do not hallucinate information.
`

  return { prompt, sources: results }
}
