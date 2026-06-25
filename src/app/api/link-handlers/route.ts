/**
 * Link Handlers API
 *
 * GET /api/link-handlers — Returns active info card providers with their
 * public URLs and embed paths so the client can build iframe srcs and
 * render "Open in X" badges.
 *
 * Proxies to YE-UI's /api/v1/apps/surfaces and caches for 60s.
 */

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createApiClient } from "@/lib/api";

interface CachedResponse {
  data: LinkHandlerProvider[];
  expiresAt: number;
}

export interface LinkHandlerProvider {
  app_id: string;
  app_name: string;
  app_url: string;
  icon: string | null;
  cards: LinkHandlerCard[];
}

export interface LinkHandlerCard {
  type: string;
  triggers: string[];
  embed_path: string | null;
  label: string;
}

interface SurfaceRecord {
  app_id: string;
  app_name: string;
  app_url: string | null;
  icon: string | null;
  surface_id: string;
  kind: string;
  name?: string;
  embed_path: string | null;
  triggers?: string[];
}

let cache: CachedResponse | null = null;
const CACHE_TTL = 60_000; // 60 seconds

function providersFromSurfaces(surfaces: SurfaceRecord[]): LinkHandlerProvider[] {
  const grouped = new Map<string, LinkHandlerProvider>();

  for (const surface of surfaces) {
    if (surface.kind !== "info-card" || !surface.embed_path || !surface.app_url) continue;

    const provider = grouped.get(surface.app_id) ?? {
      app_id: surface.app_id,
      app_name: surface.app_name,
      app_url: surface.app_url,
      icon: surface.icon ?? null,
      cards: [],
    };

    provider.cards.push({
      type: surface.surface_id,
      triggers: Array.isArray(surface.triggers) ? surface.triggers : [],
      embed_path: surface.embed_path,
      label: surface.name || `Open in ${surface.app_name}`,
    });
    grouped.set(surface.app_id, provider);
  }

  return [...grouped.values()];
}

export async function GET() {
  const session = await getSession("ye-search");
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Return cached if fresh
  if (cache && Date.now() < cache.expiresAt) {
    return NextResponse.json({ providers: cache.data });
  }

  try {
    const api = createApiClient("ye-search");
    const res = await api.fetch("/apps/surfaces", {}, session.userId);

    if (!res.ok) {
      return NextResponse.json({ providers: [] });
    }

    const json = await res.json();
    const providers = providersFromSurfaces(Array.isArray(json.surfaces) ? json.surfaces : []);

    cache = { data: providers, expiresAt: Date.now() + CACHE_TTL };
    return NextResponse.json({ providers });
  } catch {
    return NextResponse.json({ providers: cache?.data ?? [] });
  }
}
