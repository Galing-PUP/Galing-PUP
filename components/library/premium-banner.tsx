"use client";

import Link from "next/link";
import { AlertCircle, Crown } from "lucide-react";

type PremiumBannerProps = {
  usedBookmarks: number;
  maxBookmarks: number;
};

export function PremiumBanner({ usedBookmarks, maxBookmarks }: PremiumBannerProps) {
  if (usedBookmarks < maxBookmarks) {
    return null;
  }

  return (
    <div className="rounded-lg bg-pup-gold-light p-4">
      <div className="flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-gray-900" />
        <p className="flex-1 text-sm font-medium text-gray-900">
          You&apos;re using {usedBookmarks} of {maxBookmarks} bookmarks on the Free tier.
        </p>
        <Link
          href="/pricing"
          className="flex items-center gap-2 rounded-lg bg-pup-gold-light px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-pup-gold-light/80 transition-colors"
        >
          <Crown className="h-4 w-4" />
          <span>Upgrade to Premium</span>
        </Link>
      </div>
    </div>
  );
}

