#!/usr/bin/env node
// Stop hook: run the Jest tests related to uncommitted apps/api changes.
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
  .some((file) => file && /^apps\/api\/(src|prisma)\/.+\.ts$/.test(file));
if (!changed) process.exit(0);

// --onlyChanged limits the run to tests that import a changed file.
const result = spawnSync(
  'pnpm',
  ['--filter', 'gh-skeleton-api', 'exec', 'jest', '--onlyChanged', '--passWithNoTests'],
  { cwd: root, encoding: 'utf8' },
);
if (result.status === 0) process.exit(0);

process.stderr.write(
  `Tests failed. Fix the code, not the assertions, before finishing:\n${result.stdout}${result.stderr}`,
);
process.exit(2);
