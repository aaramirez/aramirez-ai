/**
 * Generate functions — create skills, agents, scripts, commands, brand, kb.
 */

import { readFileSync, writeFileSync, existsSync, rmSync } from 'fs';
import { execSync } from 'child_process';
import { join, resolve, dirname, basename } from 'path';
import { log, ensureDir, REPO_ROOT } from './helpers.js';
import { resolvePartial, applyVars } from './template-utils.js';
import { updateAgentsMd } from './agents-md.js';

function findProjectRoot(start) {
  let dir = resolve(start || '.');
  while (true) {
    if (existsSync(join(dir, 'AGENTS.md')) || existsSync(join(dir, '.opencode', 'skills'))) return dir;
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

  const dir = join(projectDir, '.opencode', 'skills', name);
  if (existsSync(dir)) { log(`Skill '${name}' already exists`, 'warn'); return false; }

  ensureDir(dir);
  writeFileSync(join(dir, 'SKILL.md'), applyVars(template, { name }));
  log(`Created .opencode/skills/${name}/SKILL.md`, 'ok');
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
  const configPath = join(projectDir, 'opencode.json');
  const hasOpenCode = existsSync(configPath);

  writeFileSync(filePath, applyVars(template, { name, description: desc }));
  log(`Created shared/agents/${name}.md`, 'ok');

  if (hasOpenCode) {
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
      log(`Registered '${name}' in opencode.json`, 'ok');
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

  const commandsDir = join(projectDir, '.opencode', 'commands');
  ensureDir(commandsDir);

  const filePath = join(commandsDir, `${name}.md`);
  if (existsSync(filePath)) { log(`Command '${name}' already exists`, 'warn'); return false; }

  const desc = description || `${name.replace(/-/g, ' ')} command`;
  writeFileSync(filePath, applyVars(template, { name, description: desc }));

  const configPath = join(projectDir, 'opencode.json');
  if (existsSync(configPath)) {
    const config = JSON.parse(readFileSync(configPath, 'utf8'));
    if (!config.command) config.command = {};
    if (!config.command[name]) {
      config.command[name] = { description: desc, template: `Execute the ${name} task.` };
      writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
      log(`Registered '${name}' in opencode.json`, 'ok');
    }
  }

  log(`Created .opencode/commands/${name}.md`, 'ok');
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

export { findProjectRoot, kebabToPascal, generateSkill, generateAgent, generateScript, generateCommand, generateBrand, kbInstall };
