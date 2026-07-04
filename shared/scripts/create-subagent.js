#!/usr/bin/env node
import { parseArgs, writeFileNow, showHelp, println } from './create-base.js';

const USAGE = `node shared/scripts/create-subagent.js --name <name> --description <desc> [options]`;
const DESC = 'Generates a subagent markdown file (mode: subagent).';

const OPTIONS = {
  '--name':        '(required) Subagent name',
  '--description': '(required) Subagent description',
  '--read-only':   'Flag: sets edit=deny, bash=ask',
  '--model':       'Model identifier (optional)',
  '--temperature': 'Temperature (default: 0.3)',
  '--hidden':      'Flag: sets hidden: true',
  '--prompt':      'System prompt text (optional)',
  '--output':      '(required) Output file path',
  '--dry-run':     'Print file without writing',
  '--help':        'Show this help',
};

function buildYamlFrontmatter(opts) {
  const lines = ['---'];
  lines.push(`description: ${opts.description}`);
  lines.push('mode: subagent');
  if (opts.temperature) lines.push(`temperature: ${opts.temperature}`);
  if (opts.model) lines.push(`model: ${opts.model}`);
  if (opts.hidden) lines.push('hidden: true');
  lines.push('permission:');
  lines.push(`  edit: ${opts.edit}`);
  lines.push(`  bash: ${opts.bash}`);
  lines.push(`  read: ${opts.read}`);
  lines.push('---');
  return lines.join('\n');
}

function buildBody(opts) {
  if (opts.prompt) return opts.prompt;
  return `You are ${opts.name}, a subagent specialized in: ${opts.description}.

As a subagent, your role is to assist the primary agent by focusing on your specific domain.
- Mode: subagent
- Stay within your designated scope.
- Report findings clearly and concisely.
- Respect all permission boundaries.`;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.help) {
    showHelp('create-subagent.js', USAGE, DESC, OPTIONS);
    process.exit(0);
  }

  if (!opts.name) { println('  Error: --name is required'); process.exit(1); }
  if (!opts.description) { println('  Error: --description is required'); process.exit(1); }
  if (!opts.output) { println('  Error: --output is required'); process.exit(1); }

  if (!opts.temperature) opts.temperature = 0.3;

  if (opts['read-only']) {
    opts.edit = 'deny';
    opts.bash = 'ask';
    opts.read = 'allow';
  } else {
    if (!opts.edit) opts.edit = 'allow';
    if (!opts.bash) opts.bash = 'allow';
    if (!opts.read) opts.read = 'allow';
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
