import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { createRequire } from "node:module";
import ts from "typescript";
import { createTranslator } from "next-intl";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
function load(path, locale) {
  const messages = JSON.parse(readFileSync(new URL(`../messages/${locale}.json`, import.meta.url)));
  const code = ts.transpileModule(readFileSync(new URL(`../src/${path}`, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const api = {};
  const translator = namespace => createTranslator({ locale, messages, namespace });
  runInNewContext(code, { exports: api, require(id) {
    if (id === "next-intl/server") return { getTranslations: async namespace => translator(namespace) };
    if (id === "next-intl") return { useTranslations: translator };
    if (id === "next/link") return { default: ({ children, ...props }) => require("react").createElement("a", props, children) };
    if (id === "@/components/search-input") return { SearchInput: ({ initialQuery = "" }) => require("react").createElement("input", { defaultValue: initialQuery }) };
    if (id === "@/components/search-results") return { SearchResults: () => null };
    return require(id);
  } });
  return api;
}

test("server search tabs translate across all supported languages and preserve category identifiers", async () => {
  for (const [locale, images, news] of [
    ["en", "Images", "News"], ["ru", "Изображения", "Новости"], ["es", "Imágenes", "Noticias"],
    ["de", "Bilder", "Nachrichten"], ["fr", "Images", "Actualités"],
  ]) {
    const page = load("app/search/page.tsx", locale);
    const html = renderToStaticMarkup(await page.default({ searchParams: Promise.resolve({ q: "Paris", category: "images" }) }));
    assert.ok(html.includes(images), locale);
    assert.ok(html.includes(news), locale);
    assert.ok(html.includes("category=images"), locale);
    assert.ok(!html.includes("MISSING_MESSAGE"), locale);
  }
});

test("timeline sentence interpolates and escapes the query without translating user content", async () => {
  const page = load("app/embed/timeline/search/page.tsx", "fr");
  const html = renderToStaticMarkup(await page.default({
    searchParams: Promise.resolve({ q: "<script>user</script>", clicked: "https://example.org" }),
  }));
  assert.ok(html.includes("Depuis la recherche"));
  assert.ok(html.includes("&lt;script&gt;user&lt;/script&gt;"));
  assert.ok(!html.includes("<script>"));
});
