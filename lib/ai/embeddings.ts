/**
 * Client for interacting with the Supabase Edge Function 'embed'.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const embeddings = await generateEmbeddings([text])
  return embeddings[0]
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase configuration')
  }

  const BATCH_SIZE = 5
  const results: number[][] = []

  // Helper for exponential backoff
  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  // Retry logic
  const fetchWithRetry = async (
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
          Authorization: `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({ input: text }),
      })
    } catch (error: any) {
      // Network error (fetch failed)
      if (retries > 0) {
        console.warn(
          `Embedding network error. Retrying in ${delay}ms...`,
          error,
        )
        await wait(delay)
        return fetchWithRetry(text, retries - 1, delay * 2)
      }
      throw error
    }

    if (!response.ok) {
      // If it's a 5xx error or 429 (Too Many Requests), retry
      if (response.status >= 500 || response.status === 429) {
        if (retries > 0) {
          console.warn(
            `Embedding failed (${response.status}). Retrying in ${delay}ms...`,
          )
          await wait(delay)
          return fetchWithRetry(text, retries - 1, delay * 2)
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
        'Invalid response from embed function: missing embedding field',
      )
    }

    return data.embedding as number[]
  }

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE)

    // Process batch concurrently, but each item has its own retry logic
    const batchResults = await Promise.all(
      batch.map((text) => fetchWithRetry(text)),
    )
    results.push(...batchResults)
  }

  return results
}
