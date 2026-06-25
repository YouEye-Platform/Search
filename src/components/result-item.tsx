"use client";

import { ExternalLink } from "lucide-react";
import type { SearchResult } from "@/lib/search";
import { LinkHandlerBadge } from "@/components/link-handler-badge";
import type { LinkHandlerProvider, LinkHandlerCard } from "@/components/info-card-container";
import { useSearchParams } from "next/navigation";
import { DomainIcon } from "@/components/domain-icon";

function formatDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function formatPath(url: string): string {
  try {
    const u = new URL(url);
    const path = u.pathname === "/" ? "" : u.pathname;
    return `${u.hostname.replace(/^www\./, "")}${path}`;
  } catch {
    return url;
  }
}

interface ResultItemProps {
  result: SearchResult;
  handler?: { provider: LinkHandlerProvider; card: LinkHandlerCard };
}

export function ResultItem({ result, handler }: ResultItemProps) {
  const domain = formatDomain(result.url);
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const handleClick = () => {
    // Fire-and-forget timeline tracking
    fetch("/api/timeline/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: result.url,
        title: result.title || "",
        query,
      }),
      keepalive: true,
    }).catch(() => {});
  };

  return (
    <article className="group">
      {/* URL breadcrumb */}
      <div className="mb-1 flex items-center gap-2">
        <DomainIcon domain={domain} />
        <span className="text-sm text-muted-foreground truncate">
          {formatPath(result.url)}
        </span>
      </div>

      {/* Title */}
      <a
        href={result.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="inline-flex items-center gap-1.5 text-lg leading-snug text-blue-700 dark:text-blue-400 hover:underline"
      >
        {result.title || result.url}
        <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-50 transition-opacity flex-shrink-0" />
      </a>

      {/* Snippet */}
      {result.content && (
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
          {result.content}
        </p>
      )}

      {/* Link handler badge */}
      {handler && (
        <div className="mt-1.5">
          <LinkHandlerBadge
            provider={handler.provider}
            card={handler.card}
            resultUrl={result.url}
          />
        </div>
      )}
    </article>
  );
}
