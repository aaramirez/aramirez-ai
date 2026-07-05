#!/usr/bin/env node

import { Command } from 'commander';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync, cpSync, rmSync } from 'fs';
import { homedir } from 'os';
import { join, resolve, dirname, basename } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');
const REPO_ROOT = resolve(dirname(import.meta.url.replace('file://', '')), '..');
const TEMPLATES_DIR = join(REPO_ROOT, 'shared', 'templates');
const USER_TEMPLATES_DIR = join(homedir(), '.config', 'arai', 'templates');
const PARTIALS_DIR = join(TEMPLATES_DIR, 'partials');

const program = new Command();

program
  .name('arai')
  .version(pkg.version)
  .description('aramirez-ai: opencode AI configuration manager');

const VALID_TYPES = ['skill', 'agent', 'script', 'prompt', 'rule'];

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

function isDir(path) {
  return existsSync(path) && statSync(path).isDirectory();
}

function stripFrontmatter(content) {
  return content.replace(/^---\n[\s\S]*?\n---\n/, '');
}

function sourceDirFor(type) {
  const map = {
    skill: join(REPO_ROOT, 'shared', 'skills'),
    agent: join(REPO_ROOT, 'shared', 'agents'),
    script: join(REPO_ROOT, 'shared', 'scripts'),
    prompt: join(REPO_ROOT, 'shared', 'prompts'),
    rule: join(REPO_ROOT, 'shared', 'rules'),
  };
  return map[type];
}

function destDirFor(type, projectRoot) {
  const map = {
    skill: join(projectRoot, '.opencode', 'skills'),
    agent: join(projectRoot, '.opencode', 'agents'),
    script: join(projectRoot, 'shared', 'scripts'),
    prompt: join(projectRoot, 'shared', 'prompts'),
    rule: join(projectRoot, 'shared', 'rules'),
  };
  return map[type];
}

function nameExists(type, name) {
  const srcDir = sourceDirFor(type);
  if (!srcDir || !isDir(srcDir)) return false;
  const items = readdirSync(srcDir);
  if (type === 'skill') {
    return items.includes(name) && isDir(join(srcDir, name));
  }
  return items.includes(`${name}.js`) || items.includes(`${name}.md`);
}

function listNames(type) {
  const srcDir = sourceDirFor(type);
  if (!srcDir || !isDir(srcDir)) return [];
  const items = readdirSync(srcDir).filter(f => f !== '.gitkeep');
  if (type === 'skill') {
    return items.filter(f => isDir(join(srcDir, f)));
  }
  return items.map(f => f.replace(/\.(js|md)$/, '')).filter(Boolean);
}

function isInstalled(type, name, projectRoot) {
  const dest = destDirFor(type, projectRoot);
  if (!dest) return false;
  if (type === 'skill') {
    return isDir(join(dest, name));
  }
  const ext = type === 'script' ? '.js' : '.md';
  return existsSync(join(dest, `${name}${ext}`));
}

function opencodeInstalled(projectRoot) {
  return isDir(join(projectRoot, '.opencode')) && existsSync(join(projectRoot, 'opencode.json'));
}

/* ─── install functions ─── */

function installPlatform(projectRoot) {
  if (opencodeInstalled(projectRoot)) {
    log('opencode already installed in this project', 'warn');
    return false;
  }

  const source = join(REPO_ROOT, 'platforms', 'opencode');
  if (!isDir(source)) {
    log('platforms/opencode/ not found in repo', 'err');
    return false;
  }

  ensureDir(projectRoot);

  // Copy .opencode/ directory
  const dotOpenCode = join(projectRoot, '.opencode');
  ensureDir(dotOpenCode);

  for (const sub of ['agents', 'commands']) {
    const src = join(source, sub);
    const dst = join(dotOpenCode, sub);
    if (isDir(src)) {
      cpSync(src, dst, { recursive: true });
    } else {
      ensureDir(dst);
    }
  }

  // Copy skills from source of truth
  const skillsSrc = join(REPO_ROOT, 'shared', 'skills');
  const skillsDst = join(dotOpenCode, 'skills');
  ensureDir(skillsDst);

  // Copy opencode.json
  const configSrc = join(source, 'opencode.json');
  const configDst = join(projectRoot, 'opencode.json');
  if (existsSync(configSrc)) {
    writeFileSync(configDst, readFileSync(configSrc, 'utf8'));
  }

  log(`Installed opencode config in ${projectRoot}/`, 'ok');
  updateAgentsMd(projectRoot);
  return true;
}

