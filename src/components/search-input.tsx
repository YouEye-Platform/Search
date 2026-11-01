"use client";

import { useTranslations as useInterfaceTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Image, Loader2, Newspaper, Search, Video, X } from "lucide-react";

const categories = [
  { value: "general", labelKey: "ma52ace420f21", icon: Search },
  { value: "images", labelKey: "mbe7e2f201293", icon: Image },
  { value: "news", labelKey: "m69752f2313b2", icon: Newspaper },
  { value: "videos", labelKey: "mc9a9639463c2", icon: Video },
];

export function SearchInput({
  initialQuery = "", category = "general", prominent = false,
}: { initialQuery?: string; category?: string; prominent?: boolean }) {
  const translateInterface = useInterfaceTranslations("interface");
  const router = useRouter();
  const id = useId();
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    let current = true;
    if (query.trim().length < 2 || !focused) return;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/suggest?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        if (!response.ok) return;
        const data: unknown = await response.json();
        if (current) setSuggestions(Array.isArray(data)
          ? data.filter((value): value is string => typeof value === "string").slice(0, 8) : []);
      } catch {
        // Suggestions are optional; submitting the query remains available.
      } finally {
        if (current) setLoading(false);
      }
    }, 150);
    return () => {
      current = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, focused]);

  function navigate(value: string) {
    if (!value.trim()) return;
    setFocused(false);
    const params = new URLSearchParams({ q: value.trim() });
    if (selectedCategory !== "general" && selectedCategory !== "search") params.set("category", selectedCategory);
    router.push(`/search?${params}`);
  }

  const open = focused && suggestions.length > 0;
  return (
    <div className="relative w-full" onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) { setFocused(false); setLoading(false); }
    }}>
      <form role="search" onSubmit={(event) => {
        event.preventDefault();
        navigate(open && active >= 0 ? suggestions[active] : query);
      }}>
        <label htmlFor={id} className="sr-only">{translateInterface("searchLabel")}</label>
        <div className={`search-field ${prominent ? "search-field-large" : ""}`}>
          <Search aria-hidden="true" className="ml-3 h-4 w-4 shrink-0 text-muted-foreground" />
          <input ref={input} id={id} type="search" role="combobox" aria-autocomplete="list"
            aria-expanded={open} aria-controls={open ? `${id}-suggestions` : undefined}
            aria-activedescendant={open && active >= 0 ? `${id}-suggestion-${active}` : undefined}
            autoComplete="off" value={query} onChange={(event) => { setQuery(event.target.value); setSuggestions([]); setActive(-1); setLoading(false); setFocused(true); }}
            onFocus={() => setFocused(true)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setFocused(false);
              if (open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
                event.preventDefault();
                setActive((value) => event.key === "ArrowDown"
                  ? (value + 1) % suggestions.length : (value <= 0 ? suggestions.length : value) - 1);
              }
            }}
            placeholder={translateInterface("searchPlaceholder")}
            className="min-w-0 flex-1 bg-transparent px-3 py-2 text-base text-foreground outline-none placeholder:text-muted-foreground" />
          {loading && <Loader2 aria-label={translateInterface("loadingSuggestions")} className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />}
          {query && <button type="button" aria-label={translateInterface("m3b7ea51793e9")} className="search-icon-button"
            onClick={() => { setQuery(""); setSuggestions([]); setActive(-1); setLoading(false); input.current?.focus(); setFocused(false); }}>
            <X aria-hidden="true" className="h-4 w-4" />
          </button>}
          <button type="submit" aria-label={translateInterface("m49c266baaaa7")} className="search-submit">
            <Search aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
        {prominent && <fieldset className="mt-5 flex flex-wrap gap-2">
          <legend className="sr-only">{translateInterface("resultType")}</legend>
          {categories.map(({ value, labelKey, icon: Icon }) => (
            <label key={value} className="cursor-pointer">
              <input type="radio" name={`${id}-category`} value={value}
                checked={selectedCategory === value} onChange={() => setSelectedCategory(value)} className="peer sr-only" />
              <span className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-transparent px-4 text-sm text-muted-foreground transition-colors hover:bg-accent peer-checked:border-border peer-checked:bg-card peer-checked:text-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring">
                <Icon aria-hidden="true" className="h-4 w-4" />{translateInterface(labelKey)}
              </span>
            </label>
          ))}
        </fieldset>}
      </form>
      {open && <ul id={`${id}-suggestions`} role="listbox" aria-label={translateInterface("searchSuggestions")}
        className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-lg">
        {suggestions.map((value, index) => (
          <li key={`${value}-${index}`} id={`${id}-suggestion-${index}`} role="option" aria-selected={index === active}>
            <button type="button" tabIndex={-1} onClick={() => navigate(value)}
              onMouseDown={(event) => event.preventDefault()}
              className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm hover:bg-accent ${index === active ? "bg-accent" : ""}`}>
              <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="break-words">{value}</span>
            </button>
          </li>
        ))}
      </ul>}
    </div>
  );
}
