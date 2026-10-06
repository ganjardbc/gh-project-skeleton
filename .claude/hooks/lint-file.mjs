#!/usr/bin/env node
// PostToolUse hook (Edit|Write): lint the file Claude just changed.
// Exit 2 sends the ESLint output back to Claude so it fixes the violation.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();

let input = {};
try {
  input = JSON.parse(readFileSync(0, 'utf8'));
} catch {
  process.exit(0);
}

const file = input.tool_response?.filePath || input.tool_input?.file_path;
if (!file) process.exit(0);

const rel = path.relative(root, path.resolve(root, file)).split(path.sep).join('/');

// Where ESLint runs for each linted area. apps/api has its own config.
const targets = [
  { match: /^apps\/api\/(src|test)\/.+\.ts$/, cwd: 'apps/api' },
  { match: /^(apps\/admin|apps\/landing|packages\/ui)\/.+\.(ts|vue)$/, cwd: '.' },
];

const target = targets.find((t) => t.match.test(rel));
if (!target) process.exit(0);

const cwd = path.join(root, target.cwd);
const result = spawnSync(
  'pnpm',
  ['exec', 'eslint', '--fix', '--no-warn-ignored', path.relative(cwd, path.join(root, rel))],
  { cwd, encoding: 'utf8' },
);

if (result.status === 0) process.exit(0);

process.stderr.write(
  `ESLint failed for ${rel}. Fix these before continuing:\n${result.stdout}${result.stderr}`,
);
process.exit(2);
