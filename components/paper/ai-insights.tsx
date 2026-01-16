"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Lock, FileText } from "lucide-react";
import { ShineBorder } from "@/components/ui/shine-border";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css"; // Ensure you can import CSS like this, or add to globals.css

interface AiInsightsProps {
  documentId: number;
}

export function AiInsights({ documentId }: AiInsightsProps) {
  const router = useRouter();
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    async function fetchSummary() {
      try {
        setLoading(true);
        const res = await fetch(`/api/ai/summary/${documentId}`);

        if (res.status === 403) {
          setIsLocked(true);
          setLoading(false);
          return;
        }

        if (res.ok) {
          const data = await res.json();
          setSummary(data.summary);
        }
      } catch (error) {
        console.error("Failed to fetch summary", error);
      } finally {
        setLoading(false);
      }
    }

    if (documentId) {
      fetchSummary();
    }
  }, [documentId]);

  const handleUpgrade = useCallback(() => {
    router.push("/pricing");
  }, [router]);

  return (
    <div className="relative overflow-hidden rounded-lg bg-white shadow-sm border border-gray-100">
      {isLocked && (
        <ShineBorder
          className="text-center text-2xl font-bold capitalize"
          shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
          borderWidth={2}
        />
      )}

      <div className="relative z-10 flex flex-col items-start p-6">
        <div className="flex w-full items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-pup-maroon" />
          <h3
            id="ai-insights-heading"
            className="text-lg font-bold text-pup-maroon"
          >
            AI Insights
          </h3>
          <span className="rounded-full bg-pup-maroon px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
            {isLocked ? "Premium" : "Unlocked"}
          </span>
        </div>

        {loading ? (
          <div className="w-full space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[80%]" />
          </div>
        ) : isLocked ? (
          <>
            <p className="mt-1 text-sm text-gray-500">
              Advanced analysis and key trends
            </p>

            <div className="mt-6 w-full rounded-lg bg-gray-50 p-8 text-center">
              <Lock className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="mx-auto max-w-md text-sm font-medium text-gray-500">
                Unlock detailed AI-powered insights, trend analysis, and research
                connections.
              </p>
              <button
                type="button"
                onClick={handleUpgrade}
                className="mt-4 rounded-md bg-pup-maroon px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-pup-maroon/90 focus:outline-none focus:ring-2 focus:ring-pup-maroon focus:ring-offset-2"
              >
                Upgrade to Premium
              </button>
            </div>
          </>
        ) : (
          <div className="w-full prose prose-sm max-w-none text-gray-700 prose-p:leading-relaxed prose-pre:p-0">
            {summary ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  p: ({ node, ...props }) => <p className="mb-4 last:mb-0" {...props} />,
                  h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mb-4 mt-6 text-pup-maroon" {...props} />,
                  h2: ({ node, ...props }) => <h2 className="text-xl font-bold mb-3 mt-5 text-gray-800" {...props} />,
                  h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mb-2 mt-4 text-gray-800" {...props} />,
                  strong: ({ node, ...props }) => <strong className="font-bold text-gray-900" {...props} />,
                  em: ({ node, ...props }) => <em className="italic" {...props} />,
                  blockquote: ({ node, ...props }) => (
                    <blockquote className="border-l-4 border-pup-maroon/20 pl-4 py-1 my-4 bg-gray-50 italic text-gray-700" {...props} />
                  ),
                  a: ({ node, ...props }) => (
                    <a target="_blank" rel="noopener noreferrer" className="text-pup-maroon hover:underline" {...props} />
                  ),
                  ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-1" {...props} />,
                  li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                  code: ({ node, ...props }) => (
                    <code className="bg-gray-100 rounded px-1.5 py-0.5 text-sm font-mono text-pup-maroon" {...props} />
                  ),
                }}
              >
                {summary}
              </ReactMarkdown>
            ) : (
              <p className="text-gray-500 italic">No AI summary generated for this document yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}