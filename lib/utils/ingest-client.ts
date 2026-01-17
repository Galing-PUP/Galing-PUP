export type IngestStep = {
    step: "downloading" | "extracting" | "embedding" | "summarizing" | "complete" | "error";
    progress: number;
    message: string;
};

export async function streamIngest(
    documentId: number,
    onProgress: (step: IngestStep) => void
): Promise<void> {
    try {
        const response = await fetch("/api/admin/ingest", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ documentId }),
        });

        if (!response.ok) {
            if (response.headers.get("content-type")?.includes("application/json")) {
                const err = await response.json();
                throw new Error(err.error || "Ingestion failed");
            }
            throw new Error(`Ingestion failed: ${response.statusText}`);
        }

        if (!response.body) {
            throw new Error("No response body received");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");

            // Keep the last partial line in the buffer
            buffer = lines.pop() || "";

            for (const line of lines) {
                if (!line.trim()) continue;
                try {
                    const stepData: IngestStep = JSON.parse(line);
                    onProgress(stepData);

                    if (stepData.step === "error") {
                        throw new Error(stepData.message);
                    }
                } catch (e) {
                    console.error("Error parsing ingest stream line:", line, e);
                }
            }
        }
    } catch (error) {
        console.error("Stream Ingest Error:", error);
        onProgress({
            step: "error",
            progress: 0,
            message: error instanceof Error ? error.message : "Unknown error occurred"
        });
        throw error;
    }
}
