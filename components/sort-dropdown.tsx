"use client";

type SortOption = 
  | "Newest to Oldest"
  | "Oldest to Newest"
  | "Most Relevant"
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
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(e.target.value as SortOption);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label className="text-sm font-medium text-gray-700">SORT BY:</label>
      <select
        value={value}
        onChange={handleChange}
        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-[#6b0504] focus:outline-none focus:ring-1 focus:ring-[#6b0504]"
      >
        <option>Newest to Oldest</option>
        <option>Oldest to Newest</option>
        <option>Most Relevant</option>
        <option>Title A-Z</option>
        <option>Title Z-A</option>
      </select>
    </div>
  );
}

export default SortDropdown;

