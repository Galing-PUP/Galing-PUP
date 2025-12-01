"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import BackgroundGraphic from "@/assets/Graphics/background-homepage.png";
import LogoDefault from "@/assets/Logo/logo-default.png";
import { SearchBar } from "@/components/search-bar";

type HomeSearchResult = {
  id: number;
  title: string;
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<HomeSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const goToSearchResults = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const params = new URLSearchParams({ q: trimmed });
    router.push(`/browse?${params.toString()}`);
  };

  // Live search under the bar (like instant results)
  useEffect(() => {
    let abort = false;

    const run = async () => {
      const trimmed = query.trim();
      if (!trimmed) {
        setResults([]);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("q", trimmed);
        const url = `/api/browse?${params.toString()}`;

        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Search failed: ${res.status}`);
        }
        const data: HomeSearchResult[] = await res.json();
        if (!abort) {
          setResults(data);
        }
      } catch (e) {
        console.error(e);
        if (!abort) {
          setError("Something went wrong while searching.");
        }
      } finally {
        if (!abort) {
          setLoading(false);
        }
      }
    };

    // Small debounce so we don't fire on every keystroke too aggressively
    const handle = setTimeout(run, 1000);

    return () => {
      abort = true;
      clearTimeout(handle);
    };
  }, [query]);

  return (
    <>
      <Header />
      <div className="relative min-h-screen bg-white">
        <section className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 pt-20 pb-10 md:pt-24 md:pb-12">
          <Image
            src={LogoDefault}
            alt="Galing PUP"
            priority
            className="h-32 w-auto md:h-40"
          />

          <div className="w-full max-w-6xl mt-10">
            <SearchBar
              className="w-full"
              size="md"
              value={query}
              onChange={setQuery}
              onSubmit={goToSearchResults}
            />

            {/* Inline results list */}
            <div className="mt-4">
              {loading && (
                <p className="text-sm text-gray-500">Loading studies...</p>
              )}
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              {!loading && !error && results.length > 0 && (
                <div className="rounded-lg border border-gray-200 bg-white shadow-sm max-h-80 overflow-y-auto">
                  <ul className="divide-y divide-gray-100">
                    {results.map((r) => (
                      <li key={r.id}>
                        <Link
                          href={`/paper/${r.id}`}
                          className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-50"
                        >
                          {r.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            className="mt-8 rounded-full bg-[#6b0504] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#4a0403]"
            onClick={() => {
              // Go to the main search results page showing all studies
              router.push("/browse");
            }}
          >
            <span className="inline-flex items-center gap-2">
              Explore All Studies
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </span>
          </button>
        </section>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[80vh] bg-no-repeat bg-bottom opacity-40"
          style={{
            backgroundImage: `url(${BackgroundGraphic.src})`,
            backgroundPosition: "center calc(100% + 180px)",
            backgroundSize: "125% auto",
          }}
        />
      </div>
    </>
  );
}
