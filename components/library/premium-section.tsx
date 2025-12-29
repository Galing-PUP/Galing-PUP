"use client";

import Link from "next/link";
import { Crown, Check } from "lucide-react";

export function PremiumSection() {
  return (
    <div className="rounded-lg bg-pup-maroon p-8 text-white">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <Crown className="h-8 w-8 text-pup-gold-light" />
            <h2 className="text-2xl font-bold">Unlock Unlimited Bookmarks</h2>
          </div>
          <p className="text-gray-200">
            Upgrade to Premium and save unlimited documents, get unlimited downloads,
            generate unlimited citations, and access AI-powered insights.
          </p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-pup-gold-light">
                <Check className="h-3 w-3 text-black" />
              </div>
              <span>Unlimited bookmarks and downloads</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-pup-gold-light">
                <Check className="h-3 w-3 text-black" />
              </div>
              <span>No advertisements</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-pup-gold-light">
                <Check className="h-3 w-3 text-black" />
              </div>
              <span>Full access to AI-generated insights</span>
            </li>
          </ul>
        </div>
        <div className="lg:shrink-0">
          <Link
            href="/pricing"
            className="flex items-center justify-center gap-2 rounded-lg bg-pup-gold-light px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-pup-gold-light/80 transition-colors"
          >
            <Crown className="h-5 w-5" />
            <span>Upgrade Now</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

