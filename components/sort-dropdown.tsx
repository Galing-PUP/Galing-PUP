"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type SortOption =
  | "Newest to Oldest"
  | "Oldest to Newest"
  | "Title A-Z"
  | "Title Z-A";

type SortDropdownProps = {
  value?: SortOption;
  onChange?: (value: SortOption) => void;
  className?: string;
};

export function SortDropdown({
  value = "Newest to Oldest",
  onChange,
  className = "",
}: SortDropdownProps) {
  const handleValueChange = (newValue: string) => {
    if (onChange) {
      onChange(newValue as SortOption);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Label className="text-sm font-medium text-muted-foreground uppercase whitespace-nowrap">Sort by:</Label>
      <Select value={value} onValueChange={handleValueChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Newest to Oldest">Newest to Oldest</SelectItem>
          <SelectItem value="Oldest to Newest">Oldest to Newest</SelectItem>
          <SelectItem value="Title A-Z">Title A-Z</SelectItem>
          <SelectItem value="Title Z-A">Title Z-A</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export default SortDropdown;
