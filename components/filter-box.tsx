"use client";

import { useState } from "react";

export type FilterValues = {
  campus: string;
  course: string;
  year: string;
  documentType: string;
};

type FilterBoxProps = {
  className?: string;
  /** Notify parent when filters change */
  onChange?: (filters: FilterValues) => void;
  /** Available courses coming from the database */
  courseOptions?: string[];
};

const DEFAULT_FILTERS: FilterValues = {
  campus: "All Campuses",
  course: "All Courses",
  year: "All Years",
  documentType: "All Types",
};

export function FilterBox({ className = "", onChange, courseOptions = [] }: FilterBoxProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTERS);

  const updateFilters = (next: FilterValues) => {
    setFilters(next);
    onChange?.(next);
  };

  const handleClearFilters = () => {
    updateFilters(DEFAULT_FILTERS);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Filter Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mb-4 flex w-full items-center justify-between text-left"
      >
        <h2 className="text-lg font-semibold text-[#6b0504]">
          {isExpanded ? "▼" : "▶"} Filters
        </h2>
      </button>

      {isExpanded && (
        <div className="space-y-4">
          {/* Campus Filter */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Campus
            </label>
            <select
              value={filters.campus}
              onChange={(e) =>
                updateFilters({ ...filters, campus: e.target.value })
              }
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-[#6b0504] focus:outline-none focus:ring-1 focus:ring-[#6b0504]"
            >
              <option>All Campuses</option>
              <option>Main Campus</option>
              <option>Branch Campus 1</option>
              <option>Branch Campus 2</option>
            </select>
          </div>

          {/* Course Filter */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Course
            </label>
            <select
              value={filters.course}
              onChange={(e) =>
                updateFilters({ ...filters, course: e.target.value })
              }
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-[#6b0504] focus:outline-none focus:ring-1 focus:ring-[#6b0504]"
            >
              <option>All Courses</option>
              {courseOptions.map((course) => (
                <option key={course}>{course}</option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Year
            </label>
            <select
              value={filters.year}
              onChange={(e) =>
                updateFilters({ ...filters, year: e.target.value })
              }
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-[#6b0504] focus:outline-none focus:ring-1 focus:ring-[#6b0504]"
            >
              <option>All Years</option>
              <option>2025</option>
              <option>2024</option>
              <option>2023</option>
              <option>2022</option>
              <option>2021</option>
              <option>2020</option>
            </select>
          </div>

          {/* Document Type Filter */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Document Type
            </label>
            <select
              value={filters.documentType}
              onChange={(e) =>
                updateFilters({ ...filters, documentType: e.target.value })
              }
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-[#6b0504] focus:outline-none focus:ring-1 focus:ring-[#6b0504]"
            >
              <option>All Types</option>
              <option>Research Paper</option>
              <option>Thesis</option>
              <option>Dissertation</option>
              <option>Journal Article</option>
              <option>Conference Paper</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          <button
            onClick={handleClearFilters}
            className="mt-6 w-full rounded-md border-2 border-[#6b0504] bg-white px-4 py-2 text-sm font-medium text-[#6b0504] transition-colors hover:bg-[#6b0504] hover:text-white"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default FilterBox;