function installSkill(name, projectRoot) {
  const srcDir = join(REPO_ROOT, 'shared', 'skills', name);
  if (!isDir(srcDir)) {
    log(`Skill '${name}' not found`, 'err');
    const available = listNames('skill');
    if (available.length) log(`Available: ${available.join(', ')}`, 'info');
    return false;
  }

  if (!opencodeInstalled(projectRoot)) {
    log('Installing opencode platform first...', 'info');
    installPlatform(projectRoot);
  }

  const dest = join(projectRoot, '.opencode', 'skills', name);
  if (existsSync(dest)) {
    log(`Skill '${name}' already installed`, 'warn');
    return false;
  }

  ensureDir(dirname(dest));
  cpSync(srcDir, dest, { recursive: true });
  log(`Installed skill '${name}' → .opencode/skills/${name}/`, 'ok');
  updateAgentsMd(projectRoot);
  return true;
}

function installAgent(name, projectRoot) {
  // Check shared/agents/ first, then platforms/opencode/agents/
  let srcFile = join(REPO_ROOT, 'shared', 'agents', `${name}.md`);
  if (!existsSync(srcFile)) {
    srcFile = join(REPO_ROOT, 'platforms', 'opencode', 'agents', `${name}.md`);
  }
  if (!existsSync(srcFile)) {
    log(`Agent '${name}' not found`, 'err');
    const shared = listNames('agent');
    if (shared.length) log(`Available agents: ${shared.join(', ')}`, 'info');
    return false;
  }

  if (!opencodeInstalled(projectRoot)) {
    log('Installing opencode platform first...', 'info');
    installPlatform(projectRoot);
  }

  const destDir = join(projectRoot, '.opencode', 'agents');
  const destFile = join(destDir, `${name}.md`);
  if (existsSync(destFile)) {
    log(`Agent '${name}' already installed`, 'warn');
    return false;
  }

  ensureDir(destDir);
  writeFileSync(destFile, readFileSync(srcFile, 'utf8'));

  // Register in opencode.json
  const configPath = join(projectRoot, 'opencode.json');
  if (existsSync(configPath)) {
    const config = JSON.parse(readFileSync(configPath, 'utf8'));
    if (!config.agent) config.agent = {};
    if (!config.agent[name]) {
      config.agent[name] = {
        mode: 'subagent',
        description: `${name.replace(/-/g, ' ')} specialist`,
        permission: { edit: 'deny' },
      };
      writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
      log(`Registered '${name}' in opencode.json`, 'ok');
    }
  }

  log(`Installed agent '${name}' → .opencode/agents/${name}.md`, 'ok');
  updateAgentsMd(projectRoot);
  return true;
}

function installScript(name, projectRoot) {
  const srcFile = join(REPO_ROOT, 'shared', 'scripts', `${name}.js`);
  if (!existsSync(srcFile)) {
    log(`Script '${name}.js' not found`, 'err');
    const available = listNames('script');
    if (available.length) log(`Available: ${available.join(', ')}`, 'info');
    return false;
  }

  const destDir = join(projectRoot, 'shared', 'scripts');
  const destFile = join(destDir, `${name}.js`);
  if (existsSync(destFile)) {
    log(`Script '${name}' already installed`, 'warn');
    return false;
  }

  ensureDir(destDir);
  writeFileSync(destFile, readFileSync(srcFile, 'utf8'));
  log(`Installed script '${name}' → shared/scripts/${name}.js`, 'ok');
  updateAgentsMd(projectRoot);
  return true;
}

