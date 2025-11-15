import { Download, Library, Quote, Share2, Share } from "lucide-react";
import React from "react";

// Reusable internal button component (no change)
const ActionButton = ({
  icon: Icon,
  label,
  primary = false,
}: {
  icon: React.ElementType;
  label: string;
  primary?: boolean;
}) => (
  <button
    type="button"
    className={`
      flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium
      ${
        primary
          ? "border-transparent bg-red-700 text-white shadow-sm hover:bg-red-800"
          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
      }
      focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
    `}
  >
    <Icon className="h-4 w-4" />
    <span>{label}</span>
  </button>
);

export function ActionButtons() {
  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ActionButton icon={Download} label="Download PDF" primary />
        <ActionButton icon={Library} label="Add to Library" />
        <ActionButton icon={Quote} label="Generate Citation" />
        <ActionButton icon={Share2} label="Share" />
      </div>
      {/* Standalone Share icon from image */}
      <div className="mt-4 flex justify-center">
        <button
          type="button"
          className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          aria-label="Share"
        >
          <Share className="h-5 w-5" />
        </button>
      </div>
    </>
  );
}
