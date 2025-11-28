interface FormFileUploadProps {
  label: string;
  id: string;
  name: string;
  file: File | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  accept?: string;
  required?: boolean;
}

export function FormFileUpload({
  label,
  id,
  name,
  file,
  onChange,
  accept = ".pdf,.doc,.docx",
  required = true,
}: FormFileUploadProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {label}
      </label>
      <div className="flex items-center gap-4">
        <label
          htmlFor={id}
          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md cursor-pointer hover:bg-gray-200 transition-colors border border-gray-300"
        >
          Upload File
        </label>
        <input
          type="file"
          id={id}
          name={name}
          onChange={onChange}
          className="hidden"
          accept={accept}
          required={required}
        />
        <div className="flex-1 px-4 py-2 border border-gray-300 rounded-md">
          <span className="text-sm text-gray-500">
            {file ? file.name : "No file chosen"}
          </span>
        </div>
      </div>
    </div>
  );
}