function installPrompt(name, projectRoot) {
  const srcFile = join(REPO_ROOT, 'shared', 'prompts', `${name}.md`);
  if (!existsSync(srcFile)) {
    log(`Prompt '${name}.md' not found`, 'err');
    const available = listNames('prompt');
    if (available.length) log(`Available: ${available.join(', ')}`, 'info');
    return false;
  }

  const destDir = join(projectRoot, 'shared', 'prompts');
  const destFile = join(destDir, `${name}.md`);
  if (existsSync(destFile)) {
    log(`Prompt '${name}' already installed`, 'warn');
    return false;
  }

  ensureDir(destDir);
  writeFileSync(destFile, readFileSync(srcFile, 'utf8'));
  log(`Installed prompt '${name}' → shared/prompts/${name}.md`, 'ok');
  updateAgentsMd(projectRoot);
  return true;
}

function installRule(name, projectRoot) {
  const srcFile = join(REPO_ROOT, 'shared', 'rules', `${name}.md`);
  if (!existsSync(srcFile)) {
    log(`Rule '${name}.md' not found`, 'err');
    const available = listNames('rule');
    if (available.length) log(`Available: ${available.join(', ')}`, 'info');
    return false;
  }

  const destDir = join(projectRoot, 'shared', 'rules');
  const destFile = join(destDir, `${name}.md`);
  if (existsSync(destFile)) {
    log(`Rule '${name}' already installed`, 'warn');
    return false;
  }

  ensureDir(destDir);
  writeFileSync(destFile, readFileSync(srcFile, 'utf8'));
  log(`Installed rule '${name}' → shared/rules/${name}.md`, 'ok');
  updateAgentsMd(projectRoot);
  return true;
}

/* ─── uninstall functions ─── */

function uninstallPlatform(projectRoot) {
  if (!opencodeInstalled(projectRoot)) {
    log('No opencode installation found in this project', 'info');
    return false;
  }

  const dotOpenCode = join(projectRoot, '.opencode');
  const configFile = join(projectRoot, 'opencode.json');

  if (isDir(dotOpenCode)) {
    rmSync(dotOpenCode, { recursive: true, force: true });
  }
  if (existsSync(configFile)) {
    rmSync(configFile, { force: true });
  }

  log(`Uninstalled opencode from ${projectRoot}/`, 'ok');
  updateAgentsMd(projectRoot);
  return true;
}

function uninstallSkill(name, projectRoot) {
  const dest = join(projectRoot, '.opencode', 'skills', name);
  if (!isDir(dest)) {
    log(`Skill '${name}' not installed`, 'info');
    return false;
  }

  rmSync(dest, { recursive: true, force: true });
  log(`Uninstalled skill '${name}' from .opencode/skills/`, 'ok');
  updateAgentsMd(projectRoot);
  return true;
}

function uninstallAgent(name, projectRoot) {
  const destDir = join(projectRoot, '.opencode', 'agents');
  const destFile = join(destDir, `${name}.md`);
  if (!existsSync(destFile)) {
    log(`Agent '${name}' not installed`, 'info');
    return false;
  }

  rmSync(destFile, { force: true });

  // Remove from opencode.json
  const configPath = join(projectRoot, 'opencode.json');
  if (existsSync(configPath)) {
    const config = JSON.parse(readFileSync(configPath, 'utf8'));
    if (config.agent?.[name]) {
      delete config.agent[name];
      writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
      log(`Removed '${name}' from opencode.json`, 'ok');
    }
  }

  log(`Uninstalled agent '${name}' from .opencode/agents/`, 'ok');
  updateAgentsMd(projectRoot);
  return true;
}

function uninstallScript(name, projectRoot) {
  const destFile = join(projectRoot, 'shared', 'scripts', `${name}.js`);
  if (!existsSync(destFile)) {
    log(`Script '${name}' not installed`, 'info');
    return false;
  }

  rmSync(destFile, { force: true });
  log(`Uninstalled script '${name}' from shared/scripts/`, 'ok');
  updateAgentsMd(projectRoot);
  return true;
}

