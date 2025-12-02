import {
  Calendar,
  MapPin,
  User,
  FileText,
  Building2,
} from "lucide-react";
import React from "react";

// Reusable internal list item component
const InfoItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-3">
    <Icon className="h-5 w-5 flex-shrink-0 text-gray-500" aria-hidden="true" />
    <div>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="font-medium text-gray-900">{value}</div>
    </div>
  </div>
);

type DocumentInfoProps = {
  yearPublished: string;
  campus: string;
  department: string;
  advisor?: string | null;
  pages?: number | null;
};

export function DocumentInfo({
  yearPublished,
  campus,
  department,
  advisor,
  pages,
}: DocumentInfoProps) {
  return (
    <section className="rounded-lg border border-gray-200 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">
        Document Information
      </h2>
      <div className="mt-4 space-y-4">
        <InfoItem icon={Calendar} label="Year Published" value={yearPublished} />
        <InfoItem icon={MapPin} label="Campus" value={campus} />
        <InfoItem
          icon={Building2}
          label="Department"
          value={department}
        />
        {advisor && (
          <InfoItem icon={User} label="Advisor" value={advisor} />
        )}

        <hr className="border-gray-200" />

        {pages != null && (
          <InfoItem icon={FileText} label="Pages" value={pages.toString()} />
        )}
      </div>
    </section>
  );
}
