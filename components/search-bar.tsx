'use client'

type SearchBarSize = 'sm' | 'md' | 'lg' | 'xl'

type SearchBarProps = {
  className?: string
  placeholder?: string
  /** Text shown inside the button (default: "Search") */
  buttonText?: string
  size?: SearchBarSize
  /** Optional controlled value for the input */
  value?: string
  /** Called whenever the input text changes */
  onChange?: (value: string) => void
  /** Called when the user submits the search (button click or Enter) */
  onSubmit?: () => void
}

function getSizeConfig(size: SearchBarSize) {
  switch (size) {
    case 'sm':
      return {
        inputPadding: 'px-3 py-3',
        inputText: 'text-sm',
        buttonPadding: 'px-5 py-2.5',
        buttonText: 'text-sm',
        icon: { w: 20, h: 20 },
      }
    case 'lg':
      return {
        inputPadding: 'px-5 py-6',
        inputText: 'text-lg md:text-xl',
        buttonPadding: 'px-10 py-5',
        buttonText: 'text-lg',
        icon: { w: 28, h: 28 },
      }
    case 'xl':
      return {
        inputPadding: 'px-6 py-7',
        inputText: 'text-xl',
        buttonPadding: 'px-12 py-6',
        buttonText: 'text-xl',
        icon: { w: 32, h: 32 },
      }
    case 'md':
    default:
      return {
        inputPadding: 'px-4 py-5',
        inputText: 'text-base md:text-lg',
        buttonPadding: 'px-8 py-4',
        buttonText: 'text-base',
        icon: { w: 24, h: 24 },
      }
  }
}

export function SearchBar({
  className = '',
  placeholder = 'Search by title, author, keywords...',
  buttonText = 'Search',
  size = 'md',
  value,
  onChange,
  onSubmit,
}: SearchBarProps) {
  const cfg = getSizeConfig(size)

  return (
    <div className={`w-full ${className}`} role="search">
      <div className="flex items-stretch rounded-full border border-pup-maroon shadow-sm">
        <div className="flex items-center pl-8 pr-3">
          <svg
            width={cfg.icon.w}
            height={cfg.icon.h}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </svg>
        </div>
        <input
          type="text"
          placeholder={placeholder}
          className={`w-full rounded-l-full bg-white ${cfg.inputPadding} ${cfg.inputText} text-black placeholder:text-gray focus:outline-none`}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSubmit?.()
            }
          }}
        />
        <button
          type="button"
          className={`m-2 rounded-full bg-pup-maroon ${cfg.buttonPadding} ${cfg.buttonText} font-semibold text-white transition-colors hover:bg-pup-maroon/80`}
          onClick={onSubmit}
        >
          {buttonText}
        </button>
      </div>
    </div>
  )
}

export default SearchBar