function uninstallPrompt(name, projectRoot) {
  const destFile = join(projectRoot, 'shared', 'prompts', `${name}.md`);
  if (!existsSync(destFile)) {
    log(`Prompt '${name}' not installed`, 'info');
    return false;
  }

  rmSync(destFile, { force: true });
  log(`Uninstalled prompt '${name}' from shared/prompts/`, 'ok');
  updateAgentsMd(projectRoot);
  return true;
}

function uninstallRule(name, projectRoot) {
  const destFile = join(projectRoot, 'shared', 'rules', `${name}.md`);
  if (!existsSync(destFile)) {
    log(`Rule '${name}' not installed`, 'info');
    return false;
  }

  rmSync(destFile, { force: true });
  log(`Uninstalled rule '${name}' from shared/rules/`, 'ok');
  updateAgentsMd(projectRoot);
  return true;
}

/* ─── other commands ─── */

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
  } catch (e) {
    log('npm install failed. Run it manually.', 'warn');
  }
  log('Update complete', 'ok');
}

function syncProject(projectRoot) {
  projectRoot = projectRoot || process.cwd();
  if (!opencodeInstalled(projectRoot)) {
    log('No opencode installation found. Run `arai install` first.', 'info');
    return;
  }

  // Re-copy platforms/opencode/ to .opencode/ preserving existing skills/agents
  const source = join(REPO_ROOT, 'platforms', 'opencode');
  if (!isDir(source)) {
    log('platforms/opencode/ not found', 'err');
    return;
  }

  const dotOpenCode = join(projectRoot, '.opencode');
  ensureDir(dotOpenCode);

  for (const sub of ['agents', 'commands']) {
    const src = join(source, sub);
    const dst = join(dotOpenCode, sub);
    if (isDir(src)) {
      // Only copy files that don't already exist
      const srcFiles = readdirSync(src).filter(f => f.endsWith('.md'));
      ensureDir(dst);
      for (const file of srcFiles) {
        const dstFile = join(dst, file);
        if (!existsSync(dstFile)) {
          writeFileSync(dstFile, readFileSync(join(src, file), 'utf8'));
        }
      }
    }
  }

  // Re-apply opencode.json (overwrite)
  const configSrc = join(source, 'opencode.json');
  const configDst = join(projectRoot, 'opencode.json');
  if (existsSync(configSrc)) {
    writeFileSync(configDst, readFileSync(configSrc, 'utf8'));
  }

  log(`Re-synced opencode config in ${projectRoot}`, 'ok');
}

/* ─── dynamic AGENTS.md helpers ─── */

function buildDirectoryTree(projectDir) {
  const indent = '  ';
  const lines = [];
  const topDirs = [];

  // Collect top-level directory branches
  const sharedDirs = ['agents', 'skills', 'prompts', 'scripts', 'rules']
    .filter(d => isDir(join(projectDir, 'shared', d)));
  if (sharedDirs.length > 0) topDirs.push({ name: 'shared', children: sharedDirs, label: 'Centralized reusable assets' });

  const platformDirs = existsSync(join(projectDir, 'platforms'))
    ? readdirSync(join(projectDir, 'platforms')).filter(d => isDir(join(projectDir, 'platforms', d)))
    : [];
  if (platformDirs.length > 0) topDirs.push({ name: 'platforms', children: platformDirs, label: 'Agent configurations' });

  const assetDirs = existsSync(join(projectDir, 'assets'))
    ? readdirSync(join(projectDir, 'assets')).filter(d => isDir(join(projectDir, 'assets', d)))
    : [];
  if (assetDirs.length > 0) topDirs.push({ name: 'assets', children: assetDirs, label: 'Brand logos, CSS templates, decks, images' });

  if (isDir(join(projectDir, 'repos'))) topDirs.push({ name: 'repos', children: [], label: 'Cloned reference repos (gitignored)' });

  const rootFiles = ['AGENTS.md', 'README.md', 'opencode.json', 'package.json', 'repos.json']
    .filter(f => existsSync(join(projectDir, f)));

  // Render tree
  for (let i = 0; i < topDirs.length; i++) {
    const dir = topDirs[i];
    const isLastTop = i === topDirs.length - 1 && rootFiles.length === 0;
    const prefix = isLastTop ? '└── ' : '├── ';
    lines.push(`${indent}${prefix}${dir.name}/${dir.label ? `  ${dir.label}` : ''}`);

    // Children of this dir
    for (let j = 0; j < dir.children.length; j++) {
      const child = dir.children[j];
      const isLastChild = j === dir.children.length - 1;
      const childPrefix = isLastTop ? `${indent}    ` : `${indent}│   `;
      lines.push(`${childPrefix}${isLastChild ? '└── ' : '├── '}${child}/`);
    }
  }

  // Root-level files (same prefix as directories since all under project_name/)
  for (let i = 0; i < rootFiles.length; i++) {
    const f = rootFiles[i];
    const isLast = i === rootFiles.length - 1;
    lines.push(`${indent}${isLast ? '└── ' : '├── '}${f}`);
  }

  return lines.join('\n');
}

