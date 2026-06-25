/**
 * SearXNG search provider implementation.
 *
 * Resolves the SearXNG instance URL via the YouEye connections discovery API.
 * Newer YouEye servers return a scoped Caddy URL for Search -> SearXNG so
 * Search can call only the granted SearXNG API paths without direct LAN access.
 * The platform pushes bridge state to YE-UI, and apps query it through
 * GET /api/v1/my-connections (authenticated via X-YouEye-App and scoped by X-YouEye-User).
 */

import type { SearchProvider, SearchResponse, SearchResult, Infobox } from "./types";
import { connectionFetch, getBackend, getConnections, type Connection } from "@/lib/connections";

const SEARCH_TIMEOUT = 12_000;
const SUGGEST_TIMEOUT = 3_000;

/**
 * Resolve the SearXNG backend URL using the connections discovery API.
 *
 * Looks for a bridge with appId "searxng" first, then falls back to
 * the first available bridge (in case the app is registered under a
 * different ID like "app-searxng").
 */
async function resolveConnection(userId?: string): Promise<Connection | null> {
  const conns = await getConnections(userId);

  // Exact match by appId
  const engine = getBackend(conns, "searxng");
  if (engine) return engine;

  // Try common variations used by older catalogs.
  const altEngine = getBackend(conns, "app-searxng") || getBackend(conns, "searxng-main");
  if (altEngine) return altEngine;

  return null;
}

function normalizeResult(raw: Record<string, unknown>): SearchResult {
  return {
    url: String(raw.url ?? ""),
    title: String(raw.title ?? ""),
    content: String(raw.content ?? ""),
    engines: Array.isArray(raw.engines) ? raw.engines : [],
    score: Number(raw.score ?? 0),
    category: String(raw.category ?? "general"),
    publishedDate: raw.publishedDate ? String(raw.publishedDate) : null,
    img_src: String(raw.img_src ?? ""),
    thumbnail: String(raw.thumbnail ?? ""),
    iframe_src: String(raw.iframe_src ?? ""),
    length: raw.length != null ? Number(raw.length) : null,
  };
}

function normalizeInfobox(raw: Record<string, unknown>): Infobox {
  return {
    title: String(raw.infobox ?? raw.title ?? ""),
    content: String(raw.content ?? ""),
    img_src: String(raw.img_src ?? ""),
    id: String(raw.id ?? ""),
    urls: Array.isArray(raw.urls)
      ? raw.urls.map((u: Record<string, string>) => ({
          title: String(u.title ?? ""),
          url: String(u.url ?? ""),
        }))
      : [],
    engine: String(raw.engine ?? ""),
    attributes: Array.isArray(raw.attributes)
      ? raw.attributes.map((a: Record<string, string>) => ({
          label: String(a.label ?? ""),
          value: String(a.value ?? ""),
        }))
      : [],
  };
}

function emptyResponse(query: string): SearchResponse {
  return {
    query,
    results: [],
    suggestions: [],
    corrections: [],
    answers: [],
    infoboxes: [],
    unresponsiveEngines: [],
  };
}

export class SearXNGProvider implements SearchProvider {
  readonly name = "SearXNG";
  readonly categories = ["general", "images", "news", "videos"];

  async search(query: string, page: number, category: string, userId?: string): Promise<SearchResponse> {
    const conn = await resolveConnection(userId);
    if (!conn) {
      throw new Error(
        "No search engine connected. Install SearXNG from Market, then connect it in Settings > Network & Permissions."
      );
    }

    const params = new URLSearchParams({
      q: query,
      format: "json",
      pageno: String(page),
    });
    if (category && category !== "general" && category !== "search") {
      params.set("categories", category);
    }

    const res = await connectionFetch(conn.appId, `/search?${params}`, {
      signal: AbortSignal.timeout(SEARCH_TIMEOUT),
    }, userId);
    if (!res.ok) {
      throw new Error(`Search engine returned ${res.status}`);
    }

    const data = await res.json();

    return {
      query,
      results: Array.isArray(data.results)
        ? data.results.map(normalizeResult)
        : [],
      suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
      corrections: Array.isArray(data.corrections) ? data.corrections : [],
      answers: Array.isArray(data.answers) ? data.answers : [],
      infoboxes: Array.isArray(data.infoboxes)
        ? data.infoboxes.map(normalizeInfobox)
        : [],
      unresponsiveEngines: Array.isArray(data.unresponsive_engines)
        ? data.unresponsive_engines
        : [],
    };
  }

  async suggest(query: string, userId?: string): Promise<string[]> {
    const conn = await resolveConnection(userId);
    if (!conn) return [];

    try {
      const res = await connectionFetch(conn.appId, `/autocompleter?q=${encodeURIComponent(query)}`, {
        signal: AbortSignal.timeout(SUGGEST_TIMEOUT),
      }, userId);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data.slice(0, 8) : [];
    } catch {
      return [];
    }
  }
}
