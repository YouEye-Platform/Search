"use client";

/**
 * Info Card Container — RHS tabbed iframe host.
 *
 * Receives search results and link handler providers from parent.
 * Matches result URLs against triggers and renders iframe embeds
 * from the providing apps. Multiple matches show as tabs (ordered
 * by first matched result position).
 *
 * Measures its own container width and passes w/h URL params to the
 * iframe so the providing app can render responsively.
 */

import { useEffect, useState, useRef, useCallback } from "react";
import type { SearchResult } from "@/lib/search";

export interface LinkHandlerCard {
  type: string;
  triggers: string[];
  embed_path: string | null;
  label: string;
}

export interface LinkHandlerProvider {
  app_id: string;
  app_name: string;
  app_url: string;
  icon: string | null;
  cards: LinkHandlerCard[];
}

export interface MatchedCard {
  provider: LinkHandlerProvider;
  card: LinkHandlerCard;
  matchedUrl: string;
  resultIndex: number;
}

interface InfoCardContainerProps {
  results: SearchResult[];
  providers: LinkHandlerProvider[];
}

export function InfoCardContainer({ results, providers }: InfoCardContainerProps) {
  const [activeTab, setActiveTab] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Match result URLs against provider triggers (top 10 results only)
  const matched = matchResults(results.slice(0, 10), providers);

  // Reset active tab when matches change
  useEffect(() => {
    setActiveTab(0);
  }, [matched.length]);

  // Measure container width with ResizeObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(Math.round(entry.contentRect.width));
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (matched.length === 0) return null;

  return (
    <div ref={containerRef} className="mb-6">
      {/* Tabs — only show if multiple cards */}
      {matched.length > 1 && (
        <div className="mb-2 flex gap-1 border-b border-border">
          {matched.map((m, i) => (
            <button
              key={`${m.provider.app_id}-${m.card.type}`}
              onClick={() => setActiveTab(i)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors rounded-t-md ${
                i === activeTab
                  ? "bg-card border border-b-0 border-border text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m.provider.app_name}
            </button>
          ))}
        </div>
      )}

      {/* Card iframes — render all but only show active */}
      {matched.map((m, i) => (
        <InfoCardIframe
          key={`${m.provider.app_id}-${m.card.type}-${m.matchedUrl}`}
          match={m}
          visible={i === activeTab}
          containerWidth={containerWidth}
        />
      ))}
    </div>
  );
}

function InfoCardIframe({
  match,
  visible,
  containerWidth,
}: {
  match: MatchedCard;
  visible: boolean;
  containerWidth: number;
}) {
  const [ready, setReady] = useState(false);
  const [iframeHeight, setIframeHeight] = useState<number | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      let expected = "";
      try {
        expected = match.provider.app_url ? new URL(match.provider.app_url).origin : "";
      } catch {
        expected = "";
      }
      if (expected && e.origin !== expected) return;

      if (e.data?.type === "youeye:ready") {
        setReady(true);
        return;
      }

      if (e.data?.type === "youeye:resize" && typeof e.data.height === "number" && e.data.height > 0) {
        setReady(true);
        setIframeHeight(e.data.height);
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [match.provider.app_url]);

  if (!match.card.embed_path) return null;

  // Pass container dimensions to the iframe so the card can render responsively
  const w = containerWidth || 480;
  const iframeSrc = `${match.provider.app_url}${match.card.embed_path}?url=${encodeURIComponent(match.matchedUrl)}&w=${w}`;

  const iframeStyle: React.CSSProperties = ready
    ? { height: iframeHeight ? `${iframeHeight}px` : "auto", minHeight: 300 }
    : undefined as unknown as React.CSSProperties;

  return (
    <div
      className={visible ? "block" : "hidden"}
      style={{ minHeight: ready ? undefined : 480 }}
    >
      {/* Loading skeleton — rich card style */}
      {!ready && (
        <div className="animate-pulse rounded-xl border border-border bg-card overflow-hidden">
          {/* Backdrop placeholder */}
          <div className="h-44 w-full bg-muted" />
          {/* Content area */}
          <div className="p-4 space-y-3">
            <div className="flex gap-4">
              {/* Poster placeholder overlapping backdrop */}
              <div className="-mt-20 h-48 w-32 rounded-lg bg-muted border-4 border-card shrink-0" />
              <div className="flex-1 space-y-2 pt-2">
                <div className="h-5 w-3/4 rounded bg-muted" />
                <div className="h-4 w-1/2 rounded bg-muted" />
                <div className="h-4 w-1/3 rounded bg-muted" />
                <div className="mt-2 flex gap-2">
                  <div className="h-6 w-16 rounded-full bg-muted" />
                  <div className="h-6 w-16 rounded-full bg-muted" />
                  <div className="h-6 w-16 rounded-full bg-muted" />
                </div>
              </div>
            </div>
            <div className="h-3 w-full rounded bg-muted" />
            <div className="h-3 w-5/6 rounded bg-muted" />
            <div className="h-3 w-4/6 rounded bg-muted" />
            <div className="h-3 w-3/6 rounded bg-muted" />
            <div className="mt-3 space-y-2">
              <div className="h-3 w-2/3 rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />
            </div>
          </div>
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={iframeSrc}
        className={`w-full rounded-xl border border-border bg-card transition-opacity duration-300 ${ready ? "opacity-100" : "opacity-0 h-0 overflow-hidden"}`}
        style={ready ? { ...iframeStyle, overflow: "hidden" } : undefined}
        scrolling="no"
        sandbox="allow-scripts allow-same-origin allow-popups allow-top-navigation"
        loading="lazy"
        title={`${match.provider.app_name} info card`}
      />
    </div>
  );
}

/** Match search results against link handler triggers, return matches ordered by result index */
function matchResults(
  results: SearchResult[],
  providers: LinkHandlerProvider[]
): MatchedCard[] {
  const matches: MatchedCard[] = [];
  const seenProviderCards = new Set<string>();

  for (let i = 0; i < results.length; i++) {
    const url = results[i].url;
    for (const provider of providers) {
      for (const card of provider.cards) {
        const key = `${provider.app_id}:${card.type}`;
        if (seenProviderCards.has(key)) continue;
        if (card.triggers.some((t) => url.includes(t)) && card.embed_path) {
          matches.push({
            provider,
            card,
            matchedUrl: url,
            resultIndex: i,
          });
          seenProviderCards.add(key);
        }
      }
    }
  }

  return matches.sort((a, b) => a.resultIndex - b.resultIndex);
}
