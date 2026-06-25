import type { SearchResult } from "@/lib/search";
import { Play, ExternalLink } from "lucide-react";
import { DomainIcon } from "@/components/domain-icon";

function formatDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function VideoCard({ result }: { result: SearchResult }) {
  const domain = formatDomain(result.url);
  const duration = formatDuration(result.length);

  return (
    <a
      href={result.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:bg-accent/50 hover:shadow-md"
    >
      {/* Thumbnail */}
      <div className="relative flex-shrink-0 w-48 h-28 overflow-hidden rounded-lg bg-muted">
        {(result.thumbnail || result.img_src) ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={result.thumbnail || result.img_src}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
            {/* Play overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
              <div className="rounded-full bg-black/60 p-2">
                <Play className="h-5 w-5 text-white fill-white" />
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Play className="h-8 w-8 text-muted-foreground/40" />
          </div>
        )}
        {/* Duration badge */}
        {duration && (
          <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
            {duration}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground group-hover:text-blue-700 dark:group-hover:text-blue-400 line-clamp-2 leading-snug">
          {result.title}
          <ExternalLink className="ml-1 inline h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
        </h3>

        {result.content && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {result.content}
          </p>
        )}

        {/* Source */}
        <div className="mt-2 flex items-center gap-2">
          <DomainIcon domain={domain} className="h-3.5 w-3.5 text-[9px]" />
          <span className="text-xs text-muted-foreground">{domain}</span>
        </div>
      </div>
    </a>
  );
}
