#!/usr/bin/env node

import { Command } from 'commander';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync, symlinkSync, unlinkSync, readdirSync, statSync, cpSync } from 'fs';
import { homedir, platform } from 'os';
import { join, resolve, relative, dirname, basename } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');
const REPO_ROOT = resolve(dirname(import.meta.url.replace('file://', '')), '..');
const TEMPLATES_DIR = join(REPO_ROOT, 'shared', 'templates');
const USER_TEMPLATES_DIR = join(homedir(), '.config', 'arai', 'templates');

const program = new Command();

program
  .name('arai')
  .version(pkg.version)
  .description('aramirez-ai: multi-agent configuration manager (opencode, claude, cursor, codex)');

const AGENTS = ['opencode', 'claude', 'cursor', 'codex'];

const AGENT_PATHS = {
  opencode: {
    global: join(homedir(), '.config', 'opencode'),
    projectDir: '.opencode',
    configFile: 'opencode.json',
    envVar: 'OPENCODE_CONFIG_DIR',
  },
  claude: {
    global: join(homedir(), '.claude'),
    projectDir: '.claude',
    configFile: 'CLAUDE.md',
    envVar: null,
  },
  cursor: {
    global: join(homedir(), '.cursor'),
    projectDir: '.cursor',
    configFile: '.cursorrules',
    envVar: null,
  },
  codex: {
    global: join(homedir(), '.codex'),
    projectDir: '.codex',
    configFile: 'codex.md',
    envVar: null,
  },
};

/* ─── helpers ─── */

function log(msg, type = 'info') {
  const icons = { info: 'ℹ', ok: '✓', warn: '⚠', err: '✗' };
  console.log(`${icons[type] || ' '} ${msg}`);
}

function run(cmd) {
  try {
    return execSync(cmd, { cwd: REPO_ROOT, encoding: 'utf8' }).trim();
  } catch (e) {
    return null;
  }
}

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function symlinkTarget(target, linkPath) {
  if (existsSync(linkPath)) {
    const st = statSync(linkPath);
    if (st.isSymbolicLink()) unlinkSync(linkPath);
    else if (st.isDirectory()) {
      run(`rm -rf "${linkPath}"`);
    }
  }
  symlinkSync(target, linkPath);
}

function isDir(path) {
  return existsSync(path) && statSync(path).isDirectory();
}

/* ─── install agent ─── */

function installOpenCodeGlobal() {
  const target = AGENT_PATHS.opencode.global;
  const source = join(REPO_ROOT, 'platforms', 'opencode');

  if (!isDir(source)) {
    log(`platforms/opencode/ not found in repo`, 'err');
    return false;
  }

  if (existsSync(target) && !statSync(target).isSymbolicLink()) {
    log(`~/.config/opencode already exists and is not a symlink. Backing up...`, 'warn');
    run(`mv "${target}" "${target}.bak"`);
  }

  symlinkTarget(source, target);
  log(`Symlinked platforms/opencode/ → ~/.config/opencode/`, 'ok');
  return true;
}

function installOpenCodeProject(projectDir, copyMode = false) {
  const projectRoot = resolve(projectDir);
  const source = join(REPO_ROOT, 'platforms', 'opencode');

  if (!isDir(source)) {
    log(`platforms/opencode/ not found`, 'err');
    return false;
  }

  ensureDir(projectRoot);

  if (copyMode) {
    const dotOpcodes = ['.opencode', join(projectRoot, '.opencode')];
    const targetDir = join(projectRoot, '.opencode');
    ensureDir(targetDir);

    for (const sub of ['agents', 'commands', 'plugins', 'mcp']) {
      const src = join(source, sub);
      const dst = join(targetDir, sub);
      if (isDir(src) && !existsSync(dst)) {
        cpSync(src, dst, { recursive: true });
      }
    }

    // Copy shared skills from source of truth (not the symlink in platforms/opencode)
    const skillsSrc = join(REPO_ROOT, 'shared', 'skills');
    const skillsDst = join(targetDir, 'skills');
    if (isDir(skillsSrc) && !existsSync(skillsDst)) {
      cpSync(skillsSrc, skillsDst, { recursive: true });
    }

    const configSrc = join(source, 'opencode.json');
    const configDst = join(projectRoot, 'opencode.json');
    if (existsSync(configSrc) && !existsSync(configDst)) {
      writeFileSync(configDst, readFileSync(configSrc, 'utf8'));
    }

    log(`Copied opencode config to ${projectRoot}/.opencode/`, 'ok');
  } else {
    ensureDir(projectRoot);
    const envFilePath = join(projectRoot, '.env');
    const envVar = 'OPENCODE_CONFIG_DIR';
    const configDir = source;
    const line = `\n# arai: opencode config\nexport ${envVar}="${configDir}"\n`;

    if (existsSync(envFilePath)) {
      const content = readFileSync(envFilePath, 'utf8');
      if (!content.includes(envVar)) {
        writeFileSync(envFilePath, content + line);
      }
    } else {
      writeFileSync(envFilePath, line);
    }

    log(`Set ${envVar}=${configDir} in ${envFilePath}`, 'ok');
    log(`Restart opencode for changes to take effect`, 'info');
  }

  return true;
}

