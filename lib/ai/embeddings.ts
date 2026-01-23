import { genAI } from './gemini'

type EmbedderType = 'gemini' | 'supabase'

// Configuration: Default to 'gemini' but allow override
const EMBEDDER: EmbedderType =
  (process.env.EMBEDDING_PROVIDER as EmbedderType) || 'gemini'

/**
 * Client for generating embeddings using the selected provider.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const embeddings = await generateEmbeddings([text])
  return embeddings[0]
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  console.log(`Generating embeddings using provider: ${EMBEDDER}`)

  if (EMBEDDER === 'gemini') {
    return generateGeminiEmbeddings(texts)
  } else {
    return generateSupabaseEmbeddings(texts)
  }
}

// --- Gemini Implementation ---

async function generateGeminiEmbeddings(texts: string[]): Promise<number[][]> {
  const MODEL = 'text-embedding-004'
  const results: number[][] = []

  // Helper for sleep/delay to avoid TPM limits
  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  const embedGemini = async (
    text: string,
    retries = 3,
    delay = 2000,
  ): Promise<number[]> => {
    try {
      // Add a small delay before every request to be a good citizen and avoid burst limits
      await wait(1000)

      const result = await genAI.models.embedContent({
        model: MODEL,
        contents: [{ parts: [{ text }] }],
      })

      if (
        !result.embeddings ||
        !result.embeddings[0] ||
        !result.embeddings[0].values
      ) {
        throw new Error(
          'Invalid response from Gemini: missing embedding values',
        )
      }

      return result.embeddings[0].values
    } catch (error: any) {
      if (retries > 0) {
        console.warn(`Gemini embedding error. Retrying in ${delay}ms...`, error)
        await wait(delay)
        return embedGemini(text, retries - 1, delay * 2)
      }
      throw error
    }
  }

  // Gemini often has strict TPM limits on free tier, so we process serially or with very small concurrency
  // For safety, we will process sequentially to maximize success rate on free tier.
  for (const text of texts) {
    const embedding = await embedGemini(text)
    results.push(embedding)
  }

  return results
}

// --- Supabase Implementation ---

async function generateSupabaseEmbeddings(
  texts: string[],
): Promise<number[][]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase configuration')
  }

  const BATCH_SIZE = 5
  const results: number[][] = []

  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  const fetchSupabase = async (
    text: string,
    retries = 3,
    delay = 1000,
  ): Promise<number[]> => {
    let response: Response

    try {
      response = await fetch(`${supabaseUrl}/functions/v1/embed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${serviceRoleKey}`, // Authenticated request
        },
        body: JSON.stringify({ input: text }),
      })
    } catch (error: any) {
      if (retries > 0) {
        console.warn(
          `Supabase embedding network error. Retrying in ${delay}ms...`,
          error,
        )
        await wait(delay)
        return fetchSupabase(text, retries - 1, delay * 2)
      }
      throw error
    }

    if (!response.ok) {
      if (response.status >= 500 || response.status === 429) {
        if (retries > 0) {
          console.warn(
            `Supabase embedding failed (${response.status}). Retrying in ${delay}ms...`,
          )
          await wait(delay)
          return fetchSupabase(text, retries - 1, delay * 2)
        }
      }

      const errorText = await response.text()
      throw new Error(
        `Failed to generate embeddings: ${response.status} ${errorText}`,
      )
    }

    const data = await response.json()
    if (!data.embedding) {
      throw new Error(
        'Invalid response from Supabase embed function: missing embedding field',
      )
    }
    return data.embedding as number[]
  }

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE)
    const batchResults = await Promise.all(
      batch.map((text) => fetchSupabase(text)),
    )
    results.push(...batchResults)
  }

  return results
}
