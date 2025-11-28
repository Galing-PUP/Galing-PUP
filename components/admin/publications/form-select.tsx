interface FormSelectOption {
  value: string;
  label: string;
}

interface FormSelectProps {
  label: string;
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder: string;
  options: FormSelectOption[];
  required?: boolean;
}

export function FormSelect({
  label,
  id,
  name,
  value,
  onChange,
  placeholder,
  options,
  required = true,
}: FormSelectProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent bg-white appearance-none"
          style={
            {
              "--tw-ring-color": "#4B5563",
            } as React.CSSProperties
          }
          required={required}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-0 top-0 h-full w-12 bg-red-100 border-l border-gray-300 rounded-r-md pointer-events-none flex items-center justify-center">
          <svg
            className="w-4 h-4 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
