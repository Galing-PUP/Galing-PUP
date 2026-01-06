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
import { FilterX } from "lucide-react";

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

export function FilterBox({
  className = "",
  onChange,
  courseOptions = [],
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
    (value) => !value.startsWith("All")
  ).length;

  return (
    <Card className={`w-full overflow-hidden border-none shadow-none ${className}`}>
      <Accordion type="single" collapsible defaultValue="filters" className="w-full">
        <AccordionItem value="filters" className="border-none">
          <AccordionTrigger className="px-4 py-2 hover:no-underline [&[data-state=open]]:text-pup-maroon">
            <span className="flex items-center gap-2 text-lg font-semibold text-pup-maroon">
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-pup-maroon text-xs text-white">
                  {activeFilterCount}
                </span>
              )}
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-1 pb-4">
            <div className="space-y-4 px-1">
              {/* Campus Filter */}
              <div className="space-y-2">
                <Label htmlFor="campus-filter" className="text-xs font-semibold uppercase text-muted-foreground">Campus</Label>
                <Select
                  value={filters.campus}
                  onValueChange={(value) => handleValueChange("campus", value)}
                >
                  <SelectTrigger id="campus-filter" className="w-full">
                    <SelectValue placeholder="Select Campus" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Campuses">All Campuses</SelectItem>
                    <SelectItem value="Main Campus">Main Campus</SelectItem>
                    <SelectItem value="Branch Campus 1">Branch Campus 1</SelectItem>
                    <SelectItem value="Branch Campus 2">Branch Campus 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Course Filter */}
              <div className="space-y-2">
                <Label htmlFor="course-filter" className="text-xs font-semibold uppercase text-muted-foreground">Course</Label>
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
              <div className="space-y-2">
                <Label htmlFor="year-filter" className="text-xs font-semibold uppercase text-muted-foreground">Year</Label>
                <Select
                  value={filters.year}
                  onValueChange={(value) => handleValueChange("year", value)}
                >
                  <SelectTrigger id="year-filter" className="w-full">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Years">All Years</SelectItem>
                    {[2025, 2024, 2023, 2022, 2021, 2020].map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Document Type Filter */}
              <div className="space-y-2">
                <Label htmlFor="type-filter" className="text-xs font-semibold uppercase text-muted-foreground">Document Type</Label>
                <Select
                  value={filters.documentType}
                  onValueChange={(value) => handleValueChange("documentType", value)}
                >
                  <SelectTrigger id="type-filter" className="w-full">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Types">All Types</SelectItem>
                    <SelectItem value="Research Paper">Research Paper</SelectItem>
                    <SelectItem value="Thesis">Thesis</SelectItem>
                    <SelectItem value="Dissertation">Dissertation</SelectItem>
                    <SelectItem value="Journal Article">Journal Article</SelectItem>
                    <SelectItem value="Conference Paper">Conference Paper</SelectItem>
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
