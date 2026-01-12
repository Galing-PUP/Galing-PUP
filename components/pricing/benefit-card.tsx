"use client";

import type React from "react";

interface BenefitCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconBgColor?: string;
  iconColor?: string;
}

export function BenefitCard({
  icon,
  title,
  description,
  iconBgColor = "bg-pup-maroon",
  iconColor = "text-white",
}: BenefitCardProps) {
  return (
    <div className="flex flex-col items-center text-center p-8 bg-white rounded-2xl border border-gray-200 transition-all duration-300 hover:shadow-lg">
      {/* Icon */}
      <div
        className={`${iconBgColor} ${iconColor} w-16 h-16 rounded-2xl flex items-center justify-center mb-6`}
      >
        <span className="text-2xl">{icon}</span>
      </div>

      {/* Title */}
      <h3 className="text-xl font-extrabold text-gray-900 mb-4">{title}</h3>

      {/* Description */}
      <p className="text-gray-600 text-base leading-relaxed">{description}</p>
    </div>
  );
}
