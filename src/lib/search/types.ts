/**
 * Search provider type definitions.
 *
 * Every search backend (SearXNG, future web APIs, etc.) implements
 * the SearchProvider interface and returns data in these shapes.
 */

export interface SearchResult {
  url: string;
  title: string;
  content: string;
  engines: string[];
  score: number;
  category: string;
  publishedDate: string | null;
  img_src: string;
  thumbnail: string;
  iframe_src: string;
  length: number | null;
}

export interface Infobox {
  title: string;
  content: string;
  img_src: string;
  id: string;
  urls: { title: string; url: string }[];
  engine: string;
  attributes: { label: string; value: string }[];
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  suggestions: string[];
  corrections: string[];
  answers: (string | { answer: string; url?: string; engine?: string; parsed_url?: string[]; template?: string })[];
  infoboxes: Infobox[];
  unresponsiveEngines: [string, string][];
}

export interface SearchProvider {
  readonly name: string;
  readonly categories: string[];
  search(query: string, page: number, category: string, userId?: string): Promise<SearchResponse>;
  suggest(query: string, userId?: string): Promise<string[]>;
}
