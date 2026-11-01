import { getActivityTranslator } from "@/i18n/activity";
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
  resultCount: number,
  originalTimestamp?: string
): Promise<void> {
  const timestamp = originalTimestamp ?? new Date().toISOString();
  const { t } = await getActivityTranslator(userId);
  if (!query.trim()) return;
  const categoryKeys: Record<string, string> = {"general": "ma52ace420f21", "images": "mbe7e2f201293", "news": "m69752f2313b2", "videos": "mc9a9639463c2"};
  const categoryLabel = categoryKeys[category] ? t(categoryKeys[category]) : category;

  await emitIfNotDebounced(userId, `query:${query}:${category}`, "history", {
    timestamp,
    app_id: "search",
    entry_type: "search-query",
    title: t("m7f1accae8497", {query}),
    embed_path: `/embed/timeline/search?q=${encodeURIComponent(query)}&cat=${encodeURIComponent(category)}`,
    tags: { category, result_count: String(resultCount) },
    data: {
      description: t("m536a9411c104", {count: resultCount, category: categoryLabel}),
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
  query: string,
  originalTimestamp?: string
): Promise<void> {
  const timestamp = originalTimestamp ?? new Date().toISOString();
  const { t } = await getActivityTranslator(userId);
  await emitIfNotDebounced(userId, `click:${resultUrl}`, "history", {
    timestamp,
    app_id: "search",
    entry_type: "search-link-clicked",
    title: resultTitle || t("m2f7615a48803"),
    embed_path: `/embed/timeline/search?q=${encodeURIComponent(query)}&clicked=${encodeURIComponent(resultUrl)}`,
    tags: { query },
    data: {
      description: t("mf1a3d1ee5022", {query}),
      url: resultUrl,
      query,
      result_title: resultTitle,
    },
  });
}
