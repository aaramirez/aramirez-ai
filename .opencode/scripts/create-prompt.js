#!/usr/bin/env node
import { parseArgs, writeFileNow, showHelp, println } from './create-base.js';

const USAGE = `node shared/scripts/create-prompt.js --name <name> --content "<text>" --output <path> [options]`;
const DESC = 'Creates a reusable prompt fragment markdown file.';

const OPTIONS = {
  '--name':            '(required) Filename without .md',
  '--content':         '(required) The prompt text',
  '--output':          '(required) Output file path',
  '--dry-run':         'Print file without writing',
  '--help':            'Show this help',
};

function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.help) {
    showHelp('create-prompt.js', USAGE, DESC, OPTIONS);
    process.exit(0);
  }

  if (!opts.name) { println('  Error: --name is required'); process.exit(1); }
  if (!opts.content) { println('  Error: --content is required'); process.exit(1); }
  if (!opts.output) { println('  Error: --output is required'); process.exit(1); }

  const content = `# ${opts.name}\n\n${opts.content}\n`;

  writeFileNow(opts.output, content, opts.dryRun);
}

main();
