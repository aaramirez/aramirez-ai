#!/usr/bin/env node
import { parseArgs, writeFileNow, showHelp, println } from './create-base.js';

const USAGE = `node shared/scripts/create-agent.js --name <name> --description <desc> [options]`;
const DESC = 'Generates a primary agent markdown file with YAML frontmatter.';

const OPTIONS = {
  '--name':            '(required) Agent name',
  '--description':     '(required) Agent description',
  '--mode':            'primary|all (default: primary)',
  '--model':           'Model identifier (optional)',
  '--temperature':     'Temperature (default: 0.3)',
  '--prompt':          'System prompt text (optional)',
  '--color':           'Theme color (optional)',
  '--edit':            'allow|ask|deny (default: allow)',
  '--bash':            'allow|ask|deny (default: allow)',
  '--read':            'allow|ask|deny (default: allow)',
  '--output':          '(required) Output file path',
  '--dry-run':         'Print file without writing',
  '--help':            'Show this help',
};

function buildYamlFrontmatter(opts) {
  const lines = ['---'];
  lines.push(`description: ${opts.description}`);
  lines.push(`mode: ${opts.mode || 'primary'}`);
  if (opts.temperature) lines.push(`temperature: ${opts.temperature}`);
  if (opts.model) lines.push(`model: ${opts.model}`);
  if (opts.color) lines.push(`color: ${opts.color}`);
  lines.push('permission:');
  lines.push(`  edit: ${opts.edit || 'allow'}`);
  lines.push(`  bash: ${opts.bash || 'allow'}`);
  lines.push(`  read: ${opts.read || 'allow'}`);
  lines.push('---');
  return lines.join('\n');
}

function buildBody(opts) {
  if (opts.prompt) return opts.prompt;
  return `You are ${opts.name}, an AI agent specialized in: ${opts.description}.

Operate according to the following guidelines:
- Mode: ${opts.mode || 'primary'}
- Always respect the permission boundaries defined in the frontmatter.
- Be concise, accurate, and thorough in your responses.
- Follow the user's instructions precisely.`;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.help) {
    showHelp('create-agent.js', USAGE, DESC, OPTIONS);
    process.exit(0);
  }

  if (!opts.name) { println('  Error: --name is required'); process.exit(1); }
  if (!opts.description) { println('  Error: --description is required'); process.exit(1); }
  if (!opts.output) { println('  Error: --output is required'); process.exit(1); }

  if (!opts.temperature) opts.temperature = 0.3;
  if (!opts.edit) opts.edit = 'allow';
  if (!opts.bash) opts.bash = 'allow';
  if (!opts.read) opts.read = 'allow';
  if (!opts.mode) opts.mode = 'primary';

  const validModes = ['primary', 'all'];
  if (!validModes.includes(opts.mode)) {
    println(`  Error: --mode must be one of: ${validModes.join(', ')}`);
    process.exit(1);
  }

  const validPerms = ['allow', 'ask', 'deny'];
  for (const p of ['edit', 'bash', 'read']) {
    if (!validPerms.includes(opts[p])) {
      println(`  Error: --${p} must be one of: ${validPerms.join(', ')}`);
      process.exit(1);
    }
  }

  const frontmatter = buildYamlFrontmatter(opts);
  const body = buildBody(opts);
  const content = `${frontmatter}\n\n${body}\n`;

  writeFileNow(opts.output, content, opts.dryRun);
}

main();
