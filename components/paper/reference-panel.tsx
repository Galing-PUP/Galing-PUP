"use client";

import { useAiInsightsStore } from "@/lib/store/ai-insights-store";
import { cn } from "@/lib/utils";
import { BookOpen, MapPin } from "lucide-react";
import { useEffect, useRef } from "react";

export function ReferencePanel() {
    const { summaryData, activeCitationId, setActiveCitationId, triggerPdfView } =
        useAiInsightsStore();
    const listRef = useRef<HTMLUListElement>(null);

    // Auto-scroll to active citation when `activeCitationId` changes
    useEffect(() => {
        if (activeCitationId !== null && listRef.current) {
            // Find the element with the matching index attribute
            const el = listRef.current.querySelector(
                `[data-citation-index="${activeCitationId}"]`
            );
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }
    }, [activeCitationId]);

    if (!summaryData || summaryData.citations.length === 0) return null;

    return (
        <div
            id="ai-reference-panel"
            className="rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 pb-4"
        >
            <div className="border-b border-gray-100 px-4 py-3 bg-gray-50/50 rounded-t-xl">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <BookOpen className="h-4 w-4 text-pup-maroon" />
                    AI Insights References
                </h3>
            </div>

            <ul
                ref={listRef}
                className="max-h-[600px] overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent"
            >
                {summaryData.citations.map((citation, idx) => {
                    // Robust comparison: Ensure both IDs are treated as Numbers to prevent mismatches (e.g. "32" vs 32)
                    const isActive = Number(activeCitationId) === Number(citation.refIndex);

                    return (
                        <li
                            key={`${citation.chunkId}-${idx}`}
                            // Store index as data attribute for the scroll selector
                            data-citation-index={citation.refIndex}
                            onClick={() => {
                                setActiveCitationId(Number(citation.refIndex));
                                triggerPdfView(citation.pageStart, citation.phrase);
                            }}
                            className={cn(
                                "cursor-pointer rounded-lg p-3 transition-all duration-200 text-sm border scroll-mt-24",
                                isActive
                                    ? "bg-pup-maroon/5 border-pup-maroon/30 shadow-sm ring-1 ring-pup-maroon/20"
                                    : "bg-transparent border-transparent hover:bg-gray-50 hover:border-gray-200"
                            )}
                        >
                            <div className="flex items-start gap-3">
                                <span
                                    className={cn(
                                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold mt-0.5 transition-colors duration-200",
                                        isActive
                                            ? "bg-pup-maroon text-white scale-110"
                                            : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                                    )}
                                >
                                    {citation.refIndex}
                                </span>
                                <div className="space-y-1.5">
                                    <p className="text-gray-700 leading-snug">
                                        <span
                                            className={cn(
                                                "transition-colors duration-200",
                                                isActive
                                                    ? "font-semibold text-gray-900 bg-pup-gold/20 px-1 rounded-sm"
                                                    : "text-gray-900"
                                            )}
                                        >
                                            "{citation.phrase}"...
                                        </span>
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <MapPin className="h-3 w-3" />
                                        <span>
                                            Page {citation.pageStart}
                                            {citation.pageEnd > citation.pageStart
                                                ? `-${citation.pageEnd}`
                                                : ""}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}