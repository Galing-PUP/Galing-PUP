'use client'

import type React from 'react'

import { Check, X } from 'lucide-react'

interface PricingFeature {
  name: string
  included: boolean
}

interface PricingCardProps {
  title: string
  price: number
  currency?: string
  duration?: string
  description: string
  features: PricingFeature[]
  buttonText: string
  onButtonClick?: () => void
  href?: string
  showButton?: boolean
  isRecommended?: boolean
  icon?: React.ReactNode
  borderColor?: string
  buttonColor?: string
  accentColor?: string
  disabled?: boolean
  disableButton?: boolean
  customBadgeText?: string
}

export function PricingCard({
  title,
  price,
  currency = '₱',
  duration = '/forever',
  description,
  features,
  buttonText,
  href,
  showButton = true,
  onButtonClick,
  isRecommended = false,
  icon,
  borderColor = 'border-gray-200',
  buttonColor = 'bg-gray-900',
  accentColor = 'text-green-600',
  disabled = false,
  disableButton = false,
  customBadgeText,
}: PricingCardProps) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl p-8 transition-all duration-300 ${
        isRecommended
          ? `border-4 ${borderColor} shadow-lg`
          : 'border border-gray-200 bg-white'
      } ${!isRecommended ? 'bg-white' : 'bg-white'} ${disabled ? 'opacity-60' : ''}`}
    >
      {/* Recommended/Custom Badge */}
      {isRecommended && (
        <div className="absolute -top-4 right-8 bg-pup-gold-light text-gray-900 font-bold px-4 py-2 rounded-lg text-sm">
          {customBadgeText || 'RECOMMENDED'}
        </div>
      )}

      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          {icon && <span className="text-2xl">{icon}</span>}
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
        </div>

        {/* Price Section */}
        <div className="mt-4 mb-4">
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-bold text-gray-900">
              {currency}
              {price}
            </span>
            <span className="text-gray-600">{duration}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-base">{description}</p>
      </div>

      {/* Features List */}
      <div className="mb-8">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-3">
              {feature.included ? (
                <Check className={`w-5 h-5 shrink-0 ${accentColor}`} />
              ) : (
                <X className="w-5 h-5 shrink-0 text-gray-300" />
              )}
              <span
                className={
                  feature.included
                    ? 'text-gray-900 font-medium'
                    : 'text-gray-400'
                }
              >
                {feature.name}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA Button (optional) */}
      {(showButton ?? true) ? (
        <button
          onClick={() => {
            if (onButtonClick) return onButtonClick()
            if (href) return (window.location.href = href)
          }}
          disabled={disabled || disableButton}
          className={`w-full py-3 px-6 rounded-full font-semibold transition-all duration-300 text-white ${
            disabled || disableButton
              ? 'bg-gray-400 cursor-not-allowed'
              : `${buttonColor} hover:opacity-90 active:scale-95`
          }`}
        >
          {buttonText}
        </button>
      ) : null}
    </div>
  )
}
