#!/usr/bin/env node
import { parseArgs, writeFileNow, showHelp, println } from './create-base.js';

const opts = parseArgs(process.argv.slice(2));

if (opts.help) {
  showHelp(
    'create-command',
    'node shared/scripts/create-command.js --name <name> --description <desc> --template <tmpl> --output <path>',
    'Generate a custom command entry for opencode.json.',
    {
      '--name':        'Command name (required)',
      '--description': 'Command description (required)',
      '--template':    'Instruction template (required)',
      '--agent':       'Optional agent name',
      '--model':       'Optional model override',
      '--output':      'Output file path (required)',
      '--dry-run':     'Print output instead of writing',
      '--help':        'Show this help',
    }
  );
  process.exit(0);
}

const { name, description, template, agent, model, output, dryRun } = opts;

if (!name || !description || !template || !output) {
  println('Error: --name, --description, --template, and --output are required');
  process.exit(1);
}

const entry = { [name]: { description, template } };
if (agent) entry[name].agent = agent;
if (model) entry[name].model = model;

writeFileNow(output, JSON.stringify(entry, null, 2) + '\n', dryRun);
