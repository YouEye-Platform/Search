import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const root = join(import.meta.dirname, "..");

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

test("Search calls SearXNG through the YouEye connection proxy", () => {
  const connections = read("src/lib/connections/index.ts");
  const provider = read("src/lib/search/searxng.ts");
  const auth = read("src/lib/routes/auth/index.ts");

  assert.match(connections, /connectionProxyUrl/);
  assert.match(connections, /\/proxy\/\$\{encodeURIComponent\(targetAppId\)\}/);
  assert.match(connections, /YOUEYE_GATEWAY is required for app connection proxying/);
  assert.match(provider, /connectionFetch\(conn\.appId, `\/search\?\$\{params\}`/);
  assert.match(provider, /connectionFetch\(conn\.appId, `\/autocompleter\?q=/);
  assert.doesNotMatch(provider, /backendUrl/);
  assert.doesNotMatch(provider, /conns\.bridges\[0\]/);
  assert.match(auth, /externalBaseUrl/);
  assert.match(auth, /!host\.includes\("0\.0\.0\.0"\)/);
});
