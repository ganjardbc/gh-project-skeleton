#!/usr/bin/env node
// Stop hook: every permission code the API guards or the admin app checks must be seeded.
// Exit 2 keeps Claude working until a newly introduced code is added to prisma/seed.ts.
//
// Codes that were already unseeded when this check was added are listed in
// permission-baseline.json and only reported with --all:
//   node .claude/hooks/check-permissions.mjs --all
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const showAll = process.argv.includes('--all');

if (!showAll) {
  let input = {};
  try {
    input = JSON.parse(readFileSync(0, 'utf8'));
  } catch {
    // No payload: run anyway.
  }
  // Already continuing because of this hook: do not block a second time.
  if (input.stop_hook_active) process.exit(0);
}

const read = (rel) => readFileSync(path.join(root, rel), 'utf8');

const walk = (rel) =>
  readdirSync(path.join(root, rel), { withFileTypes: true }).flatMap((entry) => {
    const child = `${rel}/${entry.name}`;
    return entry.isDirectory() ? walk(child) : [child];
  });

const seedFile = 'apps/api/prisma/seed.ts';
if (!existsSync(path.join(root, seedFile))) process.exit(0);

const seeded = new Set([...read(seedFile).matchAll(/\bcode:\s*['"]([^'"]+)['"]/g)].map((m) => m[1]));

// code -> files that use it
const used = new Map();
const record = (code, file) => {
  if (!used.has(code)) used.set(code, new Set());
  used.get(code).add(file);
};

// API: decorators at the start of a line, so commented-out and doc examples are skipped.
for (const file of walk('apps/api/src')) {
  if (!file.endsWith('.ts') || file.endsWith('.spec.ts')) continue;
  for (const [, args] of read(file).matchAll(/^\s*@RequirePermission\(([^)]*)\)/gm)) {
    for (const [, code] of args.matchAll(/['"]([^'"]+)['"]/g)) record(code, file);
  }
}

// Admin: the code constants each module declares.
const modulesDir = 'apps/admin/src/modules';
if (existsSync(path.join(root, modulesDir))) {
  for (const entry of readdirSync(path.join(root, modulesDir), { withFileTypes: true })) {
    const file = `${modulesDir}/${entry.name}/services/rbac.ts`;
    if (!entry.isDirectory() || !existsSync(path.join(root, file))) continue;
    for (const [, code] of read(file).matchAll(/['"]([a-z_]+(?:\.[a-z_]+)+)['"]/g)) record(code, file);
  }
}

const baselineFile = path.join(path.dirname(fileURLToPath(import.meta.url)), 'permission-baseline.json');
const baseline = new Set(existsSync(baselineFile) ? JSON.parse(readFileSync(baselineFile, 'utf8')) : []);

const unseeded = [...used.keys()].filter((code) => !seeded.has(code)).sort();
const fresh = unseeded.filter((code) => !baseline.has(code));
const describe = (code) => `  ${code}  (${[...used.get(code)].join(', ')})`;

if (showAll) {
  const known = unseeded.filter((code) => baseline.has(code));
  const stale = [...baseline].filter((code) => !unseeded.includes(code)).sort();
  console.log(`Seeded: ${seeded.size}. Used by API or admin: ${used.size}. Not seeded: ${unseeded.length}.`);
  if (fresh.length) console.log(`\nNot seeded, new:\n${fresh.map(describe).join('\n')}`);
  if (known.length) console.log(`\nNot seeded, in baseline:\n${known.map(describe).join('\n')}`);
  if (stale.length) console.log(`\nIn baseline but no longer a problem (remove from permission-baseline.json):\n  ${stale.join('\n  ')}`);
  process.exit(fresh.length ? 1 : 0);
}

if (fresh.length === 0) process.exit(0);

process.stderr.write(
  `Permission codes are used but not seeded. Add them to permissionsData in ${seedFile} ` +
    `and grant them to the right roles (see the add-permission skill):\n${fresh.map(describe).join('\n')}\n`,
);
process.exit(2);
