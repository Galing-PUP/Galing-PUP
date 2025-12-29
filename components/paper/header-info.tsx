type HeaderInfoProps = {
  title: string;
  authors: string[];
  documentType: string;
  yearPublished: string;
  courseName: string;
};

export function HeaderInfo({
  title,
  authors,
  documentType,
  yearPublished,
  courseName,
}: HeaderInfoProps) {
  return (
    <div className="space-y-4">
      {/* Tags */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-pup-maroon px-3 py-1 text-xs font-medium text-white">
          {documentType}
        </span>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
          {yearPublished}
        </span>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
          {courseName}
        </span>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>

      {/* Authors */}
      <p className="text-md text-gray-600">{authors.join(", ")}</p>
    </div>
  );
}