function buildAgentsTable(agents) {
  const names = Object.keys(agents);
  if (names.length === 0) return '  (none configured)';
  return names.map(name => {
    const a = agents[name];
    const mode = a.mode || 'subagent';
    const perms = a.permission ? Object.entries(a.permission).map(([k, v]) => `${k}: ${v}`).join(', ') : '—';
    const defaultMark = name === 'build' ? ' (default)' : '';
    return `| **${name}**${defaultMark} | ${mode} | ${perms} |`;
  }).join('\n');
}

function buildSkillsTable(projectDir) {
  const skillsDir = join(projectDir, 'shared', 'skills');
  if (!isDir(skillsDir)) return '  (none installed)';
  const skills = readdirSync(skillsDir).filter(f => isDir(join(skillsDir, f)));
  if (skills.length === 0) return '  (none installed)';
  return skills.map(name => {
    const skPath = join(skillsDir, name, 'SKILL.md');
    const desc = existsSync(skPath)
      ? (readFileSync(skPath, 'utf8').match(/^description:\s*(.+)/m)?.[1] || '')
      : '';
    return `| ${name} | ${desc} |`;
  }).join('\n');
}

function buildCliTable() {
  // CLI appropriate for init projects (no update/sync — those reference aramirez-ai)
  return [
    '| `arai init <dir>` | Scaffold new project (`--template minimal\\|full`, `--description`) |',
    '| `arai install` | Install opencode platform in project |',
    '| `arai install <type> <name>` | Install component: skill, agent, script, prompt, rule |',
    '| `arai uninstall` | Uninstall opencode platform from project |',
    '| `arai uninstall <type> <name>` | Uninstall a specific component |',
    '| `arai status` | Show installation status in current directory |',
    '| `arai list skills\\|agents\\|scripts\\|templates\\|commands\\|mcp` | List resources |',
    '| `arai generate skill <name>` | Create skill in shared/skills/ |',
    '| `arai generate agent <name>` | Create agent + register in opencode.json |',
    '| `arai generate script <name>` | Create reusable script |',
    '| `arai generate command <name>` | Create opencode command |',
    '| `arai generate brand` | Set brand identity (colors, logos) |',
    '| `arai generate kb [dir]` | Create Obsidian vault (`--force` to overwrite) |',
  ].join('\n');
}

function buildVarsFromProjectState(projectDir) {
  const agentsTable = '';
  const configPath = join(projectDir, 'platforms', 'opencode', 'opencode.json');
  if (existsSync(configPath)) {
    try {
      const config = JSON.parse(readFileSync(configPath, 'utf8'));
      return {
        directory_tree: buildDirectoryTree(projectDir),
        agents_table: buildAgentsTable(config.agent || {}),
        skills_table: buildSkillsTable(projectDir),
        cli_table: buildCliTable(),
      };
    } catch { /* fall through to defaults */ }
  }
  return {
    directory_tree: buildDirectoryTree(projectDir),
    agents_table: buildAgentsTable({}),
    skills_table: buildSkillsTable(projectDir),
    cli_table: buildCliTable(),
  };
}