function uninstallAgent(agent) {
  const info = AGENT_PATHS[agent];
  if (!info) { log(`Agent '${agent}' not supported`, 'err'); return; }

  const target = info.global;
  const expected = join(REPO_ROOT, 'platforms', agent);

  if (existsSync(target) && statSync(target).isSymbolicLink()) {
    const link = readlinkSync(target);
    unlinkSync(target);
    log(`Removed symlink: ${target} → ${link}`, 'ok');

    const backup = `${target}.bak`;
    if (existsSync(backup)) {
      log(`Backup found at ${backup}`, 'info');
      log(`Restore with: mv "${backup}" "${target}"`, 'info');
    }
  } else if (existsSync(target)) {
    log(`${target} exists and is not a symlink (was it installed manually?)`, 'warn');
  } else {
    log(`${agent} is not installed globally`, 'info');
  }
}

function uninstallAgentProject(agent, projectDir, copyMode) {
  const info = AGENT_PATHS[agent];
  if (!info) { log(`Agent '${agent}' not supported`, 'err'); return; }

  const projectRoot = resolve(projectDir);

  if (agent === 'opencode') {
    if (copyMode) {
      const targetDir = join(projectRoot, '.opencode');
      const configFile = join(projectRoot, 'opencode.json');
      let removed = false;

      if (existsSync(targetDir)) {
        run(`rm -rf "${targetDir}"`);
        log(`Removed ${targetDir}/`, 'ok');
        removed = true;
      }
      if (existsSync(configFile)) {
        run(`rm "${configFile}"`);
        log(`Removed ${configFile}`, 'ok');
        removed = true;
      }
      if (!removed) {
        log(`No opencode project files found in ${projectRoot}`, 'info');
      }
    } else {
      // env-var mode: clean up OPENCODE_CONFIG_DIR from .env
      const envFilePath = join(projectRoot, '.env');
      if (existsSync(envFilePath)) {
        const content = readFileSync(envFilePath, 'utf8');
        const lines = content.split('\n').filter(line => !line.includes('OPENCODE_CONFIG_DIR') && line.trim());
        writeFileSync(envFilePath, lines.join('\n') + (lines.length ? '\n' : ''));
        log(`Removed OPENCODE_CONFIG_DIR from ${envFilePath}`, 'ok');
      } else {
        log(`No .env found in ${projectRoot}`, 'info');
      }
    }
  } else {
    const targetDir = join(projectRoot, info.projectDir);
    if (existsSync(targetDir)) {
      run(`rm -rf "${targetDir}"`);
      log(`Removed ${targetDir}/`, 'ok');
    } else {
      log(`No ${info.projectDir}/ found in ${projectRoot}`, 'info');
    }
  }
}

function showStatus() {
  console.log('\n📋 arai status — aramirez-ai\n');

  for (const agent of AGENTS) {
    const info = AGENT_PATHS[agent];
    const target = info.global;
    const agentDir = join(REPO_ROOT, 'platforms', agent);
    const exists = isDir(agentDir);

    let status = 'not configured';
    if (existsSync(target)) {
      if (statSync(target).isSymbolicLink()) {
        const link = readlinkSync(target);
        status = link === agentDir ? `global symlink ✅` : `global symlink → ${link}`;
      } else {
        status = `global dir exists (not symlinked)`;
      }
    } else {
      status = 'not installed globally';
    }

    console.log(`  ${agent.padEnd(10)} ${exists ? '📦' : '⬜'} ${status}`);
  }

  const envVars = Object.entries(process.env)
    .filter(([k]) => k.includes('OPENCODE_CONFIG') || k.includes('CLAUDE') || k.includes('CURSOR'))
    .map(([k, v]) => `    ${k}=${v}`);

  if (envVars.length) {
    console.log(`\n  Environment:\n${envVars.join('\n')}`);
  }

  console.log(`\n  Repo: ${REPO_ROOT}`);
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
  } catch (e) {
    log('npm install failed. Run it manually.', 'warn');
  }
  log('Update complete', 'ok');
  log('Tip: run `arai sync` in project dirs that use --copy mode', 'info');
  verifySymlinks();
}

function verifySymlinks() {
  for (const agent of AGENTS) {
    const info = AGENT_PATHS[agent];
    const target = info.global;
    const expected = join(REPO_ROOT, 'platforms', agent);

    if (existsSync(target) && statSync(target).isSymbolicLink()) {
      try {
        const link = readlinkSync(target);
        if (link !== expected) {
          log(`${agent}: symlink → ${link} (moved?). Reinstall with: arai install ${agent} --global`, 'warn');
        }
      } catch {
        log(`${agent}: symlink is broken. Reinstall with: arai install ${agent} --global`, 'warn');
      }
    }
  }
}

