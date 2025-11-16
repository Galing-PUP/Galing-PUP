export function HeaderInfo() {
  return (
    <div className="space-y-4">
      {/* Tags */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
          Master's Thesis
        </span>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
          2024
        </span>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
          Computer Science
        </span>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-900">
        Machine Learning Applications in Healthcare Systems: A Comprehensive
        Study
      </h1>

      {/* Authors */}
      <p className="text-md text-gray-600">
        Maria Santos, John Dela Cruz, Ana Garcia
      </p>
    </div>
  );
}
