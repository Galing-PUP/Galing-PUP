type AbstractProps = {
  text: string
}

export function Abstract({ text }: AbstractProps) {
  return (
    <div className="space-y-3">
      <h2 id="abstract-heading" className="text-xl font-semibold text-gray-900">
        Abstract
      </h2>
      <p className="leading-relaxed text-gray-700">{text}</p>
    </div>
  )
}
