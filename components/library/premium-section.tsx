"use client";

import Link from "next/link";
import { Crown, Check } from "lucide-react";

export function PremiumSection() {
  return (
    <div className="rounded-lg bg-[#6b0504] p-8 text-white">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <Crown className="h-8 w-8 text-yellow-400" />
            <h2 className="text-2xl font-bold">Unlock Higher Bookmark Limits</h2>
          </div>
          <p className="text-gray-200">
            Upgrade to Premium and unlock higher bookmark limits, get unlimited downloads,
            generate unlimited citations, and access AI-powered insights.
          </p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400">
                <Check className="h-3 w-3 text-[#6b0504]" />
              </div>
              <span>Higher bookmarks and daily download limits</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400">
                <Check className="h-3 w-3 text-[#6b0504]" />
              </div>
              <span>No advertisements</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400">
                <Check className="h-3 w-3 text-[#6b0504]" />
              </div>
              <span>Full access to AI-generated insights</span>
            </li>
          </ul>
        </div>
        <div className="lg:flex-shrink-0">
          <Link
            href="/pricing"
            className="flex items-center justify-center gap-2 rounded-lg bg-yellow-400 px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-yellow-500 transition-colors"
          >
            <Crown className="h-5 w-5" />
            <span>Upgrade Now</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

