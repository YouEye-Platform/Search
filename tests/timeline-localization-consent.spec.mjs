import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import { postAdmittedTimeline } from "../src/lib/api/timeline.ts";

const key = Symbol.for("search.timeline-consent-test");
const revision = "e601ca02-6c56-4bdb-a6f5-55735df464d3";
const dataModule = source => `data:text/javascript,${encodeURIComponent(source)}`;

async function fixture(t) {
  t.mock.timers.enable({ apis: ["Date"], now: Date.UTC(2026, 9, 28, 12) });
  let releaseLocale;
  const localeReady = new Promise(resolve => { releaseLocale = resolve; });
  let lookupStarted;
  const lookup = new Promise(resolve => { lookupStarted = resolve; });
  const calls = [];
  const entries = [];
  const state = { enabled: false };
  globalThis[key] = {
    getActivityTranslator: async () => {
      lookupStarted();
      await localeReady;
      return { t: message => message, locale: "en" };
    },
    api: {
      postTimelineEntry: async (userId, collection, entry) => {
        entries.push(entry);
        await postAdmittedTimeline(async (path, options, actingUser) => {
          calls.push({ path, options, actingUser });
          return path.endsWith("/collection") ? Response.json(state) : new Response(null, { status: 204 });
        }, userId, collection, entry);
      },
    },
  };
  t.after(() => { delete globalThis[key]; });
  const stateExpression = 'globalThis[Symbol.for("search.timeline-consent-test")]';
  let source = stripTypeScriptTypes(readFileSync(new URL("../src/lib/timeline/emit.ts", import.meta.url), "utf8"));
  source = source.replace('"@/lib/api"', JSON.stringify(dataModule(`export const createApiClient = () => ${stateExpression}.api;`)))
    .replace('"@/i18n/activity"', JSON.stringify(dataModule(`export const getActivityTranslator = (...args) => ${stateExpression}.getActivityTranslator(...args);`)));
  // A fresh module keeps each scenario's debounce state independent.
  const emitter = await import(dataModule(`${source}\n// ${t.name}`));
  return { emitter, lookup, releaseLocale, calls, entries, state };
}

for (const [name, invoke] of [
  ["query", (emitter, timestamp) => emitter.emitSearchQuery("account-a", "a private search", "general", 2, timestamp)],
  ["clicked link", (emitter, timestamp) => emitter.emitLinkClicked("account-a", "https://example.org", "A title", "a private search", timestamp)],
]) {
  test(`${name}: a locale wait crossing re-enable never submits the older action`, async t => {
    const f = await fixture(t);
    const actionTime = new Date().toISOString();
    const pending = invoke(f.emitter);
    await f.lookup;
    t.mock.timers.tick(60_000);
    Object.assign(f.state, { enabled: true, revision, enabledAt: new Date().toISOString() });
    f.releaseLocale();
    await pending;
    assert.equal(f.entries[0].timestamp, actionTime);
    assert.equal(f.calls.length, 1);
    assert.equal(f.calls[0].path, "/timeline/collection");
    assert.equal(f.calls[0].options.body, undefined);
    assert.equal(f.calls[0].actingUser, "account-a");
  });

  test(`${name}: preserve a caller's earlier timestamp in an admitted event`, async t => {
    const f = await fixture(t);
    const originalTimestamp = new Date(Date.now() - 30_000).toISOString();
    Object.assign(f.state, { enabled: true, revision, enabledAt: new Date(Date.now() - 60_000).toISOString() });
    f.releaseLocale();
    await invoke(f.emitter, originalTimestamp);
    assert.equal(f.calls.length, 2);
    assert.equal(f.calls[1].path, "/timeline");
    const body = JSON.parse(f.calls[1].options.body);
    assert.equal(body.timestamp, originalTimestamp);
    assert.equal(body.collection_revision, revision);
  });
}
