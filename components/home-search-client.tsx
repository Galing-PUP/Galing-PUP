"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SearchBar } from "@/components/search-bar";

type HomeSearchResult = {
  id: number;
  title: string;
};

type SearchApiResponse = {
  results: HomeSearchResult[];
  pagination: {
    limit: number;
    offset: number;
    total: number | null;
    hasMore?: boolean;
  };
};

export function HomeSearchClient() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<HomeSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const abortControllerRef = useRef<AbortController | null>(null);

  const goToSearchResults = useCallback(() => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const params = new URLSearchParams({ q: trimmed });
    router.push(`/browse?${params.toString()}`);
  }, [query, router]);

  // Debounced search
  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    // Debounce: wait 500ms after user stops typing
    const timeoutId = setTimeout(async () => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set("q", trimmed);
        params.set("limit", "5");
        const url = `/api/browse?${params.toString()}`;

        const res = await fetch(url, { signal: controller.signal });

        if (!res.ok) {
          throw new Error(`Search failed: ${res.status}`);
        }

        const data: SearchApiResponse = await res.json();

        if (!controller.signal.aborted) {
          setResults(data.results);
        }
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") {
          return;
        }
        console.error(e);
        if (!controller.signal.aborted) {
          setError("Something went wrong while searching.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query]);

  return (
    <>
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
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading studies...
          </div>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && !error && results.length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm max-h-80 overflow-y-auto">
            <ul className="divide-y divide-gray-100">
              {results.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/paper/${r.id}`}
                    className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-50 transition-colors"
                  >
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        {!loading && !error && query.trim() && results.length === 0 && (
          <p className="text-sm text-gray-500">No studies found</p>
        )}
      </div>
    </>
  );
}