function updateAgentsMd(projectDir) {
  const agentsPartial = resolvePartial('AGENTS.md');
  if (!agentsPartial) return;
  const destPath = join(projectDir, 'AGENTS.md');
  if (!existsSync(destPath)) return;
  const vars = {
    ...buildVarsFromProjectState(projectDir),
    project_name: basename(projectDir),
    project_description: '',
  };
  writeFileSync(destPath, applyVars(agentsPartial, vars));
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

  if (existsSync(absTarget) && readdirSync(absTarget).length > 0) {
    log(`Directory ${absTarget} already exists and is not empty`, 'err');
    return false;
  }

  ensureDir(absTarget);
  log(`Scaffolding '${templateName}' template in ${absTarget}...`, 'info');

  // .gitignore
  const gitignorePartial = resolvePartial('.gitignore');
  if (gitignorePartial) {
    writeFileSync(join(absTarget, '.gitignore'), gitignorePartial);
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

  // AGENTS.md (generated at end with full project state)
  const agentsPartial = resolvePartial('AGENTS.md');
  if (agentsPartial) {
    const dynamicVars = buildVarsFromProjectState(absTarget);
    writeFileSync(join(absTarget, 'AGENTS.md'), applyVars(agentsPartial, { ...allVars, ...dynamicVars }));
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
  updateAgentsMd(projectDir);
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
        model: 'opencode/big-pickle',
        permission: { edit: 'deny' },
      };
      writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
      log(`Registered '${name}' in platforms/opencode/opencode.json`, 'ok');
    }
  }

  updateAgentsMd(projectDir);
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
  try { execSync(`chmod +x "${filePath}"`); } catch { /* ok */ }
  log(`Created shared/scripts/${name}.js`, 'ok');
  updateAgentsMd(projectDir);
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
  updateAgentsMd(projectDir);
  return true;
}

function generateBrand(projectDir, opts) {
  const brandPath = join(projectDir, 'shared', 'brand.json');
  let brand;

  if (!existsSync(brandPath)) {
    const defaultBrand = {
      brand: {
        name: opts.name || 'My Brand',
        colors: {
          primary: '#1a365d',
          secondary: '#2d69c2',
          accent: '#e8a838',
          text: '#1a202c',
          background: '#ffffff',
          'light-bg': '#f7fafc',
        },
        logo: '',
        logo_white: '',
      },
    };
    brand = defaultBrand;
    ensureDir(join(projectDir, 'shared'));
    writeFileSync(brandPath, JSON.stringify(brand, null, 2) + '\n');
    log(`Created shared/brand.json with defaults`, 'ok');
  } else {
    brand = JSON.parse(readFileSync(brandPath, 'utf8'));
  }

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
    brand.brand.logo = `assets/images/${logoExt}`;
    writeFileSync(brandPath, JSON.stringify(brand, null, 2) + '\n');
    log(`Copied logo → assets/images/${logoExt}`, 'ok');
  }

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

function skillsSync(projectDir, skillName) {
  const skillsDir = join(REPO_ROOT, 'shared', 'skills');
  if (!isDir(skillsDir)) { log('No shared/skills/ found', 'err'); return; }

  const allSkills = readdirSync(skillsDir).filter(f => isDir(join(skillsDir, f)));
  if (allSkills.length === 0) { log('No skills to sync', 'info'); return; }

  const skills = skillName
    ? (allSkills.includes(skillName) ? [skillName] : (log(`Skill '${skillName}' not found in shared/skills/`, 'err'), null))
    : allSkills;
  if (!skills) return;

  const dest = join(resolve(projectDir), '.opencode', 'skills');
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

  log(`Synced ${count} skill(s) → ${projectDir}/.opencode/skills/`, 'ok');
}

/* ─── list functions ─── */

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
  const configPath = join(REPO_ROOT, 'platforms', 'opencode', 'opencode.json');
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
  const cmdsDir = join(REPO_ROOT, 'platforms', 'opencode', 'commands');
  if (!isDir(cmdsDir)) { log('No platforms/opencode/commands/ directory', 'err'); return; }
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
  const configPath = join(REPO_ROOT, 'platforms', 'opencode', 'opencode.json');
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

