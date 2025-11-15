import { Eye, Download } from "lucide-react";
import React from "react";

// Reusable internal stat card component
const StatCard = ({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ElementType;
  value: string;
  label: string;
}) => (
  <div className="flex flex-1 items-center gap-3 rounded-lg border border-gray-200 p-4">
    <Icon className="h-6 w-6 flex-shrink-0 text-gray-500" />
    <div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  </div>
);

export function DocumentStats() {
  return (
    <section className="grid grid-cols-2 gap-4">
      <StatCard icon={Eye} value="3420" label="Views" />
      <StatCard icon={Download} value="1250" label="Downloads" />
    </section>
  );
}
