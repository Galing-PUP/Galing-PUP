"use client";

import { Crown } from "lucide-react";

interface ComparisonFeature {
  name: string;
  free: string | boolean;
  premium: string | boolean;
}

interface FeatureComparisonTableProps {
  features: ComparisonFeature[];
}

export function FeatureComparisonTable({
  features,
}: FeatureComparisonTableProps) {
  const renderCell = (value: string | boolean, isPremium: boolean = false) => {
    if (typeof value === "boolean") {
      return value ? (
        <span
          className={`text-2xl ${
            isPremium ? "text-red-900" : "text-green-600"
          }`}
        >
          ✓
        </span>
      ) : (
        <span className="text-2xl text-gray-300">✗</span>
      );
    }

    // Handle "Unlimited" badge
    if (value.toLowerCase() === "unlimited") {
      return (
        <span className="inline-block bg-red-900 text-white text-sm font-semibold px-4 py-1 rounded-full">
          Unlimited
        </span>
      );
    }

    // Handle "None" badge
    if (value.toLowerCase() === "none") {
      return (
        <span className="inline-block border-2 border-green-600 text-green-600 text-sm font-semibold px-4 py-1 rounded-full">
          None
        </span>
      );
    }

    return <span className="text-gray-700">{value}</span>;
  };

  return (
    <div className="w-full max-w-5xl bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Table Header */}
      <div className="grid grid-cols-3 border-b border-gray-200">
        <div className="p-6 font-bold text-gray-900 text-lg">Feature</div>
        <div className="p-6 font-bold text-gray-900 text-lg text-center border-l border-gray-200">
          Free
        </div>
        <div className="p-6 font-bold text-gray-900 text-lg text-center bg-yellow-50 border-l border-gray-200 flex items-center justify-center gap-2">
          <Crown className="w-5 h-5 text-yellow-600" />
          Premium
        </div>
      </div>

      {/* Table Rows */}
      {features.map((feature, index) => (
        <div
          key={index}
          className={`grid grid-cols-3 ${
            index !== features.length - 1 ? "border-b border-gray-200" : ""
          }`}
        >
          <div className="p-6 text-gray-700 font-medium">{feature.name}</div>
          <div className="p-6 text-center border-l border-gray-200 flex items-center justify-center">
            {renderCell(feature.free)}
          </div>
          <div className="p-6 text-center bg-yellow-50 border-l border-gray-200 flex items-center justify-center">
            {renderCell(feature.premium, true)}
          </div>
        </div>
      ))}
    </div>
  );
}
