import { cpSync, existsSync, readdirSync, lstatSync, readlinkSync, rmSync, mkdirSync, symlinkSync } from 'fs';
import { join, resolve, dirname } from 'path';

const standaloneDir = join(process.cwd(), '.next', 'standalone');

if (!existsSync(standaloneDir)) {
  console.error('Standalone directory not found. Run next build first.');
  process.exit(1);
}

// Copy .next/static to standalone
const staticSrc = join(process.cwd(), '.next', 'static');
const staticDest = join(standaloneDir, '.next', 'static');
if (existsSync(staticSrc)) {
  console.log('Copying .next/static to standalone...');
  cpSync(staticSrc, staticDest, { recursive: true });
  console.log('Done copying static assets');
}

// Copy public/ to standalone
const publicSrc = join(process.cwd(), 'public');
const publicDest = join(standaloneDir, 'public');
if (existsSync(publicSrc)) {
  console.log('Copying public/ to standalone...');
  cpSync(publicSrc, publicDest, { recursive: true });
} else {
  console.log('No public/ folder found, skipping');
}

// Fix pnpm modules — hoist packages from .pnpm store to top-level node_modules
const pnpmDir = join(standaloneDir, 'node_modules', '.pnpm');
if (existsSync(pnpmDir)) {
  console.log('Hoisting pnpm packages to top-level node_modules...');
  const pnpmEntries = readdirSync(pnpmDir);
  for (const pnpmEntry of pnpmEntries) {
    const nmDir = join(pnpmDir, pnpmEntry, 'node_modules');
    if (!existsSync(nmDir)) continue;
    const pkgs = readdirSync(nmDir);
    for (const pkg of pkgs) {
      if (pkg === '.pnpm' || pkg === '.package-lock.json') continue;
      const pkgSrc = join(nmDir, pkg);
      const pkgDest = join(standaloneDir, 'node_modules', pkg);
      if (existsSync(pkgDest)) continue; // already hoisted
      const stat = lstatSync(pkgSrc);
      const realSrc = stat.isSymbolicLink() ? resolve(dirname(pkgSrc), readlinkSync(pkgSrc)) : pkgSrc;
      if (existsSync(realSrc)) {
        console.log(`  Hoisting ${pkg}...`);
        cpSync(realSrc, pkgDest, { recursive: true });
      }
    }
  }
  console.log('Done hoisting pnpm packages');
} else {
  console.log('No .pnpm directory found, skipping');
}

// Resolve symlinks in top-level node_modules
const topModules = join(standaloneDir, 'node_modules');
if (existsSync(topModules)) {
  console.log('Resolving symlinks in node_modules...');
  const entries = readdirSync(topModules);
  for (const entry of entries) {
    if (entry === '.pnpm' || entry.startsWith('.')) continue;
    const entryPath = join(topModules, entry);
    const stat = lstatSync(entryPath);
    if (stat.isSymbolicLink()) {
      const target = resolve(dirname(entryPath), readlinkSync(entryPath));
      if (existsSync(target)) {
        console.log(`  Resolving ${entry}...`);
        rmSync(entryPath, { recursive: true, force: true });
        cpSync(target, entryPath, { recursive: true });
      }
    }
  }
  console.log('Done resolving symlinks');
}

console.log('\nPostbuild complete!');
console.log(`App directory: ${standaloneDir}`);
