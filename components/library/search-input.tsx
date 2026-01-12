"use client";

import { useId } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LibrarySearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

export function LibrarySearchInput({
  value,
  onChange,
  placeholder = "Search your bookmarks...",
  className = "",
  disabled = false,
}: LibrarySearchInputProps) {
  const id = useId();

  return (
    <div className={`w-full space-y-2 ${className} ${disabled ? "opacity-50" : ""}`}>
      <Label htmlFor={id} className="sr-only">
        Search bookmarks
      </Label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 text-gray-400 peer-disabled:opacity-50">
          <Search className="h-5 w-5" />
          <span className="sr-only">Search</span>
        </div>
        <Input
          id={id}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="peer pl-10 focus:border-yellow-400 focus:ring-yellow-400 disabled:cursor-not-allowed"
          disabled={disabled}
        />
      </div>
    </div>
  );
}
