#!/usr/bin/env node
// PreToolUse hook (Bash): refuse pushes that rewrite or overwrite shared history.
// Ordinary commits and pushes, including to main, are allowed.
// Exit 2 blocks the command and sends the reason back to Claude.
import { readFileSync } from 'node:fs';

let input = {};
try {
  input = JSON.parse(readFileSync(0, 'utf8'));
} catch {
  process.exit(0);
}

const command = input.tool_input?.command;
if (!command || !/\bgit\b/.test(command)) process.exit(0);

const block = (reason) => {
  process.stderr.write(`Blocked: ${reason}\n`);
  process.exit(2);
};

// Drop quoted text so a commit message that mentions "git push --force" is not read as a command.
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

for (const [subcommand, ...args] of invocations) {
  if (subcommand !== 'push') continue;

  // --force-with-lease is allowed: it refuses to overwrite work it has not seen.
  if (args.some((arg) => arg === '--force' || arg === '-f' || arg === '--mirror')) {
    block('this push can overwrite history on the remote. Use --force-with-lease on your own branch, or ask the user to run it.');
  }
  // A leading + on a refspec is a force push for that ref.
  if (args.some((arg) => !arg.startsWith('-') && arg.startsWith('+'))) {
    block('a refspec starting with + force-pushes that ref. Ask the user to run it.');
  }
}

process.exit(0);
