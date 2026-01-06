"use client";

import { ArrowDownAZ, ArrowUpAZ, Calendar, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export type LibrarySortOption =
  | "title-asc"
  | "title-desc"
  | "date-newest"
  | "date-oldest"
  | "bookmarked-newest"
  | "bookmarked-oldest";

type SortDropdownProps = {
  value: LibrarySortOption;
  onChange: (value: LibrarySortOption) => void;
};

const sortOptions = [
  {
    value: "title-asc" as LibrarySortOption,
    label: "Title (A-Z)",
    icon: ArrowDownAZ,
    group: "alphabetical",
  },
  {
    value: "title-desc" as LibrarySortOption,
    label: "Title (Z-A)",
    icon: ArrowUpAZ,
    group: "alphabetical",
  },
  {
    value: "date-newest" as LibrarySortOption,
    label: "Publication Date (Newest)",
    icon: Calendar,
    group: "publication",
  },
  {
    value: "date-oldest" as LibrarySortOption,
    label: "Publication Date (Oldest)",
    icon: Calendar,
    group: "publication",
  },
  {
    value: "bookmarked-newest" as LibrarySortOption,
    label: "Recently Bookmarked",
    icon: Clock,
    group: "bookmarked",
  },
  {
    value: "bookmarked-oldest" as LibrarySortOption,
    label: "Oldest Bookmarked",
    icon: Clock,
    group: "bookmarked",
  },
];

export function LibrarySortDropdown({ value, onChange }: SortDropdownProps) {
  const currentOption = sortOptions.find((opt) => opt.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        >
          {currentOption && <currentOption.icon className="h-4 w-4" />}
          <span className="hidden sm:inline">Sort:</span>
          <span className="font-medium">{currentOption?.label || "Sort"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Alphabetical */}
        <DropdownMenuLabel className="text-xs font-normal text-gray-500">
          Alphabetical
        </DropdownMenuLabel>
        {sortOptions
          .filter((opt) => opt.group === "alphabetical")
          .map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onChange(option.value)}
              className={
                value === option.value
                  ? "bg-yellow-50 text-[#6b0504] font-medium"
                  : ""
              }
            >
              <option.icon className="mr-2 h-4 w-4" />
              {option.label}
            </DropdownMenuItem>
          ))}
        
        <DropdownMenuSeparator />
        
        {/* Publication Date */}
        <DropdownMenuLabel className="text-xs font-normal text-gray-500">
          Publication Date
        </DropdownMenuLabel>
        {sortOptions
          .filter((opt) => opt.group === "publication")
          .map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onChange(option.value)}
              className={
                value === option.value
                  ? "bg-yellow-50 text-[#6b0504] font-medium"
                  : ""
              }
            >
              <option.icon className="mr-2 h-4 w-4" />
              {option.label}
            </DropdownMenuItem>
          ))}
        
        <DropdownMenuSeparator />
        
        {/* Bookmarked Date */}
        <DropdownMenuLabel className="text-xs font-normal text-gray-500">
          Bookmarked Date
        </DropdownMenuLabel>
        {sortOptions
          .filter((opt) => opt.group === "bookmarked")
          .map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onChange(option.value)}
              className={
                value === option.value
                  ? "bg-yellow-50 text-[#6b0504] font-medium"
                  : ""
              }
            >
              <option.icon className="mr-2 h-4 w-4" />
              {option.label}
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
