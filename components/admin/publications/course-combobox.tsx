"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { colleges, courses } from "@/data/collegeCourses";

interface CourseComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

/**
 * A searchable combobox for selecting courses, grouped by college/department.
 * Colleges are displayed as non-selectable headers, courses are selectable items.
 */
export function CourseCombobox({
  value,
  onValueChange,
  disabled = false,
}: CourseComboboxProps) {
  const [open, setOpen] = React.useState(false);

  // Find the selected course to display its label
  const selectedCourse = courses.find((course) => String(course.id) === value);

  // Group courses by college
  const coursesByCollege = colleges.map((college) => ({
    college,
    courses: courses.filter((course) => course.collegeId === college.id),
  }));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between text-sm font-normal"
        >
          {selectedCourse
            ? `${selectedCourse.courseAbbr} - ${selectedCourse.courseName}`
            : "Select course..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search courses..."
            className="h-9 text-sm"
          />
          <CommandList>
            <CommandEmpty>No course found.</CommandEmpty>
            {coursesByCollege.map(
              ({ college, courses: collegeCourses }) =>
                collegeCourses.length > 0 && (
                  <CommandGroup
                    key={college.id}
                    heading={`${college.collegeAbbr} - ${college.collegeName}`}
                  >
                    {collegeCourses.map((course) => (
                      <CommandItem
                        key={course.id}
                        value={`${course.courseAbbr} ${course.courseName}`}
                        onSelect={() => {
                          onValueChange(String(course.id));
                          setOpen(false);
                        }}
                        className="text-sm"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === String(course.id)
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {course.courseAbbr} - {course.courseName}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
