#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'fs';
import { dirname } from 'path';

export function parseArgs(args) {
  const opts = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--help') { opts.help = true; continue; }
    if (a === '--dry-run') { opts.dryRun = true; continue; }
    if (a === '--verbose') { opts.verbose = true; continue; }
    if (a.startsWith('--') && i + 1 < args.length && !args[i + 1].startsWith('--')) {
      opts[a.slice(2)] = args[++i];
    } else if (a.startsWith('--')) {
      opts[a.slice(2)] = true;
    }
  }
  return opts;
}

export const println = (txt) => process.stdout.write(txt + '\n');
export const warn = (txt) => process.stderr.write('⚠ ' + txt + '\n');

let pending = Promise.resolve();
export function writeFile(path, content, dryRun) {
  pending = pending.then(async () => {
    if (dryRun) {
      println(`--- ${path} ---`);
      println(content);
      return;
    }
    const { mkdirSync, writeFileSync } = await import('fs');
    const { dirname } = await import('path');
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content, 'utf8');
    println(`  ✓ Created ${path}`);
  });
  return pending;
}

export function writeFileNow(path, content, dryRun) {
  if (dryRun) {
    println(`--- ${path} ---`);
    println(content);
    return;
  }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, 'utf8');
  println(`  ✓ Created ${path}`);
}

export function showHelp(name, usage, description, options) {
  println(`\n  ${name}\n`);
  println(`  ${description}`);
  println(`\n  Usage:\n    ${usage}`);
  println(`\n  Options:`);
  for (const [flag, desc] of Object.entries(options)) {
    println(`    ${flag.padEnd(30)} ${desc}`);
  }
  println('');
}