function syncAgent(agent) {
  const info = AGENT_PATHS[agent];
  if (!info) { log(`Agent '${agent}' not supported`, 'err'); return; }

  const projectRoot = process.cwd();

  if (agent === 'opencode') {
    const configDst = join(projectRoot, 'opencode.json');
    const targetDir = join(projectRoot, '.opencode');

    if (!existsSync(configDst) && !existsSync(targetDir)) {
      log(`No opencode config found in ${projectRoot}`, 'info');
      return;
    }

    if (existsSync(targetDir)) {
      run(`rm -rf "${targetDir}"`);
    }
    if (existsSync(configDst)) {
      run(`rm "${configDst}"`);
    }

    installOpenCodeProject(projectRoot, true);
    log(`Re-applied opencode config in ${projectRoot}`, 'ok');
  } else {
    const targetDir = join(projectRoot, info.projectDir);
    if (!existsSync(targetDir)) {
      log(`No ${info.projectDir}/ found in ${projectRoot}`, 'info');
      return;
    }
    run(`rm -rf "${targetDir}"`);
    const source = join(REPO_ROOT, 'platforms', agent);
    cpSync(source, targetDir, { recursive: true });
    log(`Re-applied ${agent} config in ${projectRoot}`, 'ok');
  }
}

function installPlugin(pluginPath) {
  // Placeholder for future plugin installation
  log(`Plugin installation not yet implemented: ${pluginPath}`, 'info');
}

function transformSkills(targetAgent) {
  const skillsDir = join(REPO_ROOT, 'shared', 'skills');
  if (!isDir(skillsDir)) {
    log('No shared/skills/ directory found', 'warn');
    return;
  }

  const skills = readdirSync(skillsDir).filter(f => isDir(join(skillsDir, f)));
  if (skills.length === 0) {
    log('No skills to transform', 'info');
    return;
  }

  if (targetAgent === 'cursor') {
    const cursorRulesDir = join(REPO_ROOT, 'platforms', 'cursor', 'rules');
    ensureDir(cursorRulesDir);

    for (const skill of skills) {
      const skillPath = join(skillsDir, skill, 'SKILL.md');
      if (!existsSync(skillPath)) continue;
      const content = readFileSync(skillPath, 'utf8');
      const description = content.match(/^description:\s*(.+)/m)?.[1] || skill;

      const cursorRule = `# ${skill}\n\n${description}\n\n${stripFrontmatter(content)}\n`;
      writeFileSync(join(cursorRulesDir, `${skill}.md`), cursorRule);
    }
    log(`Transformed ${skills.length} skills → platforms/cursor/rules/`, 'ok');

  } else if (targetAgent === 'codex') {
    const codexDir = join(REPO_ROOT, 'platforms', 'codex');
    ensureDir(codexDir);

    for (const skill of skills) {
      const skillPath = join(skillsDir, skill, 'SKILL.md');
      if (!existsSync(skillPath)) continue;
      const content = readFileSync(skillPath, 'utf8');
      writeFileSync(join(codexDir, `${skill}.md`), stripFrontmatter(content));
    }
    log(`Transformed ${skills.length} skills → platforms/codex/`, 'ok');

  } else {
    log(`Unknown target agent: ${targetAgent}`, 'err');
  }
}

function readlinkSync(p) {
  // simple readlink via fs
  const { readlinkSync: rl } = require('fs');
  return rl(p);
}

function stripFrontmatter(content) {
  return content.replace(/^---\n[\s\S]*?\n---\n/, '');
}

/* ─── template system / scaffold ─── */

function loadTemplates() {
  const templates = [];

  function loadFromDir(dir, builtin) {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir)) {
      const tmplDir = join(dir, entry);
      if (statSync(tmplDir).isDirectory()) {
        const manifestPath = join(tmplDir, 'template.json');
        if (existsSync(manifestPath)) {
          try {
            const tmpl = JSON.parse(readFileSync(manifestPath, 'utf8'));
            tmpl.sourceDir = tmplDir;
            tmpl.builtin = builtin;
            templates.push(tmpl);
          } catch { /* skip invalid */ }
        }
      }
    }
  }

  loadFromDir(TEMPLATES_DIR, true);
  loadFromDir(USER_TEMPLATES_DIR, false);
  return templates;
}

const PARTIALS_DIR = join(TEMPLATES_DIR, 'partials');

function resolvePartial(name) {
  const path = join(PARTIALS_DIR, name);
  return existsSync(path) ? readFileSync(path, 'utf8') : null;
}

function applyVars(content, vars) {
  return content.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || `{{${key}}}`);
}

function resolveItems(category, items) {
  if (items.length === 1 && items[0] === '*') {
    const dir = join(REPO_ROOT, 'shared', category);
    if (!existsSync(dir)) return [];
    return readdirSync(dir).filter(f => statSync(join(dir, f)).isDirectory());
  }
  return items;
}

