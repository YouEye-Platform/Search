import { Search, Image, Newspaper, Video } from "lucide-react";
import { AnimatedSearch } from "@/components/animated-search";

const CATEGORIES = [
  { label: "All", category: "general", icon: Search },
  { label: "Images", category: "images", icon: Image },
  { label: "News", category: "news", icon: Newspaper },
  { label: "Videos", category: "videos", icon: Video },
];

export default function HomePage() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4">
      {/* Logo / Title */}
      <div className="mb-10 flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
          <Search className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Search
        </h1>
        <p className="text-sm text-muted-foreground">
          Privacy-respecting web search
        </p>
      </div>

      {/* Animated gradient search bar */}
      <AnimatedSearch />

      {/* Category quick links */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {CATEGORIES.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.category}
              href={`/search?q=&category=${item.category}`}
              className="flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </a>
          );
        })}
      </div>

      {/* Tagline */}
      <p className="mt-12 max-w-sm text-center text-xs text-muted-foreground/60">
        Results are fetched through your connected search engine &mdash; no
        tracking, no profiling.
      </p>
    </div>
  );
}
