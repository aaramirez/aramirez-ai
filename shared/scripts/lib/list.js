/**
 * List functions — display available resources.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { REPO_ROOT, log, isDir } from './helpers.js';

function listSkills() {
  const skillsDir = join(REPO_ROOT, 'shared', 'skills');
  if (!isDir(skillsDir)) { log('No shared/skills/ directory', 'err'); return; }
  const skills = readdirSync(skillsDir).filter(f => isDir(join(skillsDir, f)));
  if (skills.length === 0) { log('No skills found', 'info'); return; }
  console.log('\nAvailable skills:\n');
  for (const name of skills) {
    const skPath = join(skillsDir, name, 'SKILL.md');
    const desc = existsSync(skPath)
      ? (readFileSync(skPath, 'utf8').match(/^description:\s*(.+)/m)?.[1] || '')
      : '';
    console.log(`  ${name.padEnd(24)} ${desc}`);
  }
  console.log();
}

function listAgents() {
  const configPath = join(REPO_ROOT, 'opencode.json');
  if (!existsSync(configPath)) { log('No opencode.json found', 'err'); return; }
  const config = JSON.parse(readFileSync(configPath, 'utf8'));
  const agents = config.agent || {};
  const names = Object.keys(agents);
  if (names.length === 0) { log('No agents configured in opencode.json', 'info'); return; }
  console.log('\nRegistered agents:\n');
  for (const name of names) {
    const a = agents[name];
    console.log(`  ${name.padEnd(20)} mode: ${(a.mode || '-').padEnd(10)} model: ${a.model || '-'}`);
    console.log(`  ${' '.repeat(20)} ${a.description || ''}`);
    console.log();
  }
}

function listScripts() {
  const scriptsDir = join(REPO_ROOT, 'shared', 'scripts');
  if (!isDir(scriptsDir)) { log('No shared/scripts/ directory', 'err'); return; }
  const files = readdirSync(scriptsDir).filter(f => statSync(join(scriptsDir, f)).isFile() && f !== '.gitkeep');
  if (files.length === 0) { log('No scripts found', 'info'); return; }
  console.log('\nAvailable scripts:\n');
  for (const name of files.sort()) {
    console.log(`  ${name}`);
  }
  console.log();
}

function listCommands() {
  const cmdsDir = join(REPO_ROOT, '.opencode', 'commands');
  if (!isDir(cmdsDir)) { log('No .opencode/commands/ directory', 'err'); return; }
  const files = readdirSync(cmdsDir).filter(f => f.endsWith('.md'));
  if (files.length === 0) { log('No commands found', 'info'); return; }
  console.log('\nAvailable opencode commands:\n');
  for (const name of files.sort()) {
    const desc = readFileSync(join(cmdsDir, name), 'utf8').match(/^# (.+)/m)?.[1] || name.replace(/\.md$/, '');
    console.log(`  /${name.replace(/\.md$/, '').padEnd(20)} ${desc}`);
  }
  console.log();
}

function listMcp() {
  const configPath = join(REPO_ROOT, 'opencode.json');
  if (!existsSync(configPath)) { log('No opencode.json found', 'err'); return; }
  const config = JSON.parse(readFileSync(configPath, 'utf8'));
  const servers = config.mcp || {};
  const names = Object.keys(servers);
  if (names.length === 0) { log('No MCP servers configured', 'info'); return; }
  console.log('\nConfigured MCP servers:\n');
  for (const [key, val] of Object.entries(servers)) {
    if (!val || typeof val !== 'object') continue;
    const cmd = Array.isArray(val.command) ? val.command.join(' ') : val.command || val.url || '';
    console.log(`  ${key.padEnd(20)} ${String(cmd)}`);
    if (val.enabled === false) console.log(`  ${' '.repeat(20)} (disabled)`);
  }
  console.log();
}

export { listSkills, listAgents, listScripts, listCommands, listMcp };
