"use client";

interface FAQCardProps {
  question: string;
  answer: string;
}

export function FAQCard({ question, answer }: FAQCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">
        {question}
      </h3>
      <p className="text-gray-600 leading-relaxed">
        {answer}
      </p>
    </div>
  );
}
