/**
 * Status and update commands.
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { REPO_ROOT, log, isDir, opencodeInstalled } from './helpers.js';

function showStatus() {
  const cwd = process.cwd();
  console.log('\nℹ arai status — aramirez-ai\n');

  const hasOpenCode = opencodeInstalled(cwd);

  if (hasOpenCode) {
    console.log('  opencode     ✓ installed');

    const agentsDir = join(cwd, '.opencode', 'agents');
    const skillsDir = join(cwd, '.opencode', 'skills');
    const configPath = join(cwd, 'opencode.json');

    if (isDir(agentsDir)) {
      const agents = readdirSync(agentsDir).filter(f => f.endsWith('.md'));
      console.log(`  agents       ${agents.length} installed (${agents.join(', ') || 'none'})`);
    }
    if (isDir(skillsDir)) {
      const skills = readdirSync(skillsDir).filter(f => isDir(join(skillsDir, f)));
      console.log(`  skills       ${skills.length} installed (${skills.join(', ') || 'none'})`);
    }
    if (existsSync(configPath)) {
      const config = JSON.parse(readFileSync(configPath, 'utf8'));
      const agentCount = Object.keys(config.agent || {}).length;
      const cmdCount = Object.keys(config.command || {}).length;
      console.log(`  agents cfg   ${agentCount} registered in opencode.json`);
      console.log(`  commands     ${cmdCount} registered in opencode.json`);
    }
  } else {
    console.log('  opencode     not installed');
  }

  console.log(`\n  CWD: ${cwd}`);
  console.log(`  Repo: ${REPO_ROOT}`);
  console.log(`  Node: ${process.version}`);
  console.log('');
}

function doUpdate() {
  log('Pulling latest changes...', 'info');
  try {
    const output = execSync('git pull --ff-only 2>&1', { cwd: REPO_ROOT, encoding: 'utf8' }).trim();
    log(output, 'ok');
  } catch (e) {
    const reason = e.stderr?.toString().trim().split('\n').pop() || e.message || 'Unknown error';
    log(`Git pull failed: ${reason}`, 'err');
    log('Commit or stash your changes first, then try again.', 'info');
    return;
  }
  log('Installing dependencies...', 'info');
  try {
    execSync('npm install', { cwd: REPO_ROOT, stdio: 'pipe', encoding: 'utf8' });
  } catch {
    log('npm install failed. Run it manually.', 'warn');
  }
  log('Update complete', 'ok');
}

export { showStatus, doUpdate };
