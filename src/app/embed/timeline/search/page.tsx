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
  const params = await searchParams;
  const { q, cat, clicked } = params;

  if (!q) {
    return (
      <div className="p-2.5">
        <p className="text-xs text-muted-foreground py-2 text-center">No query</p>
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
          <span className="text-[11px] font-medium text-blue-500">Visited from Search</span>
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
          from search: &ldquo;{q}&rdquo;
        </p>
      </div>
    );
  }

  // Search query card
  return (
    <div className="p-2.5">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Search className="h-3.5 w-3.5 text-amber-500" />
        <span className="text-[11px] font-medium text-amber-500">Web Search</span>
        {cat && cat !== "general" && (
          <span className="text-[10px] text-muted-foreground rounded bg-muted px-1.5 py-0">
            {cat}
          </span>
        )}
      </div>

      <p className="text-sm font-medium text-foreground">
        &ldquo;{q}&rdquo;
      </p>
    </div>
  );
}
