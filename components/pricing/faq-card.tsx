'use client'

interface FAQCardProps {
  question: string
  answer: string
}

export function FAQCard({ question, answer }: FAQCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">{question}</h3>
      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{answer}</p>
    </div>
  )
}
