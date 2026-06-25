import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const root = process.env.APP_ROOT || join(import.meta.dirname, "..");
const read = (path) => readFileSync(join(root, path), "utf8");

test("Search link handlers are projected from the unified surfaces endpoint", () => {
  const route = read("src/app/api/link-handlers/route.ts");

  assert.match(route, /\/apps\/surfaces/);
  assert.match(route, /providersFromSurfaces/);
  assert.match(route, /surface\.kind !== "info-card"/);
  assert.match(route, /surface\.surface_id/);
  assert.match(route, /surface\.embed_path/);
  assert.match(route, /surface\.app_url/);
  assert.doesNotMatch(route, /\/apps\/info-cards/);
});
