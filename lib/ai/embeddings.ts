
/**
 * Client for interacting with the Supabase Edge Function 'embed'.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    const embeddings = await generateEmbeddings([text]);
    return embeddings[0];
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error("Missing Supabase configuration");
    }

    const BATCH_SIZE = 5;
    const results: number[][] = [];

    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
        const batch = texts.slice(i, i + BATCH_SIZE);
        const promises = batch.map(async (text) => {
            const response = await fetch(`${supabaseUrl}/functions/v1/embed`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${serviceRoleKey}`,
                },
                body: JSON.stringify({ input: text }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to generate embeddings: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            return data.embedding as number[];
        });

        const batchResults = await Promise.all(promises);
        results.push(...batchResults);
    }

    return results;
}
