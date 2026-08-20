import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'));

const run = (args, cwd) => execFileSync('npm', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const node = (args, cwd) => execFileSync(process.execPath, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const firstLine = (error) => String(error.stderr ?? error.message).trim().split('\n').find((line) => line.trim()) ?? 'failed';

const staging = mkdtempSync(join(tmpdir(), 'rf-smoke-'));
const failures = [];

try {
  const tarball = JSON.parse(run(['pack', '--json', '--pack-destination', staging], packageRoot))[0].filename;

  writeFileSync(join(staging, 'package.json'), JSON.stringify({ name: 'rf-smoke', private: true, version: '1.0.0' }));
  run(['install', '--no-audit', '--no-fund', '--no-save', join(staging, tarball)], staging);

  const installed = join(staging, 'node_modules', pkg.name);

  for (const [subpath, conditions] of Object.entries(pkg.exports)) {
    if (subpath.includes('*') || subpath === './package.json') continue;

    const specifier = subpath === '.' ? pkg.name : `${pkg.name}/${subpath.slice(2)}`;
    const targets = typeof conditions === 'string' ? { asset: conditions } : conditions;

    for (const [condition, target] of Object.entries(targets)) {
      try {
        readFileSync(join(installed, target));
      } catch {
        failures.push(`${condition} "${specifier}" -> ${target} is missing from the tarball`);
        continue;
      }

      if (condition === 'import') {
        try {
          node(['--input-type=module', '-e', `await import(${JSON.stringify(specifier)})`], staging);
        } catch (error) {
          failures.push(`import "${specifier}": ${firstLine(error)}`);
        }
      }

      if (condition === 'require') {
        try {
          node(['-e', `require(${JSON.stringify(specifier)})`], staging);
        } catch (error) {
          failures.push(`require "${specifier}": ${firstLine(error)}`);
        }
      }
    }
  }

  for (const field of ['main', 'module', 'types', 'unpkg']) {
    try {
      readFileSync(join(installed, pkg[field]));
    } catch {
      failures.push(`${field} "${pkg[field]}" is missing from the tarball`);
    }
  }

  const components = await import(pathToFileURL(join(installed, 'dist/components/index.js')).href);
  if (typeof components.defineCustomElements !== 'function') {
    failures.push('"./components" does not export defineCustomElements()');
  }

  const declarations = readFileSync(join(installed, pkg.types), 'utf8');
  for (const type of ['RecipeCardData', 'FilterGroup', 'FilterOption', 'TagTone']) {
    if (!declarations.includes(type)) {
      failures.push(`root types do not re-export ${type}`);
    }
  }
} finally {
  rmSync(staging, { recursive: true, force: true });
}

if (failures.length) {
  console.error(`Package smoke check failed for ${pkg.name}@${pkg.version}:`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(`Package smoke check passed for ${pkg.name}@${pkg.version}.`);
