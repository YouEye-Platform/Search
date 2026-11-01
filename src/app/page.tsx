import { useTranslations as useInterfaceTranslations } from "next-intl";
import { Search, Image, Newspaper, Video } from "lucide-react";
import { AnimatedSearch } from "@/components/animated-search";

const CATEGORIES = [
  { labelKey: "ma52ace420f21", category: "general", icon: Search },
  { labelKey: "mbe7e2f201293", category: "images", icon: Image },
  { labelKey: "m69752f2313b2", category: "news", icon: Newspaper },
  { labelKey: "mc9a9639463c2", category: "videos", icon: Video },
];

export default function HomePage() {
  const translateInterface = useInterfaceTranslations("interface");

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4">
      {/* Logo / Title */}
      <div className="mb-10 flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
          <Search className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          {translateInterface("m49c266baaaa7")}</h1>
        <p className="text-sm text-muted-foreground">
          {translateInterface("m1cd4148c0cb7")}</p>
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
              {translateInterface(item.labelKey)}
            </a>
          );
        })}
      </div>

      {/* Tagline */}
      <p className="mt-12 max-w-sm text-center text-xs text-muted-foreground/60">
        {translateInterface("mf3a8ab003ce1")}
      </p>
    </div>
  );
}
