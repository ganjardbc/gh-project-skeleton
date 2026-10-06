#!/usr/bin/env node
// PreToolUse hook (Bash): keep Claude off the deploy branch.
// A push to main deploys the API to the VPS and runs `prisma migrate deploy`
// (.github/workflows/ci.yml, job deploy-api), so commits and pushes there are the user's call.
// Exit 2 blocks the command and sends the reason back to Claude.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const PROTECTED = ['main', 'master'];

let input = {};
try {
  input = JSON.parse(readFileSync(0, 'utf8'));
} catch {
  process.exit(0);
}

const command = input.tool_input?.command;
if (!command || !/\bgit\b/.test(command)) process.exit(0);

const cwd = input.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd();

const block = (reason) => {
  process.stderr.write(`Blocked: ${reason}\n`);
  process.exit(2);
};

// Drop quoted text so a commit message that mentions "git push" is not read as a command.
const unquoted = command.replace(/'[^']*'/g, "''").replace(/"(?:[^"\\]|\\.)*"/g, '""');

// One entry per git invocation: [subcommand, ...arguments].
const invocations = unquoted
  .split(/&&|\|\||[;|\n]/)
  .map((segment) => segment.trim().split(/\s+/))
  .map((words) => {
    let i = 0;
    while (/^\w+=/.test(words[i] ?? '') || words[i] === 'rtk') i += 1;
    if (words[i] !== 'git') return null;
    i += 1;
    // Global options that take a value: git -C <dir> -c <key=value> ...
    while (words[i] === '-C' || words[i] === '-c') i += 2;
    return words.slice(i);
  })
  .filter((words) => words && words.length > 0);

if (invocations.length === 0) process.exit(0);

// --show-current also works on a branch with no commits yet.
const head = spawnSync('git', ['branch', '--show-current'], { cwd, encoding: 'utf8' });
const branch = head.status === 0 ? head.stdout.trim() : '';
const onProtected = PROTECTED.includes(branch);

for (const [subcommand, ...args] of invocations) {
  if (subcommand === 'commit' && onProtected) {
    block(
      `the current branch is ${branch}, and a push to ${branch} deploys the API. ` +
        'Create a branch first (git switch -c <name>), or ask the user to commit here themselves.',
    );
  }

  if (subcommand !== 'push') continue;

  if (args.some((arg) => arg === '--force' || arg === '-f')) {
    block('force push rewrites shared history. Ask the user to run it.');
  }
  if (args.some((arg) => arg === '--all' || arg === '--mirror')) {
    block(`this push includes ${PROTECTED.join('/')}, which deploys the API. Ask the user to run it.`);
  }

  // Positional arguments are <remote> [<refspec>...]. No refspec means the current branch.
  const refspecs = args.filter((arg) => !arg.startsWith('-')).slice(1);
  const targets = refspecs.length
    ? refspecs.map((spec) => spec.split(':').pop().replace(/^\+/, '').replace(/^refs\/heads\//, ''))
    : [branch];

  const target = targets.find((name) => PROTECTED.includes(name));
  if (target) {
    block(
      `pushing to ${target} deploys the API to the VPS and runs database migrations. ` +
        'Push a feature branch instead, or ask the user to push it themselves.',
    );
  }
}

process.exit(0);
