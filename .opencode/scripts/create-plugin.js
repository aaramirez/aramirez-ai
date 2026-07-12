#!/usr/bin/env node
import { parseArgs, writeFileNow, showHelp, println } from './create-base.js';
import { resolve } from 'path';

const USAGE = `node .opencode/scripts/create-plugin.js --name <name> --type <npm|local> --output <path> [options]`;
const DESC = 'Creates a plugin configuration for opencode custom tools and hooks.';

const OPTIONS = {
  '--name':             '(required) Plugin name',
  '--type':             '(required) npm or local',
  '--package':          'NPM package name (required for --type npm)',
  '--path':             'Plugin directory path (required for --type local)',
  '--enabled':          'true|false (default: true)',
  '--output':           '(required) Output file path',
  '--dry-run':          'Print file without writing',
  '--help':             'Show this help',
};

function buildPluginEntry(opts) {
  const entry = opts.type === 'npm' ? opts.package : opts.path;
  return JSON.stringify({ plugin: [entry] }, null, 2) + '\n';
}

function buildLocalPluginIndex(name) {
  return `export default {
  name: '${name}',
  hooks: {},
  tools: [],
};
`;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.help) {
    showHelp('create-plugin.js', USAGE, DESC, OPTIONS);
    process.exit(0);
  }

  if (!opts.name) { println('  Error: --name is required'); process.exit(1); }
  if (!opts.type) { println('  Error: --type is required'); process.exit(1); }
  if (!opts.output) { println('  Error: --output is required'); process.exit(1); }

  const validTypes = ['npm', 'local'];
  if (!validTypes.includes(opts.type)) {
    println(`  Error: --type must be one of: ${validTypes.join(', ')}`);
    process.exit(1);
  }

  if (opts.type === 'npm' && !opts.package) {
    println('  Error: --package is required when --type is npm');
    process.exit(1);
  }
  if (opts.type === 'local' && !opts.path) {
    println('  Error: --path is required when --type is local');
    process.exit(1);
  }

  const enabled = opts.enabled !== undefined ? opts.enabled === 'true' : true;

  const content = buildPluginEntry(opts);
  writeFileNow(resolve(opts.output), content, opts.dryRun);

  if (opts.type === 'local') {
    const pluginDir = resolve(`.opencode/plugins/${opts.name}`);
    const indexPath = resolve(pluginDir, 'index.js');
    const indexContent = buildLocalPluginIndex(opts.name);
    writeFileNow(indexPath, indexContent, opts.dryRun);
  }

  println(`  Plugin "${opts.name}" (${opts.type}, enabled: ${enabled}) done.`);
}

main();