/* ─── generate kb ─── */

function kbInstall(targetDir, force) {
  const dest = resolve(targetDir || '.', 'kb');
  if (existsSync(dest) && !force) {
    log(`kb/ already exists at ${dest}. Use --force to overwrite.`, 'warn');
    return;
  }
  if (existsSync(dest) && force) {
    rmSync(dest, { recursive: true, force: true });
  }

  const kbDir = dest;
  const obsidianDir = join(kbDir, '.obsidian');
  ensureDir(obsidianDir);
  ensureDir(join(kbDir, 'Architecture'));
  ensureDir(join(kbDir, 'Team'));
  ensureDir(join(kbDir, 'Processes'));
  ensureDir(join(kbDir, 'Knowledge'));

  writeFileSync(join(obsidianDir, 'app.json'), JSON.stringify({
    alwaysUpdateLinks: true,
    showLineNumber: false,
    useMarkdownLinks: false,
    showUnsupportedFiles: true,
    attachmentFolderPath: './assets',
  }, null, 2) + '\n');

  writeFileSync(join(obsidianDir, 'graph.json'), JSON.stringify({
    collapseFilter: true,
    showTags: true,
    showAttachments: true,
    showOrphans: true,
  }, null, 2) + '\n');

  writeFileSync(join(obsidianDir, 'workspace.json'), JSON.stringify({
    mode: 'source',
    pinned: true,
    showLineNumber: false,
  }, null, 2) + '\n');

  writeFileSync(join(kbDir, 'Index.md'), `# Knowledge Base

## Structure

- [[Architecture/Index|Architecture]] — system design, decisions, ADRs
- [[Team/Index|Team]] — profiles, roles, responsibilities
- [[Processes/Index|Processes]] — workflows, SOPs, runbooks
- [[Knowledge/Index|Knowledge]] — reference, guides, documentation

## Usage

This vault uses \`[[wikilinks]]\` for cross-referencing. Keep notes atomic and well-linked.
`);

  for (const dir of ['Architecture', 'Team', 'Processes', 'Knowledge']) {
    writeFileSync(join(kbDir, dir, 'Index.md'), `# ${dir}\n\n<!-- TODO: populate with ${dir.toLowerCase()} notes -->\n`);
  }

  log(`Created Obsidian vault at ${kbDir}`, 'ok');
  log(`Open it in Obsidian: File → Open Vault Folder → ${kbDir}`, 'info');
}

/* ─── CLI commands ─── */

// --- install ---

program
  .command('install [type] [name]')
  .description('Install opencode platform or components (skill, agent, script, prompt, rule)')
  .option('--project <dir>', 'Project directory', '.')
  .action((type, name, opts) => {
    const projectRoot = resolve(opts.project);
    if (!type) return installPlatform(projectRoot);
    if (!VALID_TYPES.includes(type)) {
      log(`Unknown type: '${type}'. Valid: ${VALID_TYPES.join(', ')}`, 'err');
      return;
    }
    if (!name) {
      log(`Missing <name> argument for type '${type}'`, 'err');
      return;
    }
    const installers = { skill: installSkill, agent: installAgent, script: installScript, prompt: installPrompt, rule: installRule };
    installers[type](name, projectRoot);
  });

// --- uninstall ---

program
  .command('uninstall [type] [name]')
  .description('Uninstall opencode platform or components (skill, agent, script, prompt, rule)')
  .option('--project <dir>', 'Project directory', '.')
  .action((type, name, opts) => {
    const projectRoot = resolve(opts.project);
    if (!type) return uninstallPlatform(projectRoot);
    if (!VALID_TYPES.includes(type)) {
      log(`Unknown type: '${type}'. Valid: ${VALID_TYPES.join(', ')}`, 'err');
      return;
    }
    if (!name) {
      log(`Missing <name> argument for type '${type}'`, 'err');
      return;
    }
    const uninstallers = { skill: uninstallSkill, agent: uninstallAgent, script: uninstallScript, prompt: uninstallPrompt, rule: uninstallRule };
    uninstallers[type](name, projectRoot);
  });

// --- status ---

