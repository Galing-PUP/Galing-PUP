import { describe, expect, it } from "bun:test";
import { chunkDocument } from "@/lib/ai/chunker";
import { PageContent } from "@/lib/ai/pdf-loader";

describe("Chunker", () => {
    it("should chunk text within token limits", () => {
        const pages: PageContent[] = [
            { pageNumber: 1, text: "A".repeat(1000) }, // 1000 chars ~ 250 tokens
            { pageNumber: 2, text: "B".repeat(3000) }  // 3000 chars ~ 750 tokens
        ];

        // Total chars ~ 4000. 
        // Chunk size = 2000 chars. Overlap = 320 chars.
        // Expected: 
        // Chunk 1: 0-2000 (Page 1 partial + Page 2 partial)
        // Chunk 2: 1680-3680 ... 

        const chunks = chunkDocument(pages);

        expect(chunks.length).toBeGreaterThan(0);
        expect(chunks[0].content.length).toBeLessThanOrEqual(2000); // 500 tokens * 4
        expect(chunks[0].pageStart).toBe(1);

        // Check overlap logic roughly
        // If content is huge, we expect multiple chunks
        expect(chunks.length).toBeGreaterThan(1);
    });

    it("should preserve page boundaries metadata", () => {
        const pages: PageContent[] = [
            { pageNumber: 1, text: "Page One Content. " },
            { pageNumber: 2, text: "Page Two Content. " }
        ];

        // Should fit in one chunk
        const chunks = chunkDocument(pages);
        expect(chunks.length).toBe(1);
        expect(chunks[0].pageStart).toBe(1);
        expect(chunks[0].pageEnd).toBe(2);
        expect(chunks[0].content).toContain("Page One");
        expect(chunks[0].content).toContain("Page Two");
    });
});
