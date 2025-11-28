"use client";

import { useState } from "react";

type Tab = "Pending" | "Flagged" | "All";

export function ContentTabs() {
  const [activeTab, setActiveTab] = useState<Tab>("Pending");

  const getTabStyle = (tab: Tab) => {
    return activeTab === tab
      ? "border-red-800 bg-red-50 text-red-800"
      : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50";
  };

  return (
    <div className="mt-6 flex items-center space-x-4 border-gray-200 pb-px">
      <button
        onClick={() => setActiveTab("Pending")}
        className={`flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-semibold transition-colors ${getTabStyle(
          "Pending"
        )}`}
      >
        Pending Review
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs text-white">
          34
        </span>
      </button>

      <button
        onClick={() => setActiveTab("Flagged")}
        className={`flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-semibold transition-colors ${getTabStyle(
          "Flagged"
        )}`}
      >
        Flagged Content
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs text-white">
          7
        </span>
      </button>

      <button
        onClick={() => setActiveTab("All")}
        className={`rounded-full border px-5 py-2 text-sm font-semibold transition-colors ${getTabStyle(
          "All"
        )}`}
      >
        All Content
      </button>
    </div>
  );
}
