#!/usr/bin/env node
// PreToolUse hook (Edit|Write): refuse edits to env files and committed migrations.
// Exit 2 blocks the tool call and sends the reason back to Claude.
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

const file = input.tool_input?.file_path;
if (!file) process.exit(0);

const rel = path.relative(root, path.resolve(root, file)).split(path.sep).join('/');
if (rel.startsWith('..')) process.exit(0);

const block = (reason) => {
  process.stderr.write(`Blocked edit to ${rel}. ${reason}\n`);
  process.exit(2);
};

// Real env files hold secrets. The templates (.env.example, .env.sample) stay editable.
const name = path.basename(rel);
if (/^\.env(\..+)?$/.test(name) && !/\.(example|sample)$/.test(name)) {
  block('Env files hold secrets: ask the user to change it, and update the .env.example or .env.sample template instead.');
}

// A migration tracked by git has been shared and may be applied elsewhere.
// A new, untracked migration (prisma migrate dev --create-only) stays editable.
if (/^apps\/api\/prisma\/migrations\/.+/.test(rel)) {
  const tracked = spawnSync('git', ['ls-files', '--error-unmatch', '--', rel], { cwd: root });
  if (tracked.status === 0) {
    block('This migration is committed. Never edit an applied migration: add a new one (see the db-migration skill).');
  }
}

process.exit(0);
