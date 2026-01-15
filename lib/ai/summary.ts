import { DocumentChunkParams } from "./chunker";
import { runGemini } from "./gemini";

interface SummaryContext {
    chunks: (DocumentChunkParams & { embedding?: number[] })[];
}

/**
 * Generates a Critical Technical Summary using Gemini.
 * Formats context chunks with [Source X] (Page Y) citations.
 */
export async function generateDocumentSummary(context: SummaryContext, question?: string): Promise<string> {
    // 1. Prepare Context String
    // We limit context to avoid exceeding token limits (though Gemini has large context).
    // For a full paper, we might pass the first N chunks or distributed chunks.
    // Ideally, we pass as much as possible fitting in the window.

    let contextText = "";
    context.chunks.forEach((chunk, index) => {
        // Add identifiers for the model to reference
        // Using 0-indexed source mapping for simplicity in code, but 1-indexed for reading
        contextText += `[CitationID: ${index}] (Page ${chunk.pageStart}-${chunk.pageEnd}) "${chunk.phrase}..."\n${chunk.content}\n\n`;
    });

    // 2. Default Prompt for Summary if no question provided
    const defaultQuestion = "Generate a comprehensive Critical Technical Summary of this research paper.";
    const query = question || defaultQuestion;

    // 3. Call Gemini
    const response = await runGemini(contextText, query);

    return response;
}
