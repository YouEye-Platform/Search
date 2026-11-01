import { chmodSync, copyFileSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, renameSync, rmSync, utimesSync } from 'node:fs';
import { basename, dirname, isAbsolute, join, relative, resolve } from 'node:path';

function within(root, target) {
  const suffix = relative(root, target);
  return suffix === '' || (!isAbsolute(suffix) && suffix !== '..' && !suffix.startsWith('../'));
}

/** Produce a self-contained ordinary-file tree for the verified artifact packager. */
export function materializeStandalone(standalone, project) {
  const root = realpathSync(standalone);
  const dependencies = resolve(project, 'node_modules');
  function validate(directory, ancestors = new Set()) {
    const canonical = realpathSync(directory);
    if (ancestors.has(canonical)) throw new Error('Cyclic standalone dependency');
    const next = new Set(ancestors).add(canonical);
    for (const name of readdirSync(directory)) {
      const entry = join(directory, name);
      const stat = lstatSync(entry);
      if (stat.isSymbolicLink()) {
        const target = realpathSync(entry); // Dangling links must fail.
        if (!within(root, target) && !within(dependencies, target)) {
          throw new Error('Standalone dependency escapes the selected source');
        }
        if (lstatSync(target).isDirectory()) validate(target, next);
      } else if (stat.isDirectory()) validate(entry, next);
      else if (!stat.isFile()) throw new Error('Unsupported standalone file type');
    }
  }
  validate(root);
  const temporary = mkdtempSync(join(dirname(root), '.standalone-materialized-'));
  try {
    const ready = join(temporary, 'tree');
    function copy(source, destination, packageAncestors = new Set()) {
      const canonical = realpathSync(source);
      const stat = lstatSync(canonical);
      if (stat.isDirectory()) {
        mkdirSync(destination);
        for (const name of readdirSync(canonical)) copy(join(canonical, name), join(destination, name), packageAncestors);
        // Node resolves a pnpm alias from its real package directory. Once the
        // alias becomes an ordinary directory, retain its traced dependency
        // context locally instead of hoisting potentially conflicting versions.
        if (lstatSync(source).isSymbolicLink() && existsSync(join(canonical, 'package.json'))) {
          let context = dirname(canonical);
          if (basename(context).startsWith('@')) context = dirname(context);
          if (basename(context) === 'node_modules') {
            const pkg = JSON.parse(readFileSync(join(canonical, 'package.json'), 'utf8'));
            const names = new Set([
              ...Object.keys(pkg.dependencies || {}),
              ...Object.keys(pkg.optionalDependencies || {}),
              ...Object.keys(pkg.peerDependencies || {}),
            ]);
            const ancestors = new Set(packageAncestors).add(canonical);
            for (const name of [...names].sort()) {
              if (!/^(?:@[a-z0-9._-]+\/)?[a-z0-9][a-z0-9._-]*$/i.test(name)) {
                throw new Error('Invalid standalone dependency name');
              }
              const dependency = join(context, name);
              const packaged = join(destination, 'node_modules', name);
              // Next's trace may omit unused or optional packages. Preserve its
              // selected closure and any existing package-local dependencies.
              if (!lstatSync(dependency, { throwIfNoEntry: false }) || existsSync(packaged)) continue;
              const target = realpathSync(dependency);
              if (!within(root, target) && !within(dependencies, target)) {
                throw new Error('Standalone dependency escapes the selected source');
              }
              // A back edge resolves to the already copied ancestor package.
              if (ancestors.has(target)) continue;
              validate(dependency);
              mkdirSync(dirname(packaged), { recursive: true });
              copy(dependency, packaged, ancestors);
            }
          }
        }
      } else {
        copyFileSync(canonical, destination);
      }
      chmodSync(destination, stat.mode & 0o777);
      utimesSync(destination, stat.atime, stat.mtime);
    }
    copy(root, ready);
    // Copy and validation must succeed before replacing the generated tree.
    rmSync(root, { recursive: true });
    renameSync(ready, root);
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
}
