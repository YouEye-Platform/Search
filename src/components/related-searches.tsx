import { Search } from "lucide-react";
import Link from "next/link";

export function RelatedSearches({
  suggestions,
  category,
}: {
  suggestions: string[];
  category: string;
}) {
  if (!suggestions.length) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-3 text-sm font-medium text-foreground">
        Related searches
      </h3>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <Link
            key={s}
            href={`/search?q=${encodeURIComponent(s)}&category=${category}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <Search className="h-3 w-3 flex-shrink-0" />
            {s}
          </Link>
        ))}
      </div>
    </div>
  );
}
