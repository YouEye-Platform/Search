import { getTranslations as getInterfaceTranslations } from "next-intl/server";
import Link from "next/link";
import { Search, Image, Newspaper, Video } from "lucide-react";
import { SearchResults } from "@/components/search-results";
import { SearchInput } from "@/components/search-input";

const CATEGORIES = [
  { key: "general", labelKey: "ma52ace420f21", icon: Search },
  { key: "images", labelKey: "mbe7e2f201293", icon: Image },
  { key: "news", labelKey: "m69752f2313b2", icon: Newspaper },
  { key: "videos", labelKey: "mc9a9639463c2", icon: Video },
];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; category?: string }>;
}) {
  const translateInterface = await getInterfaceTranslations("interface");

  const params = await searchParams;
  const query = params.q || "";
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const rawCat = params.category || "general";
  const category = rawCat === "search" ? "general" : rawCat;

  if (!query) {
    return (
      <section className="search-home">
        <h1 className="mb-3 text-3xl font-semibold">{translateInterface("searchStart")}</h1>
        <p className="mb-6 text-base text-muted-foreground">{translateInterface("searchPrompt")}</p>
        <div className="max-w-2xl"><SearchInput key={category} prominent category={category} /></div>
      </section>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      {/* Category tabs — scroll with content, search bar stays in header */}
      <div className="search-content pt-4 pb-0">
        <div className="search-mobile-query mb-3"><SearchInput key={`${query}-${category}`} initialQuery={query} category={category} /></div>
        <nav aria-label={translateInterface("resultType")} className="flex items-center gap-1 overflow-x-auto">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = category === cat.key;
            const href = `/search?q=${encodeURIComponent(query)}&category=${cat.key}`;
            return (
              <Link
                key={cat.key}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-accent font-medium text-foreground"
                    : "text-muted-foreground hover:bg-accent"
                }`}
              >
                <Icon className="h-4 w-4" />
                {translateInterface(cat.labelKey)}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="border-b border-border mt-1" />

      {/* Results — client component with skeleton loading */}
      <SearchResults query={query} page={page} category={category} />
    </div>
  );
}
