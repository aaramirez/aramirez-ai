/**
 * Transfer agents, skills, scripts, and commands from Copia-de-gda-ai to gda-ai.
 * Skips anything that already exists in the destination.
 * Deletes originals from the source after successful copy.
 */

import { existsSync, readdirSync, statSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { join, basename } from 'path';

const SRC = '/Users/administrador/P/Copia-de-gda-ai';
const DST = '/Users/administrador/P/gda-ai';

let copied = 0;
let skipped = 0;
let deleted = 0;

function log(msg, icon = ' ') {
  console.log(`${icon} ${msg}`);
}

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function copyFile(src, dst) {
  if (existsSync(dst)) {
    log(`${basename(dst)} — already exists, skipping`, '⊘');
    skipped++;
    return false;
  }
  ensureDir(join(dst, '..'));
  writeFileSync(dst, readFileSync(src, 'utf8'));
  log(`${basename(dst)} — copied`, '✓');
  copied++;
  return true;
}

function copyDir(src, dst) {
  if (existsSync(dst)) {
    log(`${basename(dst)}/ — already exists, skipping`, '⊘');
    skipped++;
    return false;
  }
  ensureDir(dst);
  for (const entry of readdirSync(src)) {
    const srcPath = join(src, entry);
    const dstPath = join(dst, entry);
    if (statSync(srcPath).isFile()) {
      writeFileSync(dstPath, readFileSync(srcPath, 'utf8'));
      copied++;
    }
  }
  log(`${basename(dst)}/ — copied`, '✓');
  return true;
}

// --- 1. Agents from .opencode/agents/ ---
console.log('\n═══ Agents (.opencode/agents/) ═══');
const srcAgentsDir = join(SRC, '.opencode', 'agents');
const dstAgentsDir = join(DST, '.opencode', 'agents');
ensureDir(dstAgentsDir);

if (existsSync(srcAgentsDir)) {
  for (const f of readdirSync(srcAgentsDir)) {
    if (!f.endsWith('.md')) continue;
    copyFile(join(srcAgentsDir, f), join(dstAgentsDir, f));
  }
}

// --- 2. Agents from shared/agents/*/AGENT.md → .opencode/agents/<name>.md ---
console.log('\n═══ Agents (shared/agents/) ═══');
const srcSharedAgents = join(SRC, 'shared', 'agents');

if (existsSync(srcSharedAgents)) {
  for (const dir of readdirSync(srcSharedAgents)) {
    const agentDir = join(srcSharedAgents, dir);
    if (!statSync(agentDir).isDirectory()) continue;
    const agentFile = join(agentDir, 'AGENT.md');
    if (!existsSync(agentFile)) continue;
    copyFile(agentFile, join(dstAgentsDir, `${dir}.md`));
  }
}

// --- 3. Skills from shared/skills/ ---
console.log('\n═══ Skills (shared/skills/) ═══');
const srcSharedSkills = join(SRC, 'shared', 'skills');
const dstSkillsDir = join(DST, '.opencode', 'skills');
ensureDir(dstSkillsDir);

if (existsSync(srcSharedSkills)) {
  for (const dir of readdirSync(srcSharedSkills)) {
    if (dir === '.gitkeep') continue;
    const skillDir = join(srcSharedSkills, dir);
    if (!statSync(skillDir).isDirectory()) continue;
    const skillFile = join(skillDir, 'SKILL.md');
    if (!existsSync(skillFile)) continue;
    copyFile(skillFile, join(dstSkillsDir, dir, 'SKILL.md'));
  }
}

// --- 4. Skills from .opencode/skills/ ---
console.log('\n═══ Skills (.opencode/skills/) ═══');
const srcOcSkills = join(SRC, '.opencode', 'skills');

if (existsSync(srcOcSkills)) {
  for (const dir of readdirSync(srcOcSkills)) {
    const skillDir = join(srcOcSkills, dir);
    if (!statSync(skillDir).isDirectory()) continue;
    const skillFile = join(skillDir, 'SKILL.md');
    if (!existsSync(skillFile)) continue;
    copyFile(skillFile, join(dstSkillsDir, dir, 'SKILL.md'));
  }
}

// --- 5. Scripts from shared/scripts/ ---
console.log('\n═══ Scripts (shared/scripts/) ═══');
const srcScripts = join(SRC, 'shared', 'scripts');
const dstScripts = join(DST, '.opencode', 'scripts');
ensureDir(dstScripts);

if (existsSync(srcScripts)) {
  for (const f of readdirSync(srcScripts)) {
    if (f === '.gitkeep' || f === '__pycache__') continue;
    const srcPath = join(srcScripts, f);
    if (!statSync(srcPath).isFile()) continue;
    copyFile(srcPath, join(dstScripts, f));
  }
}

// --- 6. Commands from .opencode/commands/ ---
console.log('\n═══ Commands (.opencode/commands/) ═══');
const srcCommands = join(SRC, '.opencode', 'commands');
const dstCommands = join(DST, '.opencode', 'commands');
ensureDir(dstCommands);

if (existsSync(srcCommands)) {
  for (const f of readdirSync(srcCommands)) {
    if (!f.endsWith('.md')) continue;
    copyFile(join(srcCommands, f), join(dstCommands, f));
  }
}

// --- 7. Delete originals ---
console.log('\n═══ Deleting originals ═══');
const toDelete = [
  join(SRC, '.opencode', 'agents'),
  join(SRC, 'shared', 'agents'),
  join(SRC, 'shared', 'skills'),
  join(SRC, 'shared', 'scripts'),
  join(SRC, '.opencode', 'commands'),
];

for (const dir of toDelete) {
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true });
    log(`${dir.replace(SRC + '/', '')} — deleted`, '✗');
    deleted++;
  }
}

// --- Summary ---
console.log(`\n═══ Summary ═══`);
console.log(`  Copied:  ${copied}`);
console.log(`  Skipped: ${skipped} (already existed in destination)`);
console.log(`  Deleted: ${deleted} source directories`);
console.log();
