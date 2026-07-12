/**
 * Scaffold functions — template system, project initialization.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, cpSync } from 'fs';
import { join, resolve, dirname, basename } from 'path';
import { REPO_ROOT, log, ensureDir } from './helpers.js';
import { loadTemplates, resolvePartial, applyVars, resolveItems, resolveScripts, resolveFiles, resolvePlugins } from './template-utils.js';
import { buildVarsFromProjectState } from './agents-md.js';

function scaffoldProject(targetDir, templateName, vars) {
  const templates = loadTemplates();
  const template = templates.find(t => t.name === templateName);
  if (!template) {
    log(`Template '${templateName}' not found. Run 'arai template list' to see available templates.`, 'err');
    return false;
  }

  const { include } = template;
  const absTarget = resolve(targetDir);
  const projectName = basename(absTarget);
  const allVars = { ...vars, project_name: projectName, project_description: vars.description || `${projectName} — AI-enhanced project` };

  if (existsSync(absTarget) && readdirSync(absTarget).length > 0) {
    log(`Directory ${absTarget} already exists and is not empty`, 'err');
    return false;
  }

  ensureDir(absTarget);
  log(`Scaffolding '${templateName}' template in ${absTarget}...`, 'info');

  const gitignorePartial = resolvePartial('.gitignore');
  if (gitignorePartial) {
    writeFileSync(join(absTarget, '.gitignore'), gitignorePartial);
  }

  const skillsToCopy = resolveItems('skills', include.skills || []);
  for (const skill of skillsToCopy) {
    const src = join(REPO_ROOT, 'shared', 'skills', skill, 'SKILL.md');
    if (existsSync(src)) {
      const dstDir = join(absTarget, '.opencode', 'skills', skill);
      ensureDir(dstDir);
      writeFileSync(join(dstDir, 'SKILL.md'), readFileSync(src, 'utf8'));
    } else {
      log(`Skill '${skill}' not found in shared/skills/`, 'warn');
    }
  }

  for (const item of resolveScripts(include.scripts || [])) {
    const src = join(REPO_ROOT, 'shared', 'scripts', item);
    if (existsSync(src)) {
      const dst = join(absTarget, 'shared', 'scripts', item);
      ensureDir(dirname(dst));
      cpSync(src, dst, { recursive: true });
    } else {
      log(`Script '${item}' not found in shared/scripts/`, 'warn');
    }
  }

  for (const prompt of resolveFiles('prompts', include.prompts || [])) {
    const src = join(REPO_ROOT, 'shared', 'prompts', `${prompt}.md`);
    if (existsSync(src)) {
      const dstDir = join(absTarget, 'shared', 'prompts');
      ensureDir(dstDir);
      writeFileSync(join(dstDir, `${prompt}.md`), readFileSync(src, 'utf8'));
    }
  }

  for (const rule of resolveFiles('rules', include.rules || [])) {
    const src = join(REPO_ROOT, 'shared', 'rules', `${rule}.md`);
    if (existsSync(src)) {
      const dstDir = join(absTarget, 'shared', 'rules');
      ensureDir(dstDir);
      writeFileSync(join(dstDir, `${rule}.md`), readFileSync(src, 'utf8'));
    }
  }

  for (const agent of resolveFiles('agents', include.agents || [])) {
    const src = join(REPO_ROOT, 'shared', 'agents', `${agent}.md`);
    if (existsSync(src)) {
      const dstDir = join(absTarget, '.opencode', 'agents');
      ensureDir(dstDir);
      writeFileSync(join(dstDir, `${agent}.md`), readFileSync(src, 'utf8'));
    } else {
      log(`Agent '${agent}' not found in shared/agents/`, 'warn');
    }
  }

  for (const cmd of resolveFiles('commands', include.commands || [])) {
    const src = join(REPO_ROOT, 'shared', 'commands', `${cmd}.md`);
    if (existsSync(src)) {
      const dstDir = join(absTarget, '.opencode', 'commands');
      ensureDir(dstDir);
      writeFileSync(join(dstDir, `${cmd}.md`), readFileSync(src, 'utf8'));
    } else {
      log(`Command '${cmd}' not found in shared/commands/`, 'warn');
    }
  }

  for (const plugin of resolvePlugins(include.plugins || [])) {
    const src = join(REPO_ROOT, 'shared', 'plugins', plugin);
    if (existsSync(src)) {
      const dstDir = join(absTarget, '.opencode', 'plugins');
      ensureDir(dstDir);
      writeFileSync(join(dstDir, plugin), readFileSync(src, 'utf8'));
    } else {
      log(`Plugin '${plugin}' not found in shared/plugins/`, 'warn');
    }
  }

  if (include.tui) {
    const tuiSrc = join(REPO_ROOT, 'shared', 'tui.json');
    if (existsSync(tuiSrc)) {
      const dstDir = join(absTarget, '.opencode');
      ensureDir(dstDir);
      writeFileSync(join(dstDir, 'tui.json'), readFileSync(tuiSrc, 'utf8'));
    }
  }

  if (include.platforms?.includes('opencode')) {
    scaffoldOpencode(absTarget, allVars);
  }

  if (include.package_json) {
    const pkgPartial = resolvePartial('package.json');
    if (pkgPartial) {
      writeFileSync(join(absTarget, 'package.json'), applyVars(pkgPartial, allVars));
    }
  }

  if (include.repos_json) {
    const reposPartial = resolvePartial('repos.json');
    if (reposPartial) {
      writeFileSync(join(absTarget, 'repos.json'), reposPartial);
    }
  }

  if (include.transforms) {
    ensureDir(join(absTarget, 'transforms'));
    writeFileSync(join(absTarget, 'transforms', '.gitkeep'), '');
  }

  if (include.branding) {
    const brandPartial = resolvePartial('brand.json');
    if (brandPartial) {
      writeFileSync(join(absTarget, 'shared', 'brand.json'), applyVars(brandPartial, allVars));
    }
  }

  if (include.assets) {
    const assetsDir = join(absTarget, 'assets');
    ensureDir(join(assetsDir, 'images'));
    ensureDir(join(assetsDir, 'templates'));

    const logoPartial = resolvePartial('logo.svg');
    if (logoPartial) {
      writeFileSync(join(assetsDir, 'images', 'logo.svg'), applyVars(logoPartial, allVars));
    }
    const logoWhitePartial = resolvePartial('logo-white.svg');
    if (logoWhitePartial) {
      writeFileSync(join(assetsDir, 'images', 'logo-white.svg'), applyVars(logoWhitePartial, allVars));
    }

    const deckCssSrc = join(REPO_ROOT, 'assets', 'templates', 'deck.css');
    if (existsSync(deckCssSrc)) {
      cpSync(deckCssSrc, join(assetsDir, 'templates', 'deck.css'));
    }
    const reportCssSrc = join(REPO_ROOT, 'assets', 'templates', 'report.css');
    if (existsSync(reportCssSrc)) {
      cpSync(reportCssSrc, join(assetsDir, 'templates', 'report.css'));
    }
    const specsSrc = join(REPO_ROOT, 'assets', 'templates', 'specs');
    if (existsSync(specsSrc)) {
      cpSync(specsSrc, join(assetsDir, 'templates', 'specs'), { recursive: true });
    }
  }

  const agentsPartial = resolvePartial('AGENTS.md');
  if (agentsPartial) {
    const dynamicVars = buildVarsFromProjectState(absTarget);
    writeFileSync(join(absTarget, 'AGENTS.md'), applyVars(agentsPartial, { ...allVars, ...dynamicVars }));
  }

  log(`Done — ${absTarget} ready`, 'ok');
  return true;
}

function scaffoldOpencode(absTarget, allVars) {
  const partialSrc = join(REPO_ROOT, 'shared', 'templates', 'partials', 'opencode.json');
  if (existsSync(partialSrc)) {
    let config = readFileSync(partialSrc, 'utf8');
    config = applyVars(config, allVars);
    ensureDir(absTarget);
    writeFileSync(join(absTarget, 'opencode.json'), config);
  }
}

function listTemplates() {
  const templates = loadTemplates();
  if (templates.length === 0) {
    log('No templates found', 'info');
    return;
  }

  console.log(`\nAvailable templates:\n`);
  for (const t of templates) {
    const tag = t.builtin ? 'built-in' : 'user';
    console.log(`  ${t.name.padEnd(16)} ${t.description || ''}`);
    console.log(`  ${' '.repeat(16)} ${t.version || '1.0.0'} | ${tag}`);
    console.log();
  }
}

export { scaffoldProject, listTemplates };
