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

export function DocumentInfo() {
  return (
    <section className="rounded-lg border border-gray-200 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">
        Document Information
      </h2>
      <div className="mt-4 space-y-4">
        <InfoItem icon={Calendar} label="Year Published" value="2024" />
        <InfoItem icon={MapPin} label="Campus" value="Main Campus - Sta. Mesa" />
        <InfoItem
          icon={Building2}
          label="Department"
          value="Department of Computer Science"
        />
        <InfoItem icon={User} label="Advisor" value="Dr. Roberto Hernandez" />
        
        <hr className="border-gray-200" />

        <InfoItem icon={FileText} label="Pages" value="156" />
      </div>
    </section>
  );
}
