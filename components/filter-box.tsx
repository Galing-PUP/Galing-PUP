"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FilterX } from "lucide-react";
import { ResourceTypes } from "@/lib/generated/prisma/enums";
import { formatResourceType } from "@/lib/utils/format";

export type FilterValues = {
  course: string;
  yearRange: "Anytime" | "last3years" | "last5years" | "last10years";
  documentType: ResourceTypes | "All Types";
};

type FilterBoxProps = {
  className?: string;
  /** Visual style variant for the filter box */
  variant?: "pill" | "sidebar";
  /** Notify parent when filters change */
  onChange?: (filters: FilterValues) => void;
  /** Available courses coming from the database */
  courseOptions?: string[];
  /** Whether the filters accordion should be expanded by default */
  defaultExpanded?: boolean;
};

const DEFAULT_FILTERS: FilterValues = {
  course: "All Courses",
  yearRange: "Anytime",
  documentType: "All Types",
};

export function FilterBox({
  className = "",
  variant = "pill",
  onChange,
  courseOptions = [],
  defaultExpanded = false,
}: FilterBoxProps) {
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTERS);

  const updateFilters = (next: FilterValues) => {
    setFilters(next);
    onChange?.(next);
  };

  const handleClearFilters = () => {
    updateFilters(DEFAULT_FILTERS);
  };

  const handleValueChange = (key: keyof FilterValues, value: string) => {
    updateFilters({ ...filters, [key]: value });
  };

  const activeFilterCount = Object.values(filters).filter(
    (value) => !value.startsWith("All") && value !== "Anytime"
  ).length;

  // Sidebar variant: static card with filters always visible (used on browse page)
  if (variant === "sidebar") {
    return (
      <Card
        className={`w-full rounded-2xl border border-pup-maroon/15 bg-white/95 shadow-sm ${className}`}
      >
        <div className="space-y-5 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-pup-maroon">
              Filters
            </span>
            {activeFilterCount > 0 && (
              <span className="ml-2 flex h-5 min-w-[1.6rem] items-center justify-center rounded-full bg-pup-maroon px-1 text-[10px] font-semibold text-white">
                {activeFilterCount}
              </span>
            )}
          </div>

          <div className="h-px w-full bg-pup-maroon/10" />

          {/* Year Range Filter */}
          <div className="space-y-3">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">
              Publication Date
            </Label>
            <RadioGroup
              value={filters.yearRange}
              onValueChange={(value) => handleValueChange("yearRange", value as FilterValues["yearRange"])}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Anytime" id="Anytime" />
                <Label htmlFor="Anytime" className="text-sm font-normal cursor-pointer">
                  Anytime
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="last3years" id="last3years" />
                <Label htmlFor="last3years" className="text-sm font-normal cursor-pointer">
                  Last 3 Years
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="last5years" id="last5years" />
                <Label htmlFor="last5years" className="text-sm font-normal cursor-pointer">
                  Last 5 Years
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="last10years" id="last10years" />
                <Label htmlFor="last10years" className="text-sm font-normal cursor-pointer">
                  Last 10 Years
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Course Filter */}
          <div className="space-y-2">
            <Label
              htmlFor="course-filter"
              className="text-xs font-semibold uppercase text-muted-foreground"
            >
              Course
            </Label>
            <Select
              value={filters.course}
              onValueChange={(value) => handleValueChange("course", value)}
            >
              <SelectTrigger
                id="course-filter"
                className="w-full h-9 rounded-lg border-pup-maroon/20 text-xs"
              >
                <SelectValue placeholder="Select Course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Courses">All Courses</SelectItem>
                {courseOptions.map((course) => (
                  <SelectItem key={course} value={course}>
                    {course}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Document Type Filter */}
          <div className="space-y-2">
            <Label
              htmlFor="type-filter"
              className="text-xs font-semibold uppercase text-muted-foreground"
            >
              Document Type
            </Label>
            <Select
              value={filters.documentType}
              onValueChange={(value) =>
                handleValueChange("documentType", value)
              }
            >
              <SelectTrigger
                id="type-filter"
                className="w-full h-9 rounded-lg border-pup-maroon/20 text-xs"
              >
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Types">All Types</SelectItem>
                {Object.values(ResourceTypes).map((type) => (
                  <SelectItem key={type} value={type}>
                    {formatResourceType(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters Button */}
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="mt-1 w-full h-9 justify-center rounded-full border-pup-maroon/40 text-xs font-medium text-pup-maroon hover:bg-pup-maroon hover:text-white"
            disabled={activeFilterCount === 0}
          >
            <FilterX className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        </div>
      </Card>
    );
  }

  // Pill variant: compact trigger with floating dropdown (used on admin publication page)
  return (
    <Card
      className={`relative inline-block w-full overflow-visible border-none shadow-none bg-transparent ${className}`}
    >
      <Accordion
        type="single"
        collapsible
        defaultValue={defaultExpanded ? "filters" : undefined}
        className="w-full"
      >
        <AccordionItem value="filters" className="border-none">
          <AccordionTrigger className="h-10 min-w-[190px] rounded-full border border-pup-maroon/40 bg-white/80 px-4 py-2 text-sm font-semibold text-pup-maroon shadow-sm hover:no-underline [&[data-state=open]]:text-pup-maroon">
            <span className="flex items-center gap-2">
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-pup-maroon text-xs text-white">
                  {activeFilterCount}
                </span>
              )}
            </span>
          </AccordionTrigger>
          <AccordionContent className="absolute right-0 mt-2 z-40 w-[min(20rem,calc(100vw-3rem))] rounded-2xl border border-pup-maroon/30 bg-white px-4 py-4 shadow-lg">
            <div className="space-y-4">
              {/* Course Filter */}
              <div className="space-y-2">
                <Label
                  htmlFor="course-filter"
                  className="text-xs font-semibold uppercase text-muted-foreground"
                >
                  Course
                </Label>
                <Select
                  value={filters.course}
                  onValueChange={(value) => handleValueChange("course", value)}
                >
                  <SelectTrigger id="course-filter" className="w-full">
                    <SelectValue placeholder="Select Course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Courses">All Courses</SelectItem>
                    {courseOptions.map((course) => (
                      <SelectItem key={course} value={course}>
                        {course}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Year Filter */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">
                  Publication Date
                </Label>
                <RadioGroup
                  value={filters.yearRange}
                  onValueChange={(value) => handleValueChange("yearRange", value as FilterValues["yearRange"])}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Anytime" id="Anytime-pill" />
                    <Label htmlFor="anytime-pill" className="text-sm font-normal cursor-pointer">
                      Anytime
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="last3years" id="last3years-pill" />
                    <Label htmlFor="last3years-pill" className="text-sm font-normal cursor-pointer">
                      Last 3 Years
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="last5years" id="last5years-pill" />
                    <Label htmlFor="last5years-pill" className="text-sm font-normal cursor-pointer">
                      Last 5 Years
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="last10years" id="last10years-pill" />
                    <Label htmlFor="last10years-pill" className="text-sm font-normal cursor-pointer">
                      Last 10 Years
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Document Type Filter */}
              <div className="space-y-2">
                <Label
                  htmlFor="type-filter"
                  className="text-xs font-semibold uppercase text-muted-foreground"
                >
                  Document Type
                </Label>
                <Select
                  value={filters.documentType}
                  onValueChange={(value) =>
                    handleValueChange("documentType", value)
                  }
                >
                  <SelectTrigger id="type-filter" className="w-full">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Types">All Types</SelectItem>
                    {Object.values(ResourceTypes).map((type) => (
                      <SelectItem key={type} value={type}>
                        {formatResourceType(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters Button */}
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="mt-2 w-full border-pup-maroon text-pup-maroon hover:bg-pup-maroon hover:text-white"
                disabled={activeFilterCount === 0}
              >
                <FilterX className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}

export default FilterBox;
