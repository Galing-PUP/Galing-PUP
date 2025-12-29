"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Lock } from "lucide-react";

export function AiInsights() {
  const router = useRouter();

  const handleUpgrade = useCallback(() => {
    // Navigate to the pricing page when user clicks the upgrade button
    router.push("/pricing");
  }, [router]);

  return (
    <div className="rounded-lg border-l-4 border-purple-600 bg-purple-50 p-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-purple-700" />
        <h3
          id="ai-insights-heading"
          className="text-lg font-semibold text-gray-900"
        >
          AI Insights
        </h3>
        <span className="rounded-full bg-purple-700 px-2 py-0.5 text-xs font-bold text-white">
          Premium
        </span>
      </div>
      <p className="mt-1 text-sm text-purple-800">
        Advanced analysis and key trends
      </p>

      <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
        <Lock className="mx-auto h-8 w-8 text-gray-400" />
        <p className="mt-2 text-sm text-gray-500">
          Unlock detailed AI-powered insights, trend analysis, and research
          connections.
        </p>
        <button
          type="button"
          onClick={handleUpgrade}
          className="mt-4 rounded-lg bg-pup-maroon px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-pup-maroon/80 focus:outline-none focus:ring-2 focus:ring-pup-maroon focus:ring-offset-2"
        >
          Upgrade to Premium
        </button>
      </div>
    </div>
  );
}
