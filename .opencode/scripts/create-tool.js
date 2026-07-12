#!/usr/bin/env node
import { parseArgs, writeFileNow, showHelp, println } from './create-base.js';
import { resolve } from 'path';

const USAGE = `node .opencode/scripts/create-tool.js --name <name> --description <desc> --schema <json> --output <path> [options]`;
const DESC = 'Creates a custom tool definition for opencode.';

const OPTIONS = {
  '--name':         '(required) Tool name',
  '--description':  '(required) Tool description',
  '--schema':       '(required) JSON input schema string',
  '--handler':      'Path to handler code (optional)',
  '--output':       '(required) Output file path',
  '--dry-run':      'Print file without writing',
  '--help':         'Show this help',
};

function buildToolDefinition(opts) {
  let schema;
  try {
    schema = JSON.parse(opts.schema);
  } catch {
    println('  Error: --schema must be valid JSON');
    process.exit(1);
  }

  const def = {
    [opts.name]: {
      description: opts.description,
      schema,
    },
  };

  if (opts.handler) {
    def[opts.name].handler = opts.handler;
  }

  return JSON.stringify(def, null, 2) + '\n';
}

function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.help) {
    showHelp('create-tool.js', USAGE, DESC, OPTIONS);
    process.exit(0);
  }

  if (!opts.name) { println('  Error: --name is required'); process.exit(1); }
  if (!opts.description) { println('  Error: --description is required'); process.exit(1); }
  if (!opts.schema) { println('  Error: --schema is required'); process.exit(1); }
  if (!opts.output) { println('  Error: --output is required'); process.exit(1); }

  const content = buildToolDefinition(opts);
  writeFileNow(resolve(opts.output), content, opts.dryRun);
  println(`  Tool "${opts.name}" definition created.`);
}

main();
