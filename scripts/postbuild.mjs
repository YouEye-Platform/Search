import { cpSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { materializeStandalone } from './materialize-standalone.mjs';

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

// Validate and stage the entire traced tree before replacing any dependencies.
// Keep each alias's traced runtime dependencies local when removing pnpm links.
materializeStandalone(standaloneDir, process.cwd());
console.log('\nPostbuild complete!');
console.log(`App directory: ${standaloneDir}`);
