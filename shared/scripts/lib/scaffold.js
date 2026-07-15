/**
 * Scaffold functions — template system, project initialization.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, cpSync } from 'fs';
import { join, resolve, dirname, basename } from 'path';
import { REPO_ROOT, log, ensureDir } from './helpers.js';
import { loadTemplates, resolvePartial, applyVars, resolveItems, resolveScripts, resolveFiles, resolvePlugins } from './template-utils.js';
import { buildVarsFromProjectState } from './agents-md.js';
import { ensureOpenCodePackageJson } from './install.js';

function appendGitignore(targetPath, newContent) {
  if (!existsSync(targetPath)) {
    writeFileSync(targetPath, newContent);
    return;
  }
  const existing = readFileSync(targetPath, 'utf8');
  const existingSet = new Set(existing.split('\n').map(l => l.trim()).filter(Boolean));
  const newLines = newContent.split('\n')
    .map(l => l.trim())
    .filter(l => l && !existingSet.has(l));
  if (newLines.length > 0) {
    const sep = existing.endsWith('\n') ? '' : '\n';
    writeFileSync(targetPath, existing + sep + newLines.join('\n') + '\n');
    log(`Merged ${newLines.length} new entries into .gitignore`, 'ok');
  } else {
    log('.gitignore already contains all arai entries', 'info');
  }
}

function mergePackageJson(targetPath, templateVars) {
  const templateRaw = resolvePartial('package.json');
  const applied = JSON.parse(applyVars(templateRaw, templateVars));

  if (!existsSync(targetPath)) {
    writeFileSync(targetPath, JSON.stringify(applied, null, 2) + '\n');
    return;
  }

  try {
    const existing = JSON.parse(readFileSync(targetPath, 'utf8'));
    let changed = false;

    if (!existing.name) { existing.name = applied.name; changed = true; }
    if (existing.type !== 'module') {
      log(`Updating package.json type: "${existing.type || '(none)'}" → "module"`, 'warn');
      existing.type = 'module';
      changed = true;
    }
    if (!existing.engines) { existing.engines = applied.engines; changed = true; }
    if (applied.scripts && Object.keys(applied.scripts).length > 0) {
      if (!existing.scripts) existing.scripts = {};
      for (const [k, v] of Object.entries(applied.scripts)) {
        if (!(k in existing.scripts)) { existing.scripts[k] = v; changed = true; }
      }
    }

    if (changed) {
      writeFileSync(targetPath, JSON.stringify(existing, null, 2) + '\n');
      log('Merged arai fields into existing package.json', 'ok');
    } else {
      log('Existing package.json already has all arai fields', 'info');
    }
  } catch {
    log('Could not parse existing package.json — overwriting with template', 'warn');
    writeFileSync(targetPath, JSON.stringify(applied, null, 2) + '\n');
  }
}

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

  const isExistingProject = existsSync(absTarget) && readdirSync(absTarget).length > 0;

  if (isExistingProject) {
    log(`Existing project detected — adding arai configuration to ${absTarget}`, 'info');
  }

  ensureDir(absTarget);
  log(`Scaffolding '${templateName}' template in ${absTarget}...`, 'info');

  const gitignorePartial = resolvePartial('.gitignore');
  if (gitignorePartial) {
    appendGitignore(join(absTarget, '.gitignore'), gitignorePartial);
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
    let src = join(REPO_ROOT, 'shared', 'scripts', item);
    if (!existsSync(src)) {
      const skillsDir = join(REPO_ROOT, 'shared', 'skills');
      if (existsSync(skillsDir)) {
        for (const skill of readdirSync(skillsDir)) {
          const candidate = join(skillsDir, skill, 'scripts', item);
          if (existsSync(candidate)) { src = candidate; break; }
        }
      }
    }
    if (existsSync(src)) {
      const dst = join(absTarget, '.opencode', 'scripts', item);
      ensureDir(dirname(dst));
      cpSync(src, dst, { recursive: true });
    } else {
      log(`Script '${item}' not found`, 'warn');
    }
  }

  for (const prompt of resolveFiles('prompts', include.prompts || [])) {
    const src = join(REPO_ROOT, 'shared', 'prompts', `${prompt}.md`);
    if (existsSync(src)) {
      const dstDir = join(absTarget, '.opencode', 'prompts');
      ensureDir(dstDir);
      writeFileSync(join(dstDir, `${prompt}.md`), readFileSync(src, 'utf8'));
    }
  }

  for (const rule of resolveFiles('rules', include.rules || [])) {
    const src = join(REPO_ROOT, 'shared', 'rules', `${rule}.md`);
    if (existsSync(src)) {
      const dstDir = join(absTarget, '.opencode', 'rules');
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

  ensureOpenCodePackageJson(absTarget);

  if (include.package_json) {
    if (isExistingProject) {
      mergePackageJson(join(absTarget, 'package.json'), allVars);
    } else {
      const pkgPartial = resolvePartial('package.json');
      if (pkgPartial) {
        writeFileSync(join(absTarget, 'package.json'), applyVars(pkgPartial, allVars));
      }
    }
  }

  if (include.repos_json) {
    const reposPartial = resolvePartial('repos.json');
    if (reposPartial) {
      if (isExistingProject && existsSync(join(absTarget, 'repos.json'))) {
        log('repos.json already exists — skipping (preserving user config)', 'info');
      } else {
        writeFileSync(join(absTarget, 'repos.json'), reposPartial);
      }
    }
  }

  if (include.transforms) {
    ensureDir(join(absTarget, 'transforms'));
    writeFileSync(join(absTarget, 'transforms', '.gitkeep'), '');
  }

  if (include.branding) {
    const brandPartial = resolvePartial('brand.json');
    if (brandPartial) {
      writeFileSync(join(absTarget, '.opencode', 'brand.json'), applyVars(brandPartial, allVars));
    }
  }

  if (include.assets) {
    const assetsDir = join(absTarget, 'assets');
    ensureDir(join(assetsDir, 'images'));
    ensureDir(join(assetsDir, 'templates'));

    const logoPartial = resolvePartial('logo.svg');
    if (logoPartial) {
      const dst = join(assetsDir, 'images', 'logo.svg');
      if (isExistingProject && existsSync(dst)) {
        log('assets/images/logo.svg already exists — skipping', 'info');
      } else {
        writeFileSync(dst, applyVars(logoPartial, allVars));
      }
    }
    const logoWhitePartial = resolvePartial('logo-white.svg');
    if (logoWhitePartial) {
      const dst = join(assetsDir, 'images', 'logo-white.svg');
      if (isExistingProject && existsSync(dst)) {
        log('assets/images/logo-white.svg already exists — skipping', 'info');
      } else {
        writeFileSync(dst, applyVars(logoWhitePartial, allVars));
      }
    }

    const deckCssSrc = join(REPO_ROOT, 'assets', 'templates', 'deck.css');
    if (existsSync(deckCssSrc)) {
      const dst = join(assetsDir, 'templates', 'deck.css');
      if (!isExistingProject || !existsSync(dst)) {
        cpSync(deckCssSrc, dst);
      }
    }
    const reportCssSrc = join(REPO_ROOT, 'assets', 'templates', 'report.css');
    if (existsSync(reportCssSrc)) {
      const dst = join(assetsDir, 'templates', 'report.css');
      if (!isExistingProject || !existsSync(dst)) {
        cpSync(reportCssSrc, dst);
      }
    }
    const specsSrc = join(REPO_ROOT, 'assets', 'templates', 'specs');
    if (existsSync(specsSrc)) {
      const dst = join(assetsDir, 'templates', 'specs');
      if (!isExistingProject || !existsSync(dst)) {
        cpSync(specsSrc, dst, { recursive: true });
      }
    }
  }

  const agentsPartial = resolvePartial('AGENTS.md');
  if (agentsPartial) {
    const dynamicVars = buildVarsFromProjectState(absTarget);
    writeFileSync(join(absTarget, 'AGENTS.md'), applyVars(agentsPartial, { ...allVars, ...dynamicVars }));
  }

  if (isExistingProject) {
    log('Existing project files preserved — only arai configuration added/updated', 'info');
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
