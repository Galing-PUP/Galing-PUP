interface FormDatePickerProps {
  label: string;
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

export function FormDatePicker({
  label,
  id,
  name,
  value,
  onChange,
  required = true,
}: FormDatePickerProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {label}
      </label>
      <div className="relative">
        <input
          type="date"
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent scheme-light [&::-webkit-calendar-picker-indicator]:opacity-0"
          style={
            {
              "--tw-ring-color": "#4B5563",
            } as React.CSSProperties
          }
          required={required}
        />
        <div className="absolute right-0 top-0 h-full w-12 bg-red-100 border-l border-gray-300 rounded-r-md pointer-events-none flex items-center justify-center">
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
