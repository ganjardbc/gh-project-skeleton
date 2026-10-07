// Git pre-commit hook: lint the staged files and check permission codes against the seed.
// These are the fast checks. Typecheck and tests run in pre-push.
// Skip once with: git commit --no-verify
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const staged = spawnSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR'], {
  cwd: root,
  encoding: 'utf8',
})
  .stdout.split('\n')
  .filter(Boolean);

// Where ESLint runs for each linted area. apps/api has its own config.
const targets = [
  { match: /^apps\/api\/(src|test)\/.+\.ts$/, cwd: 'apps/api' },
  { match: /^(apps\/admin|apps\/landing|packages\/ui)\/.+\.(ts|vue)$/, cwd: '.' },
];

let failed = false;

for (const target of targets) {
  const files = staged.filter((file) => target.match.test(file));
  if (files.length === 0) continue;
  const cwd = path.join(root, target.cwd);
  // No --fix here: a fix would change files after they were staged.
  const result = spawnSync(
    'pnpm',
    ['exec', 'eslint', '--no-warn-ignored', ...files.map((file) => path.relative(cwd, path.join(root, file)))],
    { cwd, stdio: 'inherit' },
  );
  if (result.status !== 0) failed = true;
}

const permissions = spawnSync('node', [path.join(root, '.claude/hooks/check-permissions.mjs')], {
  cwd: root,
  input: '{}',
  stdio: ['pipe', 'inherit', 'inherit'],
  env: { ...process.env, CLAUDE_PROJECT_DIR: root },
});
if (permissions.status !== 0) failed = true;

if (failed) {
  console.error('\npre-commit failed. Fix the problems above, or commit with --no-verify to skip the check.');
  process.exit(1);
}
