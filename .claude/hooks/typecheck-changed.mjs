#!/usr/bin/env node
// Stop hook: typecheck the workspaces that have uncommitted source changes.
// Exit 2 keeps Claude working until the type errors are fixed.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();

let input = {};
try {
  input = JSON.parse(readFileSync(0, 'utf8'));
} catch {
  // No payload: run anyway.
}
// Already continuing because of this hook: do not block a second time.
if (input.stop_hook_active) process.exit(0);

const status = spawnSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' });
if (status.status !== 0) process.exit(0);

const changed = status.stdout
  .split('\n')
  .map((line) => line.slice(3).split(' -> ').pop())
  .filter((file) => file && /\.(ts|vue|prisma)$/.test(file));

const workspaces = {
  'apps/api/': 'gh-skeleton-api',
  'apps/admin/': 'gh-skeleton-app',
  'apps/landing/': '@gh-skeleton/landing',
};

const filters = new Set();
for (const file of changed) {
  // A shared package affects every app that consumes it.
  if (file.startsWith('packages/')) {
    filters.clear();
    filters.add('*');
    break;
  }
  const prefix = Object.keys(workspaces).find((p) => file.startsWith(p));
  if (prefix) filters.add(workspaces[prefix]);
}
if (filters.size === 0) process.exit(0);

const args = ['exec', 'turbo', 'run', 'typecheck', '--output-logs=errors-only'];
if (!filters.has('*')) for (const name of filters) args.push(`--filter=${name}`);

const result = spawnSync('pnpm', args, { cwd: root, encoding: 'utf8' });
if (result.status === 0) process.exit(0);

process.stderr.write(
  `Typecheck failed. Fix these type errors before finishing:\n${result.stdout}${result.stderr}`,
);
process.exit(2);
