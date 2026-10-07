// Git pre-push hook: typecheck and test the workspaces changed by the commits being pushed.
// Skip once with: git push --no-verify
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const git = (args) => spawnSync('git', args, { cwd: root, encoding: 'utf8' });

// Compare with the upstream branch, or with origin/main for a branch that has none yet.
// PRE_PUSH_BASE overrides the base, for trying the hook out.
const base = [process.env.PRE_PUSH_BASE, '@{upstream}', 'origin/main', 'origin/master']
  .filter(Boolean)
  .find((ref) => git(['rev-parse', '--verify', '--quiet', ref]).status === 0);
if (!base) process.exit(0);

const changed = git(['diff', '--name-only', `${base}...HEAD`]).stdout.split('\n').filter(Boolean);
if (changed.length === 0) process.exit(0);

const workspaces = {
  'apps/api/': 'gh-skeleton-api',
  'apps/admin/': 'gh-skeleton-app',
  'apps/landing/': '@gh-skeleton/landing',
};
// Workspaces that define a test script.
const tested = ['gh-skeleton-api', 'gh-skeleton-app', '@gh-skeleton/ui'];

// A shared package affects every app that consumes it.
const everything = changed.some((file) => file.startsWith('packages/'));
const affected = everything
  ? [...Object.values(workspaces), '@gh-skeleton/ui']
  : Object.entries(workspaces)
      .filter(([prefix]) => changed.some((file) => file.startsWith(prefix)))
      .map(([, name]) => name);
if (affected.length === 0) process.exit(0);

const run = (label, args) => {
  console.log(`\npre-push: ${label}`);
  return spawnSync('pnpm', args, { cwd: root, stdio: 'inherit' }).status === 0;
};

const filters = affected.map((name) => `--filter=${name}`);
let ok = run(`typecheck ${affected.join(', ')}`, [
  'exec', 'turbo', 'run', 'typecheck', '--output-logs=errors-only', ...filters,
]);

for (const name of affected.filter((workspace) => tested.includes(workspace))) {
  ok = run(`test ${name}`, ['--filter', name, 'test']) && ok;
}

if (!ok) {
  console.error('\npre-push failed. Fix the problems above, or push with --no-verify to skip the check.');
  process.exit(1);
}