function resolveScripts(items) {
  if (items.length === 1 && items[0] === '*') {
    const dir = join(REPO_ROOT, 'shared', 'scripts');
    if (!existsSync(dir)) return [];
    return readdirSync(dir).filter(f => {
      const p = join(dir, f);
      return statSync(p).isFile() && f !== '.gitkeep';
    });
  }
  return items;
}

function resolveFiles(category, items) {
  if (items.length === 1 && items[0] === '*') {
    const dir = join(REPO_ROOT, 'shared', category);
    if (!existsSync(dir)) return [];
    return readdirSync(dir).filter(f => {
      const p = join(dir, f);
      return statSync(p).isFile() && f !== '.gitkeep';
    }).map(f => f.replace(/\.md$/, ''));
  }
  return items;
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

  ensureDir(absTarget);
  log(`Scaffolding '${templateName}' template in ${absTarget}...`, 'info');

  // .gitignore
  const gitignorePartial = resolvePartial('.gitignore');
  if (gitignorePartial) {
    writeFileSync(join(absTarget, '.gitignore'), gitignorePartial);
  }

  // AGENTS.md
  const agentsPartial = resolvePartial('AGENTS.md');
  if (agentsPartial) {
    writeFileSync(join(absTarget, 'AGENTS.md'), applyVars(agentsPartial, allVars));
  }

  // Skills
  const skillsToCopy = resolveItems('skills', include.skills || []);
  for (const skill of skillsToCopy) {
    const src = join(REPO_ROOT, 'shared', 'skills', skill, 'SKILL.md');
    if (existsSync(src)) {
      const dstDir = join(absTarget, 'shared', 'skills', skill);
      ensureDir(dstDir);
      writeFileSync(join(dstDir, 'SKILL.md'), readFileSync(src, 'utf8'));
    } else {
      log(`Skill '${skill}' not found in shared/skills/`, 'warn');
    }
  }

  // Scripts
  for (const script of resolveScripts(include.scripts || [])) {
    const src = join(REPO_ROOT, 'shared', 'scripts', script);
    if (existsSync(src)) {
      const dstDir = join(absTarget, 'shared', 'scripts');
      ensureDir(dstDir);
      writeFileSync(join(dstDir, script), readFileSync(src, 'utf8'));
    } else {
      log(`Script '${script}' not found in shared/scripts/`, 'warn');
    }
  }

  // Prompts
  for (const prompt of resolveFiles('prompts', include.prompts || [])) {
    const src = join(REPO_ROOT, 'shared', 'prompts', `${prompt}.md`);
    if (existsSync(src)) {
      const dstDir = join(absTarget, 'shared', 'prompts');
      ensureDir(dstDir);
      writeFileSync(join(dstDir, `${prompt}.md`), readFileSync(src, 'utf8'));
    }
  }

  // Rules
  for (const rule of resolveFiles('rules', include.rules || [])) {
    const src = join(REPO_ROOT, 'shared', 'rules', `${rule}.md`);
    if (existsSync(src)) {
      const dstDir = join(absTarget, 'shared', 'rules');
      ensureDir(dstDir);
      writeFileSync(join(dstDir, `${rule}.md`), readFileSync(src, 'utf8'));
    }
  }

  // Platforms
  for (const platformName of include.platforms || []) {
    const src = join(REPO_ROOT, 'platforms', platformName);
    if (existsSync(src) && statSync(src).isDirectory()) {
      const dst = join(absTarget, 'platforms', platformName);
      ensureDir(dirname(dst));
      cpSync(src, dst, { recursive: true });

      // Apply opencode.json template vars (project_name)
      if (platformName === 'opencode') {
        const configPath = join(dst, 'opencode.json');
        if (existsSync(configPath)) {
          writeFileSync(configPath, applyVars(readFileSync(configPath, 'utf8'), allVars));
        }
      }
    } else {
      log(`Platform '${platformName}' not found in platforms/`, 'warn');
    }
  }

  // package.json
  if (include.package_json) {
    const pkgPartial = resolvePartial('package.json');
    if (pkgPartial) {
      writeFileSync(join(absTarget, 'package.json'), applyVars(pkgPartial, allVars));
    }
  }

  // repos.json
  if (include.repos_json) {
    const reposPartial = resolvePartial('repos.json');
    if (reposPartial) {
      writeFileSync(join(absTarget, 'repos.json'), reposPartial);
    }
  }

  // transforms directory
  if (include.transforms) {
    ensureDir(join(absTarget, 'transforms'));
    writeFileSync(join(absTarget, 'transforms', '.gitkeep'), '');
  }

  // branding
  if (include.branding) {
    const brandPartial = resolvePartial('brand.json');
    if (brandPartial) {
      writeFileSync(join(absTarget, 'shared', 'brand.json'), applyVars(brandPartial, allVars));
    }
  }

  // assets
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
    writeFileSync(join(assetsDir, 'templates', '.gitkeep'), '');
  }

  log(`Done — ${absTarget} ready`, 'ok');
  return true;
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

