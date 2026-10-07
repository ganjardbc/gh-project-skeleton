#!/usr/bin/env node
// Stop hook: run the tests related to uncommitted changes in apps/api (Jest) and apps/admin (Vitest).
// Exit 2 keeps Claude working until the tests pass.
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
  .filter(Boolean);

const failures = [];
const run = (args) => {
  const result = spawnSync('pnpm', args, { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) failures.push(`${result.stdout}${result.stderr}`);
};

// --onlyChanged limits the run to tests that import a changed file.
if (changed.some((file) => /^apps\/api\/(src|prisma)\/.+\.ts$/.test(file))) {
  run(['--filter', 'gh-skeleton-api', 'exec', 'jest', '--onlyChanged', '--passWithNoTests']);
}

// `vitest related` does the same for the admin app; it takes paths relative to the app.
const admin = changed
  .filter((file) => /^apps\/admin\/src\/.+\.(ts|vue)$/.test(file))
  .map((file) => file.slice('apps/admin/'.length));
if (admin.length > 0) {
  run(['--filter', 'gh-skeleton-app', 'exec', 'vitest', 'related', '--run', '--passWithNoTests', ...admin]);
}

if (failures.length === 0) process.exit(0);

process.stderr.write(
  `Tests failed. Fix the code, not the assertions, before finishing:\n${failures.join('\n')}`,
);
process.exit(2);
