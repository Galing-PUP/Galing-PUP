'use client'

import type React from 'react'

interface BenefitCardProps {
  icon: React.ReactNode
  title: string
  description: string
  iconBgColor?: string
  iconColor?: string
}

export function BenefitCard({
  icon,
  title,
  description,
  iconBgColor = 'bg-pup-maroon',
  iconColor = 'text-white',
}: BenefitCardProps) {
  return (
    <div className="flex flex-col items-center text-center p-4 sm:p-6 md:p-8 bg-white rounded-2xl border border-gray-200 transition-all duration-300 hover:shadow-lg">
      {/* Icon */}
      <div
        className={`${iconBgColor} ${iconColor} w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-4 sm:mb-6`}
      >
        <span className="text-xl sm:text-2xl">{icon}</span>
      </div>

      {/* Title */}
      <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-3 sm:mb-4">{title}</h3>

      {/* Description */}
      <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{description}</p>
    </div>
  )
}
