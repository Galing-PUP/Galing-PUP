"use client";

import { useAiInsightsStore } from "@/lib/store/ai-insights-store";
import { useEffect } from "react";

export function PdfController({ pdfUrl }: { pdfUrl: string }) {
    const { setPdfTrigger } = useAiInsightsStore();

    useEffect(() => {
        setPdfTrigger((page, phrase) => {
            // Construct basic URL
            let url = `${pdfUrl}#page=${page}`;
            // Note: 'phrase' highlighting support depends on the viewer capabilities.
            // Standard browser text fragment: #:~:text=phrase
            // But this only works for HTML or potentially browser-native PDF viewer if supported.
            // We will try adding it.
            // if (phrase) {
            //    url += `&text=${encodeURIComponent(phrase)}`;
            // }
            // Actually, opening a new tab is the safest "Navigation" that works everywhere.
            // Is there a way to trigger the existing PDF display? 
            // We assume the user wants to OPEN the pdf.
            window.open(url, "_blank");
        });
    }, [pdfUrl, setPdfTrigger]);

    return null;
}
