import { getTranslations as getInterfaceTranslations } from "next-intl/server";
/**
 * Search Timeline Embed — Search Query Card
 *
 * Compact card showing a search query in the timeline.
 * Optionally highlights a clicked result link.
 *
 * Query params:
 *   ?q=iron+man       — The search query
 *   &cat=general      — Category (optional)
 *   &clicked=https://... — URL that was clicked (optional)
 */

import { Search, ExternalLink, Globe } from "lucide-react";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    cat?: string;
    clicked?: string;
  }>;
}

export default async function TimelineSearchPage({ searchParams }: PageProps) {
  const translateInterface = await getInterfaceTranslations("interface");

  const params = await searchParams;
  const { q, cat, clicked } = params;

  if (!q) {
    return (
      <div className="p-2.5">
        <p className="text-xs text-muted-foreground py-2 text-center">{translateInterface("mb8d8e06bb55f")}</p>
      </div>
    );
  }

  // If this is a "link clicked" entry, show the clicked link
  if (clicked) {
    let hostname = "";
    try {
      hostname = new URL(clicked).hostname.replace("www.", "");
    } catch {
      hostname = clicked;
    }

    return (
      <div className="p-2.5">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Globe className="h-3.5 w-3.5 text-blue-500" />
          <span className="text-[11px] font-medium text-blue-500">{translateInterface("m8e14ecc9e05d")}</span>
        </div>

        <a
          href={clicked}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
        >
          {hostname}
          <ExternalLink className="h-3 w-3" />
        </a>

        <p className="text-[11px] text-muted-foreground mt-0.5">
          {translateInterface("mf1a3d1ee5022", { query: q })}
        </p>
      </div>
    );
  }

  // Search query card
  return (
    <div className="p-2.5">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Search className="h-3.5 w-3.5 text-amber-500" />
        <span className="text-[11px] font-medium text-amber-500">{translateInterface("md04fc7d7e197")}</span>
        {cat && cat !== "general" && (
          <span className="text-[10px] text-muted-foreground rounded bg-muted px-1.5 py-0">
            {translateInterface(({ images: "mbe7e2f201293", news: "m69752f2313b2", videos: "mc9a9639463c2" } as Record<string, string>)[cat] ?? "ma52ace420f21")}
          </span>
        )}
      </div>

      <p className="text-sm font-medium text-foreground">
        &ldquo;{q}&rdquo;
      </p>
    </div>
  );
}
