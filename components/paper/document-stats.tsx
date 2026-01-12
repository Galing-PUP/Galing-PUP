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
    <Icon className="h-6 w-6 shrink-0 text-gray-500" />
    <div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  </div>
);

type DocumentStatsProps = {
  downloads: number;
  citations: number;
};

export function DocumentStats({ downloads, citations }: DocumentStatsProps) {
  return (
    <section className="grid grid-cols-2 gap-4">
      <StatCard
        icon={Download}
        value={downloads.toLocaleString()}
        label="Downloads"
      />
      <StatCard
        icon={Eye}
        value={citations.toLocaleString()}
        label="Citations"
      />
    </section>
  );
}
