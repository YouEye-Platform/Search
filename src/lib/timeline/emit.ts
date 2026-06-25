/**
 * Search Timeline Event Emitters
 *
 * Posts timeline entries to YE-UI for search actions.
 * Each entry includes embed_path + standard structured data.
 */

import { createApiClient } from "@/lib/api";

const api = createApiClient("ye-search");
const postTimelineEntry = api.postTimelineEntry.bind(api);

// Debounce map: userId+key → last emit timestamp
const emitDebounce = new Map<string, number>();
const DEBOUNCE_MS = 30 * 1000; // 30 seconds for search (shorter than Cinema's 5 min)

async function emitIfNotDebounced(
  userId: string,
  key: string,
  collection: string,
  entry: Record<string, unknown>
): Promise<void> {
  const debounceKey = `${userId}:${key}`;
  const last = emitDebounce.get(debounceKey) ?? 0;
  if (Date.now() - last < DEBOUNCE_MS) return;
  emitDebounce.set(debounceKey, Date.now());
  try {
    await postTimelineEntry(userId, collection, entry);
  } catch {
    // Timeline is best-effort
  }
}

// ─── Search Query ────────────────────────────────────────────────

export async function emitSearchQuery(
  userId: string,
  query: string,
  category: string,
  resultCount: number
): Promise<void> {
  if (!query.trim()) return;

  await emitIfNotDebounced(userId, `query:${query}:${category}`, "history", {
    app_id: "search",
    entry_type: "search-query",
    title: `Searched: "${query}"`,
    embed_path: `/embed/timeline/search?q=${encodeURIComponent(query)}&cat=${encodeURIComponent(category)}`,
    tags: { category, result_count: String(resultCount) },
    data: {
      description: `${resultCount} result${resultCount !== 1 ? "s" : ""} in ${category}`,
      query,
      category,
      result_count: resultCount,
    },
  });
}

// ─── Link Clicked ────────────────────────────────────────────────

export async function emitLinkClicked(
  userId: string,
  resultUrl: string,
  resultTitle: string,
  query: string
): Promise<void> {
  await emitIfNotDebounced(userId, `click:${resultUrl}`, "history", {
    app_id: "search",
    entry_type: "search-link-clicked",
    title: resultTitle || "Visited link",
    embed_path: `/embed/timeline/search?q=${encodeURIComponent(query)}&clicked=${encodeURIComponent(resultUrl)}`,
    tags: { query },
    data: {
      description: `From search: "${query}"`,
      url: resultUrl,
      query,
      result_title: resultTitle,
    },
  });
}
