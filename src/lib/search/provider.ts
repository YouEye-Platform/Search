/**
 * Search provider registry.
 *
 * Currently only SearXNG is implemented. To add a new provider:
 *  1. Create a class implementing SearchProvider in this directory
 *  2. Register it below
 *  3. Add selection logic (env var, user setting, etc.)
 */

import type { SearchProvider } from "./types";
import { SearXNGProvider } from "./searxng";

let _provider: SearchProvider | null = null;

export function getProvider(): SearchProvider {
  if (!_provider) {
    _provider = new SearXNGProvider();
  }
  return _provider;
}
