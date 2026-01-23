'use client'

import BackgroundGraphic from '@/assets/Graphics/background-homepage.png'
import LogoDefault from '@/assets/Logo/logo-default.png'
import { SearchBar } from '@/components/search-bar'
import { ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type HomeSearchResult = {
  id: number
  title: string
}

export default function Home() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<HomeSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const goToSearchResults = () => {
    const trimmed = query.trim()
    if (!trimmed) return
    const params = new URLSearchParams({ q: trimmed })
    router.push(`/browse?${params.toString()}`)
  }

  // Live search under the bar (like instant results)
  useEffect(() => {
    let abort = false

    const run = async () => {
      const trimmed = query.trim()
      if (!trimmed) {
        setResults([])
        setLoading(false)
        setError(null)
        return
      }

      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        params.set('q', trimmed)
        params.set('limit', '5')
        const url = `/api/browse?${params.toString()}`

        const res = await fetch(url)
        if (!res.ok) {
          throw new Error(`Search failed: ${res.status}`)
        }
        const data: { results: HomeSearchResult[] } = await res.json()
        if (!abort) {
          setResults(data.results ?? [])
        }
      } catch (e) {
        console.error(e)
        if (!abort) {
          setError('Something went wrong while searching.')
        }
      } finally {
        if (!abort) {
          setLoading(false)
        }
      }
    }

    // Debounce the search by 1 second
    const handle = setTimeout(run, 1000)

    return () => {
      abort = true
      clearTimeout(handle)
    }
  }, [query])

  return (
    <>
      <div className="relative min-h-screen bg-white">
        <section className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-4 pt-16 pb-8 sm:px-6 md:pt-24 md:pb-12">
          <Image
            src={LogoDefault}
            alt="Galing PUP"
            priority
            className="h-28 w-auto sm:h-32 md:h-40 object-contain"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            width={200}
            height={160}
          />

          <div className="w-full max-w-6xl mt-8 sm:mt-10">
            <SearchBar
              className="w-full"
              size="md"
              value={query}
              onChange={setQuery}
              onSubmit={goToSearchResults}
              suggestions={results}
              loadingSuggestions={loading}
              onSelectSuggestion={(item) => {
                router.push(`/paper/${item.id}`)
              }}
            />

            {/* Inline results list */}
            <div className="mt-4">
              {error && <p className="text-sm text-red-600">{error}</p>}
              {!loading && !error && results.length === 0 && query.trim() && (
                <p className="text-sm text-gray-500">
                  No matching studies yet.
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            className="mt-6 sm:mt-8 rounded-full bg-pup-maroon px-6 py-3 text-sm sm:text-base font-semibold text-white transition-colors hover:bg-pup-maroon/80 active:scale-95"
            onClick={() => {
              // Go to the main search results page showing all studies
              router.push('/browse')
            }}
          >
            <span className="inline-flex items-center gap-2">
              Explore All Studies
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </span>
          </button>
        </section>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[80vh] bg-no-repeat bg-bottom opacity-40"
          style={{
            backgroundImage: `url(${BackgroundGraphic.src})`,
            backgroundPosition: 'center calc(100% + 180px)',
            backgroundSize: '125% auto',
          }}
        />
      </div>
    </>
  )
}
