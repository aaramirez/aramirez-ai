#!/usr/bin/env node
import { parseArgs, writeFileNow, showHelp, println } from './create-base.js';

const raw = process.argv.slice(2);
const opts = parseArgs(raw);

if (opts.help) {
  showHelp(
    'create-mcp',
    'node shared/scripts/create-mcp.js --name <name> --type <local|remote> [--command <cmd>|--url <url>] --output <path>',
    'Generate an MCP server configuration JSON entry.',
    {
      '--name':      'Server name (required)',
      '--type':      '"local" or "remote" (required)',
      '--command':   'Command to run (required for local)',
      '--url':       'URL endpoint (required for remote)',
      '--env':       'Environment variable (repeatable, KEY=VALUE)',
      '--header':    'HTTP header (repeatable, Key=Value)',
      '--enabled':   'Enable flag (default: true)',
      '--output':    'Output file path (required)',
      '--dry-run':   'Print output instead of writing',
      '--help':      'Show this help',
    }
  );
  process.exit(0);
}

function collect(raw, flag) {
  const vals = [];
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] === flag && i + 1 < raw.length && !raw[i + 1].startsWith('--')) {
      vals.push(raw[++i]);
    }
  }
  return vals;
}

const { name, type, command, url, output, dryRun } = opts;
const enabled = opts.enabled !== 'false';

if (!name || !type || !output) {
  println('Error: --name, --type, and --output are required');
  process.exit(1);
}
if (type !== 'local' && type !== 'remote') {
  println('Error: --type must be "local" or "remote"');
  process.exit(1);
}
if (type === 'local' && !command) {
  println('Error: --command is required for local type');
  process.exit(1);
}
if (type === 'remote' && !url) {
  println('Error: --url is required for remote type');
  process.exit(1);
}

const env = {};
for (const pair of collect(raw, '--env')) {
  const idx = pair.indexOf('=');
  if (idx === -1) { println(`Error: --env must be KEY=VALUE, got: ${pair}`); process.exit(1); }
  env[pair.slice(0, idx)] = pair.slice(idx + 1);
}

const headers = {};
for (const h of collect(raw, '--header')) {
  const idx = h.indexOf('=');
  if (idx === -1) { println(`Error: --header must be Key=Value, got: ${h}`); process.exit(1); }
  headers[h.slice(0, idx)] = h.slice(idx + 1);
}

const config = type === 'local'
  ? { [name]: { type: 'local', command: command.split(/\s+/), enabled, env } }
  : { [name]: { type: 'remote', url, enabled, headers } };

writeFileNow(output, JSON.stringify(config, null, 2) + '\n', dryRun);
