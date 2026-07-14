#!/usr/bin/env node
/**
 * create-permission.js — Generate permission configuration for opencode.json
 *
 * Usage:
 *   node .opencode/scripts/create-permission.js --strictness balanced --output ./permission.json
 *   node .opencode/scripts/create-permission.js --dry-run
 *   node .opencode/scripts/create-permission.js --help
 */

import { resolve } from 'path';
import { parseArgs, writeFileNow, showHelp, println } from '../../../scripts/create-base.js';

const USAGE = 'node .opencode/scripts/create-permission.js [options]';
const DESC = 'Generate permission configuration for opencode.json.';

const PROFILES = {
  relaxed: {
    bash: 'allow',
    edit: 'ask',
    read: 'allow',
  },
  balanced: {
    bash: {
      'git *': 'allow',
      'npm *': 'allow',
      'npx *': 'ask',
      '*': 'ask',
    },
    edit: 'ask',
    read: 'allow',
  },
  strict: {
    bash: {
      'git *': 'allow',
      'npm *': 'allow',
      'ls': 'allow',
      'pwd': 'allow',
      'echo *': 'allow',
      'cat *': 'allow',
      'which *': 'allow',
      'node --version': 'allow',
      'npm --version': 'allow',
      'npx *': 'ask',
      '*': 'ask',
    },
    edit: 'ask',
    read: 'allow',
  },
};

function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.help) {
    showHelp('create-permission.js', USAGE, DESC, {
      '--strictness <level>':  'Permission level: relaxed, balanced, strict (default: balanced)',
      '--output <file>':       'Output file path (default: ./permission.json)',
      '--dry-run':             'Print to stdout instead of writing',
      '--help':                'Show this help message',
    });
    process.exit(0);
  }

  const strictness = opts.strictness || 'balanced';
  const output = opts.output || './permission.json';
  const dryRun = opts.dryRun || false;

  if (!PROFILES[strictness]) {
    println(`Error: Unknown strictness level "${strictness}". Use: relaxed, balanced, strict`);
    process.exit(1);
  }

  const permission = PROFILES[strictness];
  const json = JSON.stringify(permission, null, 2) + '\n';

  if (dryRun) {
    println(json);
  } else {
    writeFileNow(resolve(output), json, false);
  }
}

main();
