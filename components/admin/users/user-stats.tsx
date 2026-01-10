"use client";

import { Users, FileClock } from "lucide-react";
import type { SVGProps } from "react";

type StatCardProps = {
  icon: React.ElementType;
  title: string;
  value: string;
  chart: React.ReactNode;
  iconBgColor: string;
};

const ChartPlaceholder = (props: SVGProps<SVGSVGElement>) => (
  <svg width="80" height="30" viewBox="0 0 80 30" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M0 15L10 10L20 18L30 12L40 20L50 15L60 25L70 20L80 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const StatCard = ({ icon: Icon, title, value, chart, iconBgColor }: StatCardProps) => (
  <div className="flex items-center gap-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
    <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${iconBgColor}`}>
      <Icon className="h-6 w-6 text-red-800" />
    </div>
    <div className="flex-1">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
    <div>{chart}</div>
  </div>
);


export type Stats = {
  freeUsers: number;
  premiumUsers: number;
  pendingRequests: number;
};

export function UserStats({ stats }: { stats: Stats | null }) {
  const { freeUsers, premiumUsers, pendingRequests } = stats || {
    freeUsers: 0,
    premiumUsers: 0,
    pendingRequests: 0,
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      <StatCard icon={Users} title="Free Users" value={freeUsers.toString()} iconBgColor="bg-red-100" chart={<ChartPlaceholder className="text-red-500" />} />
      <StatCard icon={Users} title="Premium Users" value={premiumUsers.toLocaleString()} iconBgColor="bg-blue-100" chart={<ChartPlaceholder className="text-blue-500" />} />
      <StatCard icon={FileClock} title="Pending Approval" value={pendingRequests.toString()} iconBgColor="bg-green-100" chart={<ChartPlaceholder className="text-green-500" />} />
    </div>
  );
}

