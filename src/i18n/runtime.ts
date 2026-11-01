import "server-only";
import { cache } from "react";
import { getSession } from "@/lib/auth";
import { createApiClient } from "@/lib/api";
import { resolveAppLocale } from "@/lib/locale";

/** React's request cache is scoped to the acting user; never cache this globally. */
export const getAppLocale = cache(async () => {
  const session = await getSession("ye-search").catch(() => null);
  if (!session) return "en";
  const header = await createApiClient("ye-search").fetchHeaderConfig(session.userId);
  return resolveAppLocale(header?.locale);
});
