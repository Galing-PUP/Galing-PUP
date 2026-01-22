'use client'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Loader2, Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type SearchBarSize = 'sm' | 'md' | 'lg' | 'xl'

type SearchBarProps = {
  className?: string
  placeholder?: string
  buttonText?: string
  size?: SearchBarSize
  value?: string
  onChange?: (value: string) => void
  onSubmit?: () => void
  suggestions?: { id: number; title: string }[]
  loadingSuggestions?: boolean
  showSuggestions?: boolean
  emptySuggestionsLabel?: string
  onSelectSuggestion?: (item: { id: number; title: string }) => void
}

const DEBOUNCE_MS = 300

/**
 * Returns padding and typography scale for the search bar by size.
 */
function getSizeConfig(size: SearchBarSize) {
  switch (size) {
    case 'sm':
      return {
        inputPadding: 'px-3 py-2.5',
        inputText: 'text-sm',
        buttonPadding: 'px-4 py-2.5',
        buttonText: 'text-sm',
        icon: 18,
      }
    case 'lg':
      return {
        inputPadding: 'px-4 py-4',
        inputText: 'text-lg md:text-xl',
        buttonPadding: 'px-8 py-4',
        buttonText: 'text-lg',
        icon: 26,
      }
    case 'xl':
      return {
        inputPadding: 'px-5 py-5',
        inputText: 'text-xl',
        buttonPadding: 'px-9 py-5',
        buttonText: 'text-xl',
        icon: 30,
      }
    case 'md':
    default:
      return {
        inputPadding: 'px-4 py-3.5',
        inputText: 'text-base md:text-lg',
        buttonPadding: 'px-6 py-3.5',
        buttonText: 'text-base',
        icon: 22,
      }
  }
}

/**
 * Accessible search bar with shadcn/ui primitives and debounced change events.
 */
export function SearchBar({
  className = '',
  placeholder = 'Search by title, author, keywords...',
  buttonText = 'Search',
  size = 'md',
  value,
  onChange,
  onSubmit,
  suggestions = [],
  loadingSuggestions = false,
  showSuggestions = true,
  emptySuggestionsLabel = 'No matches found',
  onSelectSuggestion,
}: SearchBarProps) {
  const cfg = getSizeConfig(size)
  const [inputValue, setInputValue] = useState(value ?? '')
  const [open, setOpen] = useState(false)
  const blurTimeout = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (value !== undefined && value !== inputValue) {
      setInputValue(value)
    }
  }, [value])

  // Debounce outbound onChange to limit API calls from parents
  useEffect(() => {
    const handle = setTimeout(() => {
      onChange?.(inputValue)
    }, DEBOUNCE_MS)

    return () => clearTimeout(handle)
  }, [inputValue, onChange])

  const handleSubmit = () => {
    onChange?.(inputValue)
    onSubmit?.()
  }

  const handleFocus = () => {
    if (blurTimeout.current) {
      clearTimeout(blurTimeout.current)
    }
    setOpen(true)
  }

  const handleBlur = () => {
    blurTimeout.current = setTimeout(() => setOpen(false), 120)
  }

  return (
    <form
      role="search"
      aria-label="Search studies"
      className={`relative w-full ${className}`}
      onSubmit={(event) => {
        event.preventDefault()
        handleSubmit()
      }}
    >
      <div className="flex items-center gap-3 rounded-full border border-pup-maroon/70 bg-white px-3 py-2 shadow-sm">
        <span
          aria-hidden
          className="flex items-center justify-center rounded-full bg-pup-maroon/10 p-2 text-pup-maroon"
        >
          <Search size={cfg.icon} strokeWidth={2} />
        </span>
        <Input
          type="search"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          placeholder={placeholder}
          aria-label="Search by title, author, or keywords"
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-expanded={open}
          className={`h-auto flex-1 border-none bg-transparent ${cfg.inputPadding} ${cfg.inputText} text-black placeholder:text-gray-500 focus-visible:ring-0 focus:outline-none`}
        />
        <Button
          type="submit"
          className={`rounded-full bg-pup-maroon ${cfg.buttonPadding} ${cfg.buttonText} font-semibold text-white transition-colors hover:bg-pup-maroon/85`}
          aria-label="Submit search"
        >
          {buttonText}
        </Button>
      </div>

      {showSuggestions && open && inputValue.trim().length > 0 && (
        <div className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
          <Command shouldFilter={false}>
            <CommandList className="max-h-72">
              {loadingSuggestions ? (
                <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching…
                </div>
              ) : suggestions.length === 0 ? (
                <CommandEmpty className="px-4 py-3 text-sm text-gray-600">
                  {emptySuggestionsLabel}
                </CommandEmpty>
              ) : (
                <CommandGroup heading="Suggestions">
                  {suggestions.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={item.title}
                      onSelect={() => {
                        onSelectSuggestion?.(item)
                        setOpen(false)
                      }}
                      className="cursor-pointer"
                    >
                      {item.title}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </form>
  )
}

export default SearchBar
