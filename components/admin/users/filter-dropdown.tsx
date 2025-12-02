"use client";

import { useState, useRef, useEffect } from "react";
import { Filter, Check } from "lucide-react";
import { Button } from "@/components/button";

type FilterOption<T = string> = {
  label: string;
  value: T;
};

type FilterDropdownProps<T = string> = {
  label: string;
  options: FilterOption<T>[];
  selectedValues: T[];
  onChange: (values: T[]) => void;
};

export function FilterDropdown<T extends string = string>({
  label,
  options,
  selectedValues,
  onChange,
}: FilterDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = (value: T) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const displayLabel =
    selectedValues.length > 0
      ? `${label} (${selectedValues.length})`
      : label;

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        shape="rounded"
        size="md"
        icon={<Filter className="h-4 w-4" />}
        iconPosition="left"
        className={`border-gray-300 ${
          selectedValues.length > 0 ? "border-red-800 bg-red-50 text-red-800" : ""
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {displayLabel}
      </Button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">{label}</p>
              {selectedValues.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-red-800 hover:text-red-900 font-medium"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
          <div className="py-2">
            {options.map((option) => {
              const isSelected = selectedValues.includes(option.value);
              return (
                <button
                  key={option.value}
                  onClick={() => handleToggle(option.value)}
                  className="flex w-full items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <span>{option.label}</span>
                  {isSelected && (
                    <Check className="h-4 w-4 text-red-800" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
