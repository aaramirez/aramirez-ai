/**
 * Sync functions — re-apply platform config and sync skills.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { REPO_ROOT, log, ensureDir, isDir, opencodeInstalled } from './helpers.js';
import { shouldSkip, isExcludedFromSync, isExcludedSkill } from './protection.js';

function syncProject(projectRoot, { force = false } = {}) {
  projectRoot = projectRoot || process.cwd();
  if (!opencodeInstalled(projectRoot)) {
    log('No opencode installation found. Run `arai install` first.', 'info');
    return;
  }

  const dotOpenCodeSrc = join(REPO_ROOT, '.opencode');
  const dotOpenCode = join(projectRoot, '.opencode');
  ensureDir(dotOpenCode);

  for (const sub of ['agents', 'commands']) {
    const src = join(dotOpenCodeSrc, sub);
    const dst = join(dotOpenCode, sub);
    if (isDir(src)) {
      const srcFiles = readdirSync(src).filter(f => f.endsWith('.md'));
      ensureDir(dst);
      for (const file of srcFiles) {
        if (sub === 'agents' && isExcludedFromSync(file)) continue;
        const dstFile = join(dst, file);
        if (!existsSync(dstFile)) {
          writeFileSync(dstFile, readFileSync(join(src, file), 'utf8'));
        }
      }
    }
  }

  const configSrc = join(REPO_ROOT, 'opencode.json');
  const configDst = join(projectRoot, 'opencode.json');
  if (existsSync(configSrc)) {
    if (existsSync(configDst) && shouldSkip('opencode.json', force)) {
      log('opencode.json exists — skipping (use --force to overwrite)', 'info');
    } else {
      writeFileSync(configDst, readFileSync(configSrc, 'utf8'));
    }
  }

  log(`Re-synced opencode config in ${projectRoot}`, 'ok');
}

function skillsSync(projectDir, skillName, { force = false } = {}) {
  const skillsDir = join(REPO_ROOT, 'shared', 'skills');
  if (!isDir(skillsDir)) { log('No shared/skills/ found', 'err'); return; }

  const allSkills = readdirSync(skillsDir).filter(f => isDir(join(skillsDir, f)));
  if (allSkills.length === 0) { log('No skills to sync', 'info'); return; }

  const skills = skillName
    ? (allSkills.includes(skillName) ? [skillName] : (log(`Skill '${skillName}' not found in shared/skills/`, 'err'), null))
    : allSkills.filter(s => !isExcludedSkill(s));
  if (!skills) return;

  const dest = join(resolve(projectDir), '.opencode', 'skills');
  ensureDir(dest);

  let count = 0;
  for (const skill of skills) {
    const src = join(skillsDir, skill, 'SKILL.md');
    if (!existsSync(src)) continue;
    const dstDir = join(dest, skill);
    ensureDir(dstDir);
    const dstFile = join(dstDir, 'SKILL.md');
    if (existsSync(dstFile) && !force) {
      log(`SKILL.md for '${skill}' exists — skipping (use --force to overwrite)`, 'info');
      continue;
    }
    writeFileSync(dstFile, readFileSync(src, 'utf8'));
    count++;
  }

  log(`Synced ${count} skill(s) → ${projectDir}/.opencode/skills/`, 'ok');
}

export { syncProject, skillsSync };
