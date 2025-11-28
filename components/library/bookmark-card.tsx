"use client";

import Link from "next/link";
import { Trash2, Eye, Download } from "lucide-react";
import { useLibrary } from "@/lib/hooks/useLibrary";

type SearchResult = {
  id: number;
  title: string;
  authors: string[];
  additionalAuthors: number;
  field: string;
  date: string;
  abstract: string;
  pdfUrl?: string;
};

type BookmarkCardProps = {
  result: SearchResult;
};

export function BookmarkCard({ result }: BookmarkCardProps) {
  const { removeFromLibrary } = useLibrary();

  const handleRemove = () => {
    removeFromLibrary(result.id);
  };

  // Determine document type from field or title
  const getDocumentType = () => {
    if (result.title.toLowerCase().includes("thesis")) return "Thesis";
    if (result.title.toLowerCase().includes("dissertation")) return "Dissertation";
    return "Research Paper";
  };

  // Extract year from date
  const year = result.date.split(" ")[result.date.split(" ").length - 1];

  return (
    <div className="rounded-lg border-2 border-yellow-400 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        {/* Left Content */}
        <div className="flex-1 space-y-3">
          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#6b0504] px-3 py-1 text-xs font-medium text-white">
              {getDocumentType()}
            </span>
            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-gray-800">
              {year}
            </span>
          </div>

          {/* Title */}
          <Link href={`/paper/${result.id}`}>
            <h3 className="text-lg font-bold text-[#6b0504] hover:text-[#4a0403] transition-colors">
              {result.title}
            </h3>
          </Link>

          {/* Authors and Affiliation */}
          <div className="text-sm text-gray-600">
            <span>By </span>
            {result.authors.map((author, index) => (
              <span key={index}>
                <span className="font-medium">{author}</span>
                {index < result.authors.length - 1 && " • "}
              </span>
            ))}
            {result.additionalAuthors > 0 && (
              <span> • +{result.additionalAuthors} more</span>
            )}
            <span> • {result.field}</span>
          </div>

          {/* Downloads */}
          <p className="text-sm text-gray-500">
            {Math.floor(Math.random() * 1000) + 100} downloads
          </p>
        </div>

        {/* Right Actions */}
        <div className="flex flex-col gap-2 md:flex-shrink-0">
          <button
            onClick={handleRemove}
            type="button"
            className="flex items-center justify-center gap-2 rounded-lg border border-red-500 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>Remove</span>
          </button>
          <Link
            href={`/paper/${result.id}`}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Eye className="h-4 w-4" />
            <span>View Details</span>
          </Link>
          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-lg border-transparent bg-[#6b0504] px-4 py-2 text-sm font-medium text-white hover:bg-[#4a0403] transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </button>
        </div>
      </div>
    </div>
  );
}

