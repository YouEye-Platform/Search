"use client";
import {useLocale} from "next-intl";
import type { SearchResult } from "@/lib/search";
import { ExternalLink } from "lucide-react";
import { DomainIcon } from "@/components/domain-icon";

function formatDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function timeAgo(dateStr: string, locale: string): string {
  const date = new Date(dateStr);
  if (!Number.isFinite(date.getTime())) return "";
  const seconds = (date.getTime() - Date.now()) / 1000;
  const format = new Intl.RelativeTimeFormat(locale, {numeric: "auto"});
  if (Math.abs(seconds) < 60) return format.format(0, "second");
  if (Math.abs(seconds) < 3600) return format.format(Math.round(seconds / 60), "minute");
  if (Math.abs(seconds) < 86400) return format.format(Math.round(seconds / 3600), "hour");
  if (Math.abs(seconds) < 2592000) return format.format(Math.round(seconds / 86400), "day");
  return new Intl.DateTimeFormat(locale, {dateStyle: "medium"}).format(date);
}

export function NewsCard({ result }: { result: SearchResult }) {
  const domain = formatDomain(result.url);
  const locale = useLocale();

  return (
    <a
      href={result.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:bg-accent/50 hover:shadow-md"
    >
      <div className="flex-1 min-w-0">
        {/* Source + time */}
        <div className="mb-1.5 flex items-center gap-2">
          <DomainIcon domain={domain} />
          <span className="text-xs text-muted-foreground">{domain}</span>
          {result.publishedDate && (
            <>
              <span className="text-xs text-muted-foreground/40">&bull;</span>
              <span className="text-xs text-muted-foreground">
                {timeAgo(result.publishedDate, locale)}
              </span>
            </>
          )}
        </div>

        {/* Headline */}
        <h3 className="font-semibold text-foreground group-hover:text-blue-700 dark:group-hover:text-blue-400 line-clamp-2 leading-snug">
          {result.title}
          <ExternalLink className="ml-1 inline h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
        </h3>

        {/* Snippet */}
        {result.content && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {result.content}
          </p>
        )}
      </div>

      {/* Thumbnail */}
      {(result.thumbnail || result.img_src) && (
        <div className="flex-shrink-0 w-32 h-24 overflow-hidden rounded-lg bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={result.thumbnail || result.img_src}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      )}
    </a>
  );
}
