"use client";

import { useState, useCallback, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, ExternalLink, Download } from "lucide-react";
import type { SearchResult } from "@/lib/search";

function formatDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function Lightbox({
  images,
  index,
  onClose,
  onNav,
}: {
  images: SearchResult[];
  index: number;
  onClose: () => void;
  onNav: (i: number) => void;
}) {
  const img = images[index];

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft" && index > 0) onNav(index - 1);
      else if (e.key === "ArrowRight" && index < images.length - 1) onNav(index + 1);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [index, images.length, onClose, onNav]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      {/* Top bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <a
            href={img.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-full bg-black/50 px-3 py-1.5 text-sm text-white hover:bg-black/70 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="h-3.5 w-3.5" /> Open
          </a>
          {img.img_src && (
            <a
              href={img.img_src}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-full bg-black/50 px-3 py-1.5 text-sm text-white hover:bg-black/70 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Download className="h-3.5 w-3.5" /> Full size
            </a>
          )}
        </div>
        <button
          onClick={onClose}
          className="rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      {index > 0 && (
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onNav(index - 1);
          }}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}
      {index < images.length - 1 && (
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onNav(index + 1);
          }}
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={img.img_src || img.thumbnail}
        alt={img.title || ""}
        className="max-h-[90vh] max-w-[90vw] object-contain"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Caption */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 max-w-lg text-center">
        {img.title && (
          <p className="text-sm font-medium text-white">{img.title}</p>
        )}
        <p className="text-xs text-white/60">{formatDomain(img.url)}</p>
      </div>
    </div>
  );
}

export function ImageGrid({ results }: { results: SearchResult[] }) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const handleNav = useCallback((i: number) => {
    setLightboxIdx(i);
  }, []);

  const handleClose = useCallback(() => {
    setLightboxIdx(null);
  }, []);

  return (
    <>
      <div className="masonry-grid">
        {results.map((result, i) => {
          const src = result.thumbnail || result.img_src;
          if (!src) return null;
          return (
            <button
              key={`${result.url}-${i}`}
              type="button"
              onClick={() => setLightboxIdx(i)}
              className="group relative w-full overflow-hidden rounded-lg bg-muted text-left"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={result.title || ""}
                className="w-full h-auto object-contain transition-transform duration-200 group-hover:scale-105"
                loading="lazy"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                <div className="min-w-0">
                  {result.title && (
                    <p className="text-xs font-medium text-white truncate">
                      {result.title}
                    </p>
                  )}
                  <p className="text-[10px] text-white/60 truncate">
                    {formatDomain(result.url)}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {lightboxIdx !== null && (
        <Lightbox
          images={results}
          index={lightboxIdx}
          onClose={handleClose}
          onNav={handleNav}
        />
      )}
    </>
  );
}