/* ─── generate helpers ─── */

function findProjectRoot(start) {
  let dir = resolve(start || '.');
  while (true) {
    if (existsSync(join(dir, 'AGENTS.md')) || existsSync(join(dir, 'shared', 'skills'))) return dir;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

function kebabToPascal(str) {
  return str.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
}

function generateSkill(name, projectDir) {
  const template = resolvePartial('skill.md');
  if (!template) { log('skill.md partial not found', 'err'); return false; }

  const dir = join(projectDir, 'shared', 'skills', name);
  if (existsSync(dir)) { log(`Skill '${name}' already exists`, 'warn'); return false; }

  ensureDir(dir);
  writeFileSync(join(dir, 'SKILL.md'), applyVars(template, { name }));
  log(`Created shared/skills/${name}/SKILL.md`, 'ok');
  return true;
}

function generateAgent(name, projectDir, description) {
  const template = resolvePartial('agent.md');
  if (!template) { log('agent.md partial not found', 'err'); return false; }

  const agentsDir = join(projectDir, 'shared', 'agents');
  ensureDir(agentsDir);

  const filePath = join(agentsDir, `${name}.md`);
  if (existsSync(filePath)) { log(`Agent '${name}' already exists`, 'warn'); return false; }

  const desc = description || `${name.replace(/-/g, ' ')} specialist`;

  // Determine opencode platform dir
  const opencodeDir = join(projectDir, 'platforms', 'opencode');
  const hasOpenCode = existsSync(join(opencodeDir, 'opencode.json'));

  writeFileSync(filePath, applyVars(template, { name, description: desc }));
  log(`Created shared/agents/${name}.md`, 'ok');

  // Register in opencode.json if it exists
  if (hasOpenCode) {
    const configPath = join(opencodeDir, 'opencode.json');
    const config = JSON.parse(readFileSync(configPath, 'utf8'));
    if (!config.agent) config.agent = {};

    if (config.agent[name]) {
      log(`Agent '${name}' already registered in opencode.json — skipping registration`, 'info');
    } else {
      config.agent[name] = {
        mode: 'subagent',
        description: desc,
        model: 'anthropic/claude-sonnet-4-6',
        permission: { edit: 'deny' },
      };
      writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
      log(`Registered '${name}' in platforms/opencode/opencode.json`, 'ok');
    }
  }

  return true;
}

function generateScript(name, projectDir, description) {
  const template = resolvePartial('script.js');
  if (!template) { log('script.js partial not found', 'err'); return false; }

  const dir = join(projectDir, 'shared', 'scripts');
  ensureDir(dir);

  const filePath = join(dir, `${name}.js`);
  if (existsSync(filePath)) { log(`Script '${name}.js' already exists`, 'warn'); return false; }

  const desc = description || `${name.replace(/-/g, ' ')} utility`;
  writeFileSync(filePath, applyVars(template, { name, description: desc }));
  // Make executable on Unix
  try { execSync(`chmod +x "${filePath}"`); } catch { /* ok */ }
  log(`Created shared/scripts/${name}.js`, 'ok');
  return true;
}

function generateCommand(name, projectDir, description) {
  const template = resolvePartial('command.md');
  if (!template) { log('command.md partial not found', 'err'); return false; }

  const opencodeDir = join(projectDir, 'platforms', 'opencode');
  const commandsDir = join(opencodeDir, 'commands');
  ensureDir(commandsDir);

  const filePath = join(commandsDir, `${name}.md`);
  if (existsSync(filePath)) { log(`Command '${name}' already exists`, 'warn'); return false; }

  const desc = description || `${name.replace(/-/g, ' ')} command`;
  writeFileSync(filePath, applyVars(template, { name, description: desc }));

  // Register in opencode.json
  const configPath = join(opencodeDir, 'opencode.json');
  if (existsSync(configPath)) {
    const config = JSON.parse(readFileSync(configPath, 'utf8'));
    if (!config.command) config.command = {};
    if (!config.command[name]) {
      config.command[name] = { description: desc, template: `Execute the ${name} task.` };
      writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
      log(`Registered '${name}' in platforms/opencode/opencode.json`, 'ok');
    }
  }

  log(`Created platforms/opencode/commands/${name}.md`, 'ok');
  return true;
}

function generateBrand(projectDir, opts) {
  const brandPath = join(projectDir, 'shared', 'brand.json');

  if (!existsSync(brandPath)) {
    log('shared/brand.json not found. Run `arai init` first with the `full` template.', 'err');
    return;
  }

  const brand = JSON.parse(readFileSync(brandPath, 'utf8'));

  if (opts.name) brand.brand.name = opts.name;
  if (opts.primary) brand.brand.colors.primary = opts.primary;
  if (opts.secondary) brand.brand.colors.secondary = opts.secondary;
  if (opts.accent) brand.brand.colors.accent = opts.accent;
  if (opts.text) brand.brand.colors.text = opts.text;
  if (opts.background) brand.brand.colors.background = opts.background;
  if (opts.lightBg) brand.brand.colors['light-bg'] = opts.lightBg;

  writeFileSync(brandPath, JSON.stringify(brand, null, 2) + '\n');
  log(`Updated shared/brand.json`, 'ok');

  // Copy logo if provided
  if (opts.logo) {
    const logoPath = resolve(opts.logo);
    if (!existsSync(logoPath)) { log(`Logo not found: ${logoPath}`, 'err'); return; }

    const logoExt = basename(logoPath);
    const assetsImages = join(projectDir, 'assets', 'images');
    ensureDir(assetsImages);
    writeFileSync(join(assetsImages, logoExt), readFileSync(logoPath, 'utf8'));

    // Auto-set brand.logo path
    brand.brand.logo = `assets/images/${logoExt}`;
    writeFileSync(brandPath, JSON.stringify(brand, null, 2) + '\n');
    log(`Copied logo → assets/images/${logoExt}`, 'ok');
  }

  // Copy white logo variant if provided
  if (opts.logoWhite) {
    const logoPath = resolve(opts.logoWhite);
    if (!existsSync(logoPath)) { log(`White logo not found: ${logoPath}`, 'err'); return; }

    const logoExt = basename(logoPath);
    const assetsImages = join(projectDir, 'assets', 'images');
    ensureDir(assetsImages);
    writeFileSync(join(assetsImages, logoExt), readFileSync(logoPath, 'utf8'));

    brand.brand.logo_white = `assets/images/${logoExt}`;
    writeFileSync(brandPath, JSON.stringify(brand, null, 2) + '\n');
    log(`Copied white logo → assets/images/${logoExt}`, 'ok');
  }

  log(`Brand config updated. Edit shared/brand.json for advanced changes.`, 'info');
}

/* ─── skills sync ─── */

function skillsSync(targetDir) {
  const skillsDir = join(REPO_ROOT, 'shared', 'skills');
  if (!isDir(skillsDir)) { log('No shared/skills/ found', 'err'); return; }

  const skills = readdirSync(skillsDir).filter(f => isDir(join(skillsDir, f)));
  if (skills.length === 0) { log('No skills to sync', 'info'); return; }

  const dest = targetDir
    ? resolve(targetDir, '.opencode', 'skills')
    : join(homedir(), '.config', 'opencode', 'skills');

  ensureDir(dest);
  let count = 0;
  for (const skill of skills) {
    const src = join(skillsDir, skill, 'SKILL.md');
    if (!existsSync(src)) continue;
    const dstDir = join(dest, skill);
    ensureDir(dstDir);
    writeFileSync(join(dstDir, 'SKILL.md'), readFileSync(src, 'utf8'));
    count++;
  }

  const label = targetDir ? `${targetDir}/.opencode/skills/` : '~/.config/opencode/skills/';
  log(`Synced ${count} skills → ${label}`, 'ok');
}

/* ─── kb install ─── */

function kbInstall(targetDir, force) {
  const dest = resolve(targetDir || '.', 'kb');
  if (existsSync(dest) && !force) {
    log(`kb/ already exists at ${dest}. Use --force to overwrite.`, 'warn');
    return;
  }
  if (existsSync(dest) && force) {
    run(`rm -rf "${dest}"`);
  }

  const kbDir = dest;
  const obsidianDir = join(kbDir, '.obsidian');
  ensureDir(obsidianDir);
  ensureDir(join(kbDir, 'Architecture'));
  ensureDir(join(kbDir, 'Team'));
  ensureDir(join(kbDir, 'Processes'));
  ensureDir(join(kbDir, 'Knowledge'));

  // .obsidian/app.json
  writeFileSync(join(obsidianDir, 'app.json'), JSON.stringify({
    alwaysUpdateLinks: true,
    showLineNumber: false,
    useMarkdownLinks: false,
    showUnsupportedFiles: true,
    attachmentFolderPath: './assets',
  }, null, 2) + '\n');

  // .obsidian/graph.json
  writeFileSync(join(obsidianDir, 'graph.json'), JSON.stringify({
    collapseFilter: true,
    showTags: true,
    showAttachments: true,
    showOrphans: true,
  }, null, 2) + '\n');

  // .obsidian/workspace.json
  writeFileSync(join(obsidianDir, 'workspace.json'), JSON.stringify({
    mode: 'source',
    pinned: true,
    showLineNumber: false,
  }, null, 2) + '\n');

  // Index.md
  writeFileSync(join(kbDir, 'Index.md'), `# Knowledge Base

## Structure

- [[Architecture/Index|Architecture]] — system design, decisions, ADRs
- [[Team/Index|Team]] — profiles, roles, responsibilities
- [[Processes/Index|Processes]] — workflows, SOPs, runbooks
- [[Knowledge/Index|Knowledge]] — reference, guides, documentation

## Usage

This vault uses \`[[wikilinks]]\` for cross-referencing. Keep notes atomic and well-linked.
`);

  // Sub-index files
  for (const dir of ['Architecture', 'Team', 'Processes', 'Knowledge']) {
    writeFileSync(join(kbDir, dir, 'Index.md'), `# ${dir}\n\n<!-- TODO: populate with ${dir.toLowerCase()} notes -->\n`);
  }

  log(`Created Obsidian vault at ${kbDir}`, 'ok');
  log(`Open it in Obsidian: File → Open Vault Folder → ${kbDir}`, 'info');
}

/* ─── install --project improved ─── */

function detectProjectType(projectDir) {
  const files = readdirSync(projectDir);
  if (files.includes('package.json')) {
    try {
      const pkg = JSON.parse(readFileSync(join(projectDir, 'package.json'), 'utf8'));
      if (pkg.dependencies?.next || pkg.devDependencies?.next) return { type: 'nextjs', framework: 'Next.js', test: 'npm test', start: 'npm run dev' };
      if (pkg.scripts?.dev) return { type: 'node-web', framework: 'Node.js web', test: 'npm test', start: 'npm run dev' };
      return { type: 'node', framework: 'Node.js', test: pkg.scripts?.test ? 'npm test' : null, start: pkg.scripts?.start ? 'npm start' : null };
    } catch { return { type: 'node', framework: 'Node.js', test: null, start: null }; }
  }
  if (files.includes('pyproject.toml') || files.includes('setup.py') || files.includes('requirements.txt')) {
    return { type: 'python', framework: 'Python', test: 'pytest', start: null };
  }
  if (files.includes('Gemfile') || files.includes('Rakefile')) {
    return { type: 'ruby', framework: 'Ruby', test: 'rspec', start: null };
  }
  if (files.includes('Cargo.toml')) {
    return { type: 'rust', framework: 'Rust', test: 'cargo test', start: null };
  }
  return { type: 'generic', framework: 'Generic', test: null, start: null };
}

function installAgent(agent, scope, dir, copyMode) {
  const agentDir = join(REPO_ROOT, 'platforms', agent);
  if (!isDir(agentDir)) {
    log(`Agent '${agent}' not found at platforms/${agent}/`, 'err');
    return;
  }

  if (scope === 'global') {
    const info = AGENT_PATHS[agent];
    if (!info) { log(`Agent '${agent}' not supported`, 'err'); return; }

    if (agent === 'opencode') {
      installOpenCodeGlobal();
    } else {
      const target = info.global;
      if (existsSync(target) && !statSync(target).isSymbolicLink()) {
        log(`${target} already exists. Backing up...`, 'warn');
        run(`mv "${target}" "${target}.bak"`);
      }
      symlinkTarget(agentDir, target);
      log(`Symlinked platforms/${agent}/ → ${target}`, 'ok');
    }
  } else if (scope === 'project') {
    const absDir = resolve(dir);
    if (agent === 'opencode') {
      installOpenCodeProject(absDir, copyMode);
    } else {
      const info = AGENT_PATHS[agent];
      const targetDir = join(absDir, info.projectDir);
      ensureDir(targetDir);
      cpSync(agentDir, targetDir, { recursive: true });
      log(`Copied platforms/${agent}/ → ${targetDir}`, 'ok');
    }

    // Auto-detect project type and suggest config
    if (existsSync(absDir)) {
      const projectInfo = detectProjectType(absDir);
      if (projectInfo.type !== 'generic') {
        log(`Detected ${projectInfo.framework} project`, 'info');
      }
    }
  }
}

/* ─── CLI commands ─── */

program
  .command('install <agent>')
  .description('Install an agent configuration (opencode, claude, cursor, codex)')
  .option('--global', 'Install globally')
  .option('--project <dir>', 'Install in project directory', '.')
  .option('--copy', 'Copy files instead of using env vars (project mode only)')
  .action((agent, opts) => {
    if (!AGENTS.includes(agent)) {
      log(`Unknown agent: ${agent}. Valid: ${AGENTS.join(', ')}`, 'err');
      return;
    }
    if (!opts.global && !opts.project) {
      log('Specify --global or --project <dir>', 'err');
      return;
    }
    const scope = opts.global ? 'global' : 'project';
    installAgent(agent, scope, opts.project, opts.copy);
  });

program
  .command('uninstall <agent>')
  .description('Uninstall an agent configuration (global or project)')
  .option('--global', 'Uninstall global configuration (default)')
  .option('--project <dir>', 'Uninstall from project directory')
  .option('--copy', 'Remove copied files (project mode only)')
  .action((agent, opts) => {
    if (!AGENTS.includes(agent)) {
      log(`Unknown agent: ${agent}. Valid: ${AGENTS.join(', ')}`, 'err');
      return;
    }
    if (opts.project) {
      uninstallAgentProject(agent, opts.project, opts.copy);
    } else {
      uninstallAgent(agent);
    }
  });

program
  .command('status')
  .description('Show installation status for all agents')
  .action(showStatus);

program
  .command('update')
  .description('Pull latest changes and install dependencies')
  .action(doUpdate);

program
  .command('sync [agent]')
  .description('Re-apply project-level config files (useful after update)')
  .action((agent) => {
    if (agent) {
      if (!AGENTS.includes(agent)) {
        log(`Unknown agent: ${agent}. Valid: ${AGENTS.join(', ')}`, 'err');
        return;
      }
      syncAgent(agent);
    } else {
      for (const a of AGENTS) {
        syncAgent(a);
      }
    }
  });

program
  .command('skills')
  .description('Sync shared/skills/ to opencode skill directories')
  .command('sync')
  .description('Sync skills to global ~/.config/opencode/skills/ or project .opencode/skills/')
  .option('--project <dir>', 'Sync to project .opencode/skills/ instead of global')
  .action((opts) => {
    skillsSync(opts.project || null);
  });

program
  .command('kb')
  .description('Scaffold an Obsidian knowledge base vault')
  .command('install [dir]')
  .description('Create kb/ Obsidian vault in the specified directory (default: current dir)')
  .option('--force', 'Overwrite existing kb/ directory')
  .action((dir, opts) => {
    kbInstall(dir || '.', opts.force);
  });

program
  .command('init <dir>')
  .description('Scaffold a new project with AI agent configuration')
  .option('--template <name>', 'Template to use (minimal, full)', 'minimal')
  .option('--description <desc>', 'Project description')
  .action((dir, opts) => {
    scaffoldProject(dir, opts.template, { description: opts.description });
  });

program
  .command('template')
  .description('Manage project scaffolding templates')
  .command('list')
  .description('List available templates')
  .action(listTemplates);

const generateCmd = program
  .command('generate')
  .description('Generate AI agent components (skill, agent, script, command)');

generateCmd
  .command('skill <name>')
  .description('Create a new skill in shared/skills/<name>/SKILL.md')
  .option('--dir <path>', 'Project root directory', '.')
  .action((name, opts) => {
    const root = findProjectRoot(opts.dir);
    if (!root) { log('Not inside an arai project (no AGENTS.md found)', 'err'); return; }
    generateSkill(name, root);
  });

generateCmd
  .command('agent <name>')
  .description('Create a new agent in shared/agents/<name>.md and register in opencode.json')
  .option('--dir <path>', 'Project root directory', '.')
  .option('--description <desc>', 'Agent description')
  .action((name, opts) => {
    const root = findProjectRoot(opts.dir);
    if (!root) { log('Not inside an arai project (no AGENTS.md found)', 'err'); return; }
    generateAgent(name, root, opts.description);
  });

generateCmd
  .command('script <name>')
  .description('Create a new reusable script in shared/scripts/<name>.js')
  .option('--dir <path>', 'Project root directory', '.')
  .option('--description <desc>', 'Script description')
  .action((name, opts) => {
    const root = findProjectRoot(opts.dir);
    if (!root) { log('Not inside an arai project (no AGENTS.md found)', 'err'); return; }
    generateScript(name, root, opts.description);
  });

generateCmd
  .command('command <name>')
  .description('Create a new opencode command in platforms/opencode/commands/<name>.md')
  .option('--dir <path>', 'Project root directory', '.')
  .option('--description <desc>', 'Command description')
  .action((name, opts) => {
    const root = findProjectRoot(opts.dir);
    if (!root) { log('Not inside an arai project (no AGENTS.md found)', 'err'); return; }
    generateCommand(name, root, opts.description);
  });

generateCmd
  .command('brand')
  .description('Configure brand identity in shared/brand.json')
  .option('--dir <path>', 'Project root directory', '.')
  .option('--name <name>', 'Brand/company name')
  .option('--primary <hex>', 'Primary brand color (e.g. #1a365d)')
  .option('--secondary <hex>', 'Secondary brand color')
  .option('--accent <hex>', 'Accent/highlight color')
  .option('--text <hex>', 'Body text color')
  .option('--background <hex>', 'Page background color')
  .option('--light-bg <hex>', 'Subtle background color')
  .option('--logo <path>', 'Path to brand logo SVG/PNG')
  .option('--logo-white <path>', 'Path to white logo variant')
  .action((opts) => {
    const root = findProjectRoot(opts.dir);
    if (!root) { log('Not inside an arai project (no AGENTS.md found)', 'err'); return; }
    generateBrand(root, opts);
  });

program
  .command('transform')
  .description('Transform shared skills to agent-specific formats')
  .command('skills')
  .description('Transform shared/skills/ to target agent format')
  .option('--to <agent>', 'Target agent (cursor, codex)')
  .option('--all', 'Transform to all supported formats')
  .action((opts) => {
    if (opts.all) {
      transformSkills('cursor');
      transformSkills('codex');
    } else if (opts.to) {
      transformSkills(opts.to);
    } else {
      log('Specify --to <agent> or --all', 'err');
    }
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
