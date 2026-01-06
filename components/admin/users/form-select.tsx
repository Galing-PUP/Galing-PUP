import type { SelectHTMLAttributes } from "react";

type FormSelectProps = {
  label: string;
  children: React.ReactNode;
} & SelectHTMLAttributes<HTMLSelectElement>;

export function FormSelect({ label, children, ...props }: FormSelectProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <select
        {...props}
        className="w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-pup-maroon focus:outline-none focus:ring-1 focus:ring-pup-maroon"
      >
        {children}
      </select>
    </div>
  );
}
