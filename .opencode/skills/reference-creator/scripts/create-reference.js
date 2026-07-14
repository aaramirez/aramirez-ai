#!/usr/bin/env node
import { parseArgs, writeFileNow, showHelp, println } from '../../../scripts/create-base.js';

const USAGE = `node .opencode/scripts/create-reference.js --name <name> --path <path> --description <desc> --output <path> [options]`;
const DESC = 'Creates a reference configuration entry for opencode.json.';

const OPTIONS = {
  '--name':            '(required) Reference name/key',
  '--path':            '(required) Path value',
  '--description':     '(required) Description string',
  '--output':          '(required) Output file path',
  '--dry-run':         'Print file without writing',
  '--help':            'Show this help',
};

function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.help) {
    showHelp('create-reference.js', USAGE, DESC, OPTIONS);
    process.exit(0);
  }

  if (!opts.name) { println('  Error: --name is required'); process.exit(1); }
  if (!opts.path) { println('  Error: --path is required'); process.exit(1); }
  if (!opts.description) { println('  Error: --description is required'); process.exit(1); }
  if (!opts.output) { println('  Error: --output is required'); process.exit(1); }

  const json = JSON.stringify({ [opts.name]: { path: opts.path, description: opts.description } }, null, 2);
  const content = `${json}\n`;

  writeFileNow(opts.output, content, opts.dryRun);
}

main();
