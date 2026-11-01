import test from 'node:test';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { materializeStandalone } from '../scripts/materialize-standalone.mjs';

function fixture(t) {
  const project = mkdtempSync(join(tmpdir(), 'search-standalone-'));
  t.after(() => rmSync(project, { recursive: true, force: true }));
  const root = join(project, '.next', 'standalone');
  mkdirSync(root, { recursive: true });
  writeFileSync(join(root, 'server.js'), 'original');
  return { project, root };
}

test('nested scoped pnpm native dependencies become ordinary files', (t) => {
  const { project, root } = fixture(t);
  const library = join(root, 'node_modules', '.pnpm', 'libvips', 'node_modules', '@img', 'libvips');
  const scope = join(root, 'node_modules', '.pnpm', 'sharp', 'node_modules', '@img');
  mkdirSync(library, { recursive: true });
  mkdirSync(scope, { recursive: true });
  writeFileSync(join(library, 'native.so'), 'verified binary');
  symlinkSync(library, join(scope, 'sharp-libvips-linux-x64'));
  materializeStandalone(root, project);
  const packaged = join(scope, 'sharp-libvips-linux-x64');
  assert.equal(lstatSync(packaged).isSymbolicLink(), false);
  assert.equal(readFileSync(join(packaged, 'native.so'), 'utf8'), 'verified binary');
});

test('relocated aliases retain scoped and transitive pnpm dependency resolution', (t) => {
  const { project, root } = fixture(t);
  const modules = join(root, 'node_modules');
  const nextContext = join(modules, '.pnpm', 'next', 'node_modules');
  const helperContext = join(modules, '.pnpm', 'helpers', 'node_modules');
  const next = join(nextContext, 'next');
  const helper = join(helperContext, '@swc', 'helpers');
  const tslib = join(modules, '.pnpm', 'tslib', 'node_modules', 'tslib');
  const packageAt = (directory, manifest, source) => {
    mkdirSync(directory, { recursive: true });
    writeFileSync(join(directory, 'package.json'), JSON.stringify({ main: 'index.cjs', ...manifest }));
    writeFileSync(join(directory, 'index.cjs'), source);
  };
  packageAt(next, { name: 'next', dependencies: { '@swc/helpers': '0.5.23' } },
    'module.exports = require("@swc/helpers");');
  packageAt(helper, { name: '@swc/helpers', dependencies: { tslib: '2.8.1' } },
    'module.exports = require("tslib");');
  packageAt(tslib, { name: 'tslib' }, 'module.exports = "locked transitive dependency";');
  // A different root version must not replace the helper's locked dependency.
  packageAt(join(modules, 'tslib'), { name: 'tslib' }, 'module.exports = "wrong root dependency";');
  mkdirSync(join(nextContext, '@swc'), { recursive: true });
  symlinkSync(helper, join(nextContext, '@swc', 'helpers'));
  symlinkSync(tslib, join(helperContext, 'tslib'));
  symlinkSync(next, join(modules, 'next'));
  writeFileSync(join(root, 'server.js'), 'console.log(require("next"));');
  const run = (directory) => spawnSync(process.execPath, [join(directory, 'server.js')], { encoding: 'utf8' });
  assert.equal(run(root).stdout.trim(), 'locked transitive dependency');
  materializeStandalone(root, project);
  const relocated = join(project, 'relocated');
  renameSync(root, relocated);
  const result = run(relocated);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), 'locked transitive dependency');
  const packagedHelper = join(relocated, 'node_modules', 'next', 'node_modules', '@swc', 'helpers');
  assert.equal(lstatSync(packagedHelper).isSymbolicLink(), false);
  assert.equal(lstatSync(join(packagedHelper, 'node_modules', 'tslib')).isSymbolicLink(), false);
});

test('dangling, outside-source and cyclic links fail before replacing output', (t) => {
  const { project, root } = fixture(t);
  for (const target of [join(project, 'absent'), tmpdir(), root]) {
    symlinkSync(target, join(root, 'bad'));
    assert.throws(() => materializeStandalone(root, project));
    assert.equal(readFileSync(join(root, 'server.js'), 'utf8'), 'original');
    assert.equal(existsSync(join(root, 'server.js')), true);
    rmSync(join(root, 'bad'));
  }
});

const script = new URL("../scripts/postbuild.mjs", import.meta.url);

test("standalone packaging materializes nested scoped dependencies", () => {
  const root = mkdtempSync(join(tmpdir(), "search-packaging-"));
  try {
    const modules = join(root, ".next/standalone/node_modules");
    mkdirSync(join(modules, ".pnpm/sharp/node_modules/@img"), { recursive: true });
    mkdirSync(join(modules, ".pnpm/libvips"), { recursive: true });
    writeFileSync(join(modules, ".pnpm/libvips/library.node"), "fixture");
    symlinkSync("../../../libvips", join(modules, ".pnpm/sharp/node_modules/@img/libvips"));
    const result = spawnSync(process.execPath, [script.pathname], { cwd: root, encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    const nested = join(modules, ".pnpm/sharp/node_modules/@img/libvips");
    assert.equal(lstatSync(nested).isSymbolicLink(), false);
    assert.equal(readFileSync(join(nested, "library.node"), "utf8"), "fixture");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("a missing dependency fails packaging and retains the traced tree", () => {
  const root = mkdtempSync(join(tmpdir(), "search-packaging-"));
  try {
    const modules = join(root, ".next/standalone/node_modules");
    mkdirSync(join(modules, ".pnpm/missing/node_modules/@img"), { recursive: true });
    const link = join(modules, ".pnpm/missing/node_modules/@img/libvips");
    symlinkSync("../../../absent", link);
    const result = spawnSync(process.execPath, [script.pathname], { cwd: root, encoding: "utf8" });
    assert.notEqual(result.status, 0);
    assert.equal(lstatSync(link).isSymbolicLink(), true);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
