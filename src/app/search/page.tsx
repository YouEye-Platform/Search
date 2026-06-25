import Link from "next/link";
import { Search, Image, Newspaper, Video } from "lucide-react";
import { SearchResults } from "@/components/search-results";

const CATEGORIES = [
  { key: "general", label: "All", icon: Search },
  { key: "images", label: "Images", icon: Image },
  { key: "news", label: "News", icon: Newspaper },
  { key: "videos", label: "Videos", icon: Video },
];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; category?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || "";
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const rawCat = params.category || "general";
  const category = rawCat === "search" ? "general" : rawCat;

  if (!query) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <p className="text-muted-foreground">Enter a search query to get started.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      {/* Category tabs — scroll with content, search bar stays in header */}
      <div className="px-4 pt-4 pb-0 lg:pl-[5%] xl:pl-[10%]">
        <div className="flex items-center gap-1">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = category === cat.key;
            const href = `/search?q=${encodeURIComponent(query)}&category=${cat.key}`;
            return (
              <Link
                key={cat.key}
                href={href}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-blue-100 font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : "text-muted-foreground hover:bg-accent"
                }`}
              >
                <Icon className="h-4 w-4" />
                {cat.label}
              </Link>
            );
          })}
        </div>
      </div>
      <div className="border-b border-border mt-1" />

      {/* Results — client component with skeleton loading */}
      <SearchResults query={query} page={page} category={category} />
    </div>
  );
}
