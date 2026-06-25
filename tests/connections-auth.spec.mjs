import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

const appRoot = process.env.APP_ROOT || join(import.meta.dirname, '..');

function read(path) {
  return readFileSync(join(appRoot, path), 'utf8');
}

test('Search sends its app token when discovering connections', () => {
  const source = read('src/lib/connections/index.ts');

  assert.match(source, /const YOUEYE_APP_TOKEN = process\.env\.YOUEYE_APP_TOKEN/);
  assert.match(source, /Authorization: `Bearer \$\{YOUEYE_APP_TOKEN\}`/);
  assert.match(source, /"X-YouEye-App": YOUEYE_APP_ID \|\| ""/);
  assert.match(source, /"X-YouEye-User": userId/);
  assert.match(source, /\/my-connections/);
});
