interface FormTextareaProps {
  label: string;
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  rows?: number;
  required?: boolean;
}

export function FormTextarea({
  label,
  id,
  name,
  value,
  onChange,
  placeholder,
  rows = 6,
  required = true,
}: FormTextareaProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent resize-none"
        style={{ "--tw-ring-color": "#4B5563" } as React.CSSProperties}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}
