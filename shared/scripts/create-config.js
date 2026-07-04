#!/usr/bin/env node
/**
 * create-config.js — Generate opencode.json base configuration
 *
 * Usage:
 *   node shared/scripts/create-config.js --model anthropic/claude-sonnet-4-6 --shell /bin/zsh --output ./opencode.json
 *   node shared/scripts/create-config.js --dry-run
 *   node shared/scripts/create-config.js --help
 */

import { resolve } from 'path';
import { parseArgs, writeFileNow, showHelp, println } from './create-base.js';

const USAGE = 'node shared/scripts/create-config.js [options]';
const DESC = 'Generate an opencode.json base configuration file.';

function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.help) {
    showHelp('create-config.js', USAGE, DESC, {
      '--model <name>':        'Model name (default: opencode/big-pickle)',
      '--small-model <name>':  'Small model name (default: anthropic/claude-haiku-4-5)',
      '--shell <path>':        'Shell path (default: /bin/zsh)',
      '--default-agent <name>':'Default agent name (default: build)',
      '--formatter':           'Enable formatter (default: true)',
      '--lsp':                 'Enable LSP (default: true)',
      '--auto-compact':        'Enable auto compaction (default: true)',
      '--tail-turns <n>':      'Compaction tail turns (default: 10)',
      '--output <file>':       'Output file path (default: ./opencode.json)',
      '--dry-run':             'Print to stdout instead of writing',
      '--help':                'Show this help message',
    });
    process.exit(0);
  }

  const model = opts.model || 'opencode/big-pickle';
  const small_model = opts['small-model'] || 'anthropic/claude-haiku-4-5';
  const shell = opts.shell || '/bin/zsh';
  const defaultAgent = opts['default-agent'] || 'build';
  const formatter = opts.formatter !== undefined ? Boolean(opts.formatter) : true;
  const lsp = opts.lsp !== undefined ? Boolean(opts.lsp) : true;
  const autoCompact = opts['auto-compact'] !== undefined ? Boolean(opts['auto-compact']) : true;
  const tailTurns = opts['tail-turns'] !== undefined ? Number(opts['tail-turns']) : 10;
  const output = opts.output || './opencode.json';
  const dryRun = opts.dryRun || false;

  const config = {
    $schema: 'https://opencode.ai/config.json',
    model,
    small_model,
    default_agent: defaultAgent,
    shell,
    instructions: ['AGENTS.md'],
    skills: {
      paths: [
        '.opencode/skills',
        '~/.config/opencode/skills',
      ],
    },
    references: {
      'shared-scripts': {
        path: '../shared/scripts',
        description: 'Reusable automation scripts (deploy, test, etc.)',
      },
      'shared-rules': {
        path: '../shared/rules',
        description: 'Coding standards, architecture, and documentation rules',
      },
      'shared-prompts': {
        path: '../shared/prompts',
        description: 'Reusable prompt fragments for common patterns',
      },
    },
    agent: {},
    command: {},
    mcp: {},
    permission: {
      bash: {
        'git *': 'allow',
        'npm *': 'allow',
        'npx *': 'ask',
        '*': 'ask',
      },
      edit: 'ask',
      read: 'allow',
    },
    formatter,
    lsp,
    compaction: {
      auto: autoCompact,
      tail_turns: tailTurns,
    },
    tool_output: {
      max_lines: 1000,
      max_bytes: 40960,
    },
  };

  const json = JSON.stringify(config, null, 2) + '\n';

  if (dryRun) {
    println(json);
  } else {
    writeFileNow(resolve(output), json, false);
  }
}

main();
