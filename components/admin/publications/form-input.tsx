interface FormInputProps {
  label: string;
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
}

export function FormInput({
  label,
  id,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = true,
}: FormInputProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
        style={{ "--tw-ring-color": "#4B5563" } as React.CSSProperties}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}