program
  .command('status')
  .description('Show installation status')
  .action(showStatus);

// --- update ---

program
  .command('update')
  .description('Pull latest changes and install dependencies')
  .action(doUpdate);

// --- sync ---

program
  .command('sync [type] [name]')
  .description('Sync project config or components (skill)')
  .option('--project <dir>', 'Project directory', '.')
  .action((type, name, opts) => {
    const projectRoot = resolve(opts.project);
    if (!type) return syncProject(projectRoot);
    if (!VALID_TYPES.includes(type)) {
      log(`Unknown type: '${type}'. Valid: ${VALID_TYPES.join(', ')}`, 'err');
      return;
    }
    if (type === 'skill') {
      return skillsSync(projectRoot, name || null);
    }
    log(`Sync for type '${type}' not yet implemented`, 'info');
  });

// --- init ---

program
  .command('init <dir>')
  .description('Scaffold a new project with AI agent configuration')
  .option('--template <name>', 'Template to use (minimal, full)', 'minimal')
  .option('--description <desc>', 'Project description')
  .action((dir, opts) => {
    scaffoldProject(dir, opts.template, { description: opts.description });
  });

// --- generate ---

const generateCmd = program
  .command('generate')
  .description('Generate AI agent components (skill, agent, script, command, brand, kb)');

generateCmd
  .command('skill <name>')
  .description('Create a new skill in shared/skills/<name>/SKILL.md')
  .option('--dir <path>', 'Project root directory', '.')
  .action((name, opts) => {
    const root = findProjectRoot(opts.dir);
    if (!root) { log('Not inside an arai project. Run `arai init` first.', 'err'); return; }
    generateSkill(name, root);
  });

generateCmd
  .command('agent <name>')
  .description('Create a new agent in shared/agents/<name>.md and register in opencode.json')
  .option('--dir <path>', 'Project root directory', '.')
  .option('--description <desc>', 'Agent description')
  .action((name, opts) => {
    const root = findProjectRoot(opts.dir);
    if (!root) { log('Not inside an arai project. Run `arai init` first.', 'err'); return; }
    generateAgent(name, root, opts.description);
  });

generateCmd
  .command('script <name>')
  .description('Create a new reusable script in shared/scripts/<name>.js')
  .option('--dir <path>', 'Project root directory', '.')
  .option('--description <desc>', 'Script description')
  .action((name, opts) => {
    const root = findProjectRoot(opts.dir);
    if (!root) { log('Not inside an arai project. Run `arai init` first.', 'err'); return; }
    generateScript(name, root, opts.description);
  });

generateCmd
  .command('command <name>')
  .description('Create a new opencode command in platforms/opencode/commands/<name>.md')
  .option('--dir <path>', 'Project root directory', '.')
  .option('--description <desc>', 'Command description')
  .action((name, opts) => {
    const root = findProjectRoot(opts.dir);
    if (!root) { log('Not inside an arai project. Run `arai init` first.', 'err'); return; }
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
    if (!root) { log('Not inside an arai project. Run `arai init` first.', 'err'); return; }
    generateBrand(root, opts);
  });

generateCmd
  .command('kb [dir]')
  .description('Create an Obsidian knowledge base vault in the specified directory')
  .option('--force', 'Overwrite existing kb/ directory')
  .action((dir, opts) => {
    kbInstall(dir || '.', opts.force);
  });

// --- list ---

const listCmd = program
  .command('list')
  .description('List available resources (skills, agents, scripts, templates, commands, mcp)');

listCmd
  .command('skills')
  .description('List available shared skills')
  .action(listSkills);

listCmd
  .command('agents')
  .description('List agents registered in opencode.json')
  .action(listAgents);

listCmd
  .command('scripts')
  .description('List available scripts in shared/scripts/')
  .action(listScripts);

listCmd
  .command('templates')
  .description('List available scaffolding templates')
  .action(listTemplates);

listCmd
  .command('commands')
  .description('List opencode commands')
  .action(listCommands);

listCmd
  .command('mcp')
  .description('List configured MCP servers')
  .action(listMcp);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
