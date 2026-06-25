"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Search,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Lightbulb,
  RefreshCw,
} from "lucide-react";
import { ResultItem } from "@/components/result-item";
import { ImageGrid } from "@/components/image-grid";
import { NewsCard } from "@/components/news-card";
import { VideoCard } from "@/components/video-card";
import { RelatedSearches } from "@/components/related-searches";
import { InfoCardContainer } from "@/components/info-card-container";
import type { LinkHandlerProvider, LinkHandlerCard } from "@/components/info-card-container";
import {
  ResultListSkeleton,
  ImageGridSkeleton,
  NewsListSkeleton,
  VideoListSkeleton,
  SidebarSkeleton,
} from "@/components/search-skeletons";
import type { SearchResponse } from "@/lib/search";

const RESULTS_PER_PAGE = 10;

interface SearchResultsProps {
  query: string;
  page: number;
  category: string;
}

export function SearchResults({ query, page, category }: SearchResultsProps) {
  const [data, setData] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<LinkHandlerProvider[]>([]);
  const providersFetchedRef = useRef(false);

  // Fetch link handler providers once
  useEffect(() => {
    if (providersFetchedRef.current) return;
    providersFetchedRef.current = true;

    fetch("/api/link-handlers")
      .then((r) => (r.ok ? r.json() : { providers: [] }))
      .then((d) => setProviders(d.providers || []))
      .catch(() => {});
  }, []);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const params = new URLSearchParams({ q: query, page: String(page) });
      if (category && category !== "general" && category !== "search") {
        params.set("category", category);
      }
      const res = await fetch(`/api/search?${params}`);
      const json = await res.json();
      if (!res.ok || json.error) {
        setError(json.error || `Search returned ${res.status}`);
      } else {
        setData(json);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Search engine unreachable");
    } finally {
      setLoading(false);
    }
  }, [query, page, category]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const results = data?.results ?? [];
  const suggestions = data?.suggestions ?? [];
  const corrections = data?.corrections ?? [];
  const answers = data?.answers ?? [];

  // Build a map of result URL → matched handler for badge rendering
  const handlerMap = buildHandlerMap(results, providers);

  const renderSkeleton = () => {
    if (category === "images") return <ImageGridSkeleton />;
    if (category === "news") return <NewsListSkeleton />;
    if (category === "videos") return <VideoListSkeleton />;
    return <ResultListSkeleton />;
  };

  return (
    <>
      {/* Content area — two-column layout */}
      <div className="flex gap-8 px-4 py-6 lg:px-[5%] xl:px-[10%]">
        {/* Main column */}
        <div className="min-w-0 w-[640px] shrink-0">
          {/* Loading skeleton */}
          {loading && renderSkeleton()}

          {/* Error state */}
          {!loading && error && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
              <div className="flex-1">
                <p className="font-medium text-foreground">Search unavailable</p>
                <p className="mt-1 text-sm text-muted-foreground">{error}</p>
                <button
                  onClick={fetchResults}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-foreground hover:bg-accent transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Spelling corrections */}
          {!loading && corrections.length > 0 && (
            <div className="mb-4 text-sm text-muted-foreground">
              Did you mean:{" "}
              {corrections.map((c, i) => (
                <span key={c}>
                  {i > 0 && ", "}
                  <Link
                    href={`/search?q=${encodeURIComponent(c)}&category=${category}`}
                    className="font-medium text-blue-700 dark:text-blue-400 hover:underline"
                  >
                    {c}
                  </Link>
                </span>
              ))}
            </div>
          )}

          {/* Instant answers */}
          {!loading && answers.length > 0 && (
            <div className="mb-6 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30 p-4">
              <div className="mb-1.5 flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400">
                <Sparkles className="h-3.5 w-3.5" />
                Instant answer
              </div>
              {answers.map((a, i) => (
                <p key={i} className="text-lg font-medium text-foreground">
                  {typeof a === "string" ? a : (a as { answer?: string }).answer ?? ""}
                </p>
              ))}
            </div>
          )}

          {/* Results by category */}
          {!loading && results.length > 0 && (
            <>
              {category === "images" ? (
                <ImageGrid results={results} />
              ) : category === "news" ? (
                <div className="space-y-3">
                  {results.map((r, i) => (
                    <NewsCard key={`${r.url}-${i}`} result={r} />
                  ))}
                </div>
              ) : category === "videos" ? (
                <div className="space-y-3">
                  {results.map((r, i) => (
                    <VideoCard key={`${r.url}-${i}`} result={r} />
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {results.map((r, i) => (
                    <ResultItem
                      key={`${r.url}-${i}`}
                      result={r}
                      handler={handlerMap.get(r.url)}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {category !== "images" && (
                <nav className="mt-8 flex items-center justify-center gap-2">
                  {page > 1 && (
                    <Link
                      href={`/search?q=${encodeURIComponent(query)}&category=${category}&page=${page - 1}`}
                      className="flex items-center gap-1 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Link>
                  )}

                  {Array.from({ length: 5 }, (_, i) => {
                    const p = Math.max(1, page - 2) + i;
                    if (p < 1) return null;
                    return (
                      <Link
                        key={p}
                        href={`/search?q=${encodeURIComponent(query)}&category=${category}&page=${p}`}
                        className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                          p === page
                            ? "bg-primary text-primary-foreground"
                            : "border border-border bg-card text-foreground hover:bg-accent"
                        }`}
                      >
                        {p}
                      </Link>
                    );
                  })}

                  {results.length >= RESULTS_PER_PAGE && (
                    <Link
                      href={`/search?q=${encodeURIComponent(query)}&category=${category}&page=${page + 1}`}
                      className="flex items-center gap-1 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  )}
                </nav>
              )}
            </>
          )}

          {/* Empty state */}
          {!loading && results.length === 0 && !error && (
            <div className="mt-12 flex flex-col items-center text-center">
              <Search className="mb-4 h-12 w-12 text-muted-foreground/40" />
              <p className="text-lg font-medium text-foreground">No results found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try different keywords or check your search engine connection.
              </p>
            </div>
          )}
        </div>

        {/* RHS Sidebar — desktop only */}
        <aside className="hidden flex-1 min-w-[400px] lg:block">
          {loading ? (
            <SidebarSkeleton />
          ) : (
            <>
              <InfoCardContainer results={results} providers={providers} />
              <RelatedSearches suggestions={suggestions} category={category} />
              {data && (
                <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground/50">
                  <Lightbulb className="h-3 w-3" />
                  Powered by SearXNG
                </div>
              )}
            </>
          )}
        </aside>
      </div>

      {/* Mobile: show related searches below results */}
      {!loading && suggestions.length > 0 && (
        <div className="px-4 pb-6 lg:hidden">
          <RelatedSearches suggestions={suggestions} category={category} />
        </div>
      )}
    </>
  );
}

/** Build a map from result URL → { provider, card } for badge rendering */
function buildHandlerMap(
  results: Array<{ url: string }>,
  providers: LinkHandlerProvider[]
): Map<string, { provider: LinkHandlerProvider; card: LinkHandlerCard }> {
  const map = new Map<string, { provider: LinkHandlerProvider; card: LinkHandlerCard }>();

  for (const r of results) {
    for (const provider of providers) {
      for (const card of provider.cards) {
        if (card.triggers.some((t) => r.url.includes(t))) {
          if (!map.has(r.url)) {
            map.set(r.url, { provider, card });
          }
          break;
        }
      }
    }
  }

  return map;
}
