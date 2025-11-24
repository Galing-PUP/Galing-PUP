interface VisibilityToggleProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function VisibilityToggle({ value, onChange }: VisibilityToggleProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Visibility
      </label>
      <div className="flex border border-gray-300 rounded-md overflow-hidden h-10">
        <label
          className={`flex-1 flex items-center justify-center gap-3 cursor-pointer transition-colors ${
            value === "public" ? "bg-red-100" : "bg-white hover:bg-gray-50"
          }`}
        >
          <input
            type="radio"
            name="visibility"
            value="public"
            checked={value === "public"}
            onChange={onChange}
            className="sr-only"
          />
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              value === "public" ? "border-[#800000]" : "border-gray-400"
            }`}
          >
            {value === "public" && (
              <div className="w-3 h-3 rounded-full bg-[#800000]" />
            )}
          </div>
          <span className="text-sm font-medium text-gray-700">Public</span>
        </label>
        <div className="w-px bg-gray-300" />
        <label
          className={`flex-1 flex items-center justify-center gap-3 cursor-pointer transition-colors ${
            value === "restricted" ? "bg-red-100" : "bg-white hover:bg-gray-50"
          }`}
        >
          <input
            type="radio"
            name="visibility"
            value="restricted"
            checked={value === "restricted"}
            onChange={onChange}
            className="sr-only"
          />
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              value === "restricted" ? "border-[#800000]" : "border-gray-400"
            }`}
          >
            {value === "restricted" && (
              <div className="w-3 h-3 rounded-full bg-[#800000]" />
            )}
          </div>
          <span className="text-sm font-medium text-gray-700">Restricted</span>
        </label>
      </div>
    </div>
  );
}
