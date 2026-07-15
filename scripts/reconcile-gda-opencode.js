/**
 * Reconcile gda-ai/opencode.json with agent/command .md files and Copia configs.
 * - Registers agents that have .md files but aren't in opencode.json
 * - Registers commands that have .md files but aren't in opencode.json
 * - Adds MCP servers from Copia root
 * - Applies model overrides from Copia platform
 * - Reconciles permissions from Copia root
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const GDA = '/Users/administrador/P/gda-ai';
const COPIA = '/Users/administrador/P/Copia-de-gda-ai';

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]+?)\n---/);
  if (!match) return {};
  const body = match[1];
  const lines = body.split('\n');
  const result = {};
  const stack = [{ obj: result, indent: -1 }];

  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const indent = line.search(/\S/);
    const m = line.match(/^(\s*)(\S+?):\s*(.*)/);
    if (!m) continue;
    const key = m[2];
    const val = m[3];

    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }

    if (val) {
      let parsed = val;
      if (val === 'true') parsed = true;
      else if (val === 'false') parsed = false;
      else if (val === 'null') parsed = null;
      else if (/^\d+$/.test(val)) parsed = parseInt(val);
      else if (val.startsWith('[') && val.endsWith(']')) {
        parsed = val.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
      }
      stack[stack.length - 1].obj[key] = parsed;
    } else {
      const newObj = {};
      stack[stack.length - 1].obj[key] = newObj;
      stack.push({ obj: newObj, indent });
    }
  }
  return result;
}

function parseCommandFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]+?)\n---/);
  if (!match) return {};
  const result = {};
  for (const line of match[1].split('\n')) {
    const m = line.match(/^(\S+?):\s*(.*)/);
    if (m) result[m[1]] = m[2];
  }
  return result;
}

// Load configs
const gdaConfig = JSON.parse(readFileSync(join(GDA, 'opencode.json'), 'utf8'));
const copiaRoot = JSON.parse(readFileSync(join(COPIA, 'opencode.json'), 'utf8'));
const copiaPlatform = JSON.parse(readFileSync(join(COPIA, 'platforms', 'opencode', 'opencode.json'), 'utf8'));

let changes = 0;

// --- 1. Register missing agents ---
console.log('\n═══ Agents ═══');
const agentsDir = join(GDA, '.opencode', 'agents');
const agentFiles = readdirSync(agentsDir).filter(f => f.endsWith('.md'));

for (const f of agentFiles) {
  const name = f.replace('.md', '');
  const content = readFileSync(join(agentsDir, f), 'utf8');
  const fm = parseFrontmatter(content);

  if (gdaConfig.agent && gdaConfig.agent[name]) {
    console.log(`  ⊘ ${name} — already registered`);
    continue;
  }

  if (!gdaConfig.agent) gdaConfig.agent = {};

  const agentDef = {
    description: fm.description || `${name} agent`,
    mode: fm.mode || 'subagent',
  };

  // Apply model from frontmatter (preferred) or Copia platform override
  if (fm.model) {
    agentDef.model = fm.model;
  } else if (copiaPlatform.agent && copiaPlatform.agent[name] && copiaPlatform.agent[name].model) {
    agentDef.model = copiaPlatform.agent[name].model;
  }

  // Apply permissions from frontmatter
  if (fm.permission) {
    agentDef.permission = {};
    for (const [k, v] of Object.entries(fm.permission)) {
      agentDef.permission[k] = v;
    }
  }

  // Add path for agents that have custom paths
  if (name === 'plan-arai') {
    agentDef.path = '.opencode/agents/plan-arai.md';
  }

  gdaConfig.agent[name] = agentDef;
  console.log(`  ✓ ${name} — registered (mode: ${agentDef.mode}${agentDef.model ? ', model: ' + agentDef.model : ''})`);
  changes++;
}

// --- 2. Register missing commands ---
console.log('\n═══ Commands ═══');
const commandsDir = join(GDA, '.opencode', 'commands');
const commandFiles = readdirSync(commandsDir).filter(f => f.endsWith('.md'));

for (const f of commandFiles) {
  const name = f.replace('.md', '');
  const content = readFileSync(join(commandsDir, f), 'utf8');
  const fm = parseCommandFrontmatter(content);

  if (gdaConfig.command && gdaConfig.command[name]) {
    console.log(`  ⊘ ${name} — already registered`);
    continue;
  }

  if (!gdaConfig.command) gdaConfig.command = {};

  // Extract template from body (after frontmatter)
  const body = content.replace(/^---\n[\s\S]*?\n---\n/, '').trim();
  const template = body.split('\n').slice(0, 5).join('\n').trim();

  gdaConfig.command[name] = {
    description: fm.description || `${name} command`,
    template: template,
  };
  console.log(`  ✓ ${name} — registered`);
  changes++;
}

// --- 3. Add MCP servers from Copia root ---
console.log('\n═══ MCP Servers ═══');
if (!gdaConfig.mcp) gdaConfig.mcp = {};

const copiaMcp = copiaRoot.mcp || {};
for (const [name, server] of Object.entries(copiaMcp)) {
  if (gdaConfig.mcp[name]) {
    console.log(`  ⊘ ${name} — already exists`);
    continue;
  }
  gdaConfig.mcp[name] = server;
  console.log(`  ✓ ${name} — added (enabled: ${server.enabled})`);
  changes++;
}

// --- 4. Reconcile permissions ---
console.log('\n═══ Permissions ═══');
const copiaPerms = copiaRoot.permission;
if (copiaPerms) {
  const current = gdaConfig.permission || {};

  // bash: use Copia's granular version
  if (copiaPerms.bash) {
    gdaConfig.permission = gdaConfig.permission || {};
    gdaConfig.permission.bash = copiaPerms.bash;
    console.log('  ✓ bash — updated with granular rules');
    changes++;
  }

  // edit: use Copia's
  if (copiaPerms.edit) {
    gdaConfig.permission.edit = copiaPerms.edit;
    console.log('  ✓ edit — updated');
    changes++;
  }

  // read: use Copia's deny patterns
  if (copiaPerms.read) {
    gdaConfig.permission.read = copiaPerms.read;
    console.log('  ✓ read — updated with deny patterns');
    changes++;
  }
}

// --- Write result ---
writeFileSync(join(GDA, 'opencode.json'), JSON.stringify(gdaConfig, null, 2) + '\n');
console.log(`\n═══ Done ═══`);
console.log(`  ${changes} changes applied to gda-ai/opencode.json`);
