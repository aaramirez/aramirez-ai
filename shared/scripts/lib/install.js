/**
 * Install and uninstall functions for arai components.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, cpSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { REPO_ROOT, log, ensureDir, isDir, listNames, opencodeInstalled } from './helpers.js';
import { updateAgentsMd } from './agents-md.js';

/* ─── helpers ─── */

function ensureOpenCodePackageJson(projectRoot) {
  const pkgPath = join(projectRoot, '.opencode', 'package.json');
  let pkg = {};

  if (existsSync(pkgPath)) {
    try {
      pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    } catch {
      log('Could not parse .opencode/package.json, recreating', 'warn');
    }
  }

  if (pkg.type === 'module') return;

  pkg.type = 'module';
  ensureDir(dirname(pkgPath));
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  log('Ensured .opencode/package.json has "type": "module"', 'ok');
}

/* ─── install ─── */

function installSkillScripts(skillName, projectRoot) {
  const skillMd = join(REPO_ROOT, 'shared', 'skills', skillName, 'SKILL.md');
  if (!existsSync(skillMd)) return;

  const content = readFileSync(skillMd, 'utf8');
  const match = content.match(/^---\n([\s\S]+?)\n---/);
  if (!match) return;

  const fm = match[1];
  const scriptsMatch = fm.match(/^scripts:\s*\n((?:\s+-\s+.+\n?)+)/m);
  if (!scriptsMatch) return;

  const scripts = scriptsMatch[1].split('\n')
    .map(l => l.replace(/^\s*-\s+/, '').trim())
    .filter(Boolean);

  const scriptsDir = join(projectRoot, '.opencode', 'scripts');
  ensureDir(scriptsDir);

  for (const item of scripts) {
    const src = join(REPO_ROOT, 'shared', 'skills', skillName, 'scripts', item);
    const dst = join(scriptsDir, item);
    if (existsSync(dst)) continue;
    if (!existsSync(src)) {
      log(`Script '${item}' declared in skill '${skillName}' not found`, 'warn');
      continue;
    }
    ensureDir(dirname(dst));
    cpSync(src, dst, { recursive: true });
    log(`Installed script '${item}' (from skill '${skillName}')`, 'ok');
  }
}

function installDocgenTemplates(projectRoot) {
  const assetsDir = join(projectRoot, 'assets', 'templates');
  ensureDir(assetsDir);

  const deckCss = join(REPO_ROOT, 'assets', 'templates', 'deck.css');
  if (existsSync(deckCss)) cpSync(deckCss, join(assetsDir, 'deck.css'));

  const reportCss = join(REPO_ROOT, 'assets', 'templates', 'report.css');
  if (existsSync(reportCss)) cpSync(reportCss, join(assetsDir, 'report.css'));

  const specsSrc = join(REPO_ROOT, 'assets', 'templates', 'specs');
  if (existsSync(specsSrc)) cpSync(specsSrc, join(assetsDir, 'specs'), { recursive: true });

  log('Installed docgen templates → assets/templates/', 'ok');
}

function installPlatform(projectRoot) {
  if (opencodeInstalled(projectRoot)) {
    log('opencode already installed in this project', 'warn');
    return false;
  }

  ensureDir(projectRoot);

  const dotOpenCode = join(projectRoot, '.opencode');
  ensureDir(dotOpenCode);

  ensureOpenCodePackageJson(projectRoot);

  const agentsSrc = join(REPO_ROOT, 'shared', 'agents');
  const agentsDst = join(dotOpenCode, 'agents');
  ensureDir(agentsDst);
  if (isDir(agentsSrc)) {
    for (const f of readdirSync(agentsSrc)) {
      if (f.endsWith('.md')) {
        cpSync(join(agentsSrc, f), join(agentsDst, f));
      }
    }
  }

  const commandsSrc = join(REPO_ROOT, 'shared', 'commands');
  const commandsDst = join(dotOpenCode, 'commands');
  ensureDir(commandsDst);
  if (isDir(commandsSrc)) {
    for (const f of readdirSync(commandsSrc)) {
      if (f.endsWith('.md')) {
        cpSync(join(commandsSrc, f), join(commandsDst, f));
      }
    }
  }

  const skillsDst = join(dotOpenCode, 'skills');
  ensureDir(skillsDst);

  const partialSrc = join(REPO_ROOT, 'shared', 'templates', 'partials', 'opencode.json');
  const configDst = join(projectRoot, 'opencode.json');
  if (existsSync(partialSrc)) {
    writeFileSync(configDst, readFileSync(partialSrc, 'utf8'));
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

  installSkillScripts(name, projectRoot);

  const agentSrc = join(REPO_ROOT, 'shared', 'agents', `${name}.md`);
  if (existsSync(agentSrc)) {
    const agentDst = join(projectRoot, '.opencode', 'agents', `${name}.md`);
    if (!existsSync(agentDst)) {
      ensureDir(join(projectRoot, '.opencode', 'agents'));
      cpSync(agentSrc, agentDst);
      log(`Installed agent '${name}' → .opencode/agents/${name}.md`, 'ok');

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
    }
  }

  const commandSrc = join(REPO_ROOT, 'shared', 'commands', `${name}.md`);
  if (existsSync(commandSrc)) {
    const commandDst = join(projectRoot, '.opencode', 'commands', `${name}.md`);
    if (!existsSync(commandDst)) {
      ensureDir(join(projectRoot, '.opencode', 'commands'));
      cpSync(commandSrc, commandDst);
      log(`Installed command '${name}' → .opencode/commands/${name}.md`, 'ok');
    }
  }

  if (name === 'document-generation') {
    installDocgenTemplates(projectRoot);
  }

  updateAgentsMd(projectRoot);
  return true;
}

function installAgent(name, projectRoot) {
  const srcFile = join(REPO_ROOT, 'shared', 'agents', `${name}.md`);
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
  let srcFile = join(REPO_ROOT, 'shared', 'scripts', `${name}.js`);
  if (!existsSync(srcFile)) {
    const skillsDir = join(REPO_ROOT, 'shared', 'skills');
    if (isDir(skillsDir)) {
      for (const skill of readdirSync(skillsDir)) {
        const candidate = join(skillsDir, skill, 'scripts', `${name}.js`);
        if (existsSync(candidate)) { srcFile = candidate; break; }
      }
    }
  }
  if (!existsSync(srcFile)) {
    log(`Script '${name}.js' not found`, 'err');
    const available = listNames('script');
    if (available.length) log(`Available: ${available.join(', ')}`, 'info');
    return false;
  }

  const destDir = join(projectRoot, '.opencode', 'scripts');
  const destFile = join(destDir, `${name}.js`);
  if (existsSync(destFile)) {
    log(`Script '${name}' already installed`, 'warn');
    return false;
  }

  ensureDir(destDir);
  writeFileSync(destFile, readFileSync(srcFile, 'utf8'));
  log(`Installed script '${name}' → .opencode/scripts/${name}.js`, 'ok');
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

  const destDir = join(projectRoot, '.opencode', 'prompts');
  const destFile = join(destDir, `${name}.md`);
  if (existsSync(destFile)) {
    log(`Prompt '${name}' already installed`, 'warn');
    return false;
  }

  ensureDir(destDir);
  writeFileSync(destFile, readFileSync(srcFile, 'utf8'));
  log(`Installed prompt '${name}' → .opencode/prompts/${name}.md`, 'ok');
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

  const destDir = join(projectRoot, '.opencode', 'rules');
  const destFile = join(destDir, `${name}.md`);
  if (existsSync(destFile)) {
    log(`Rule '${name}' already installed`, 'warn');
    return false;
  }

  ensureDir(destDir);
  writeFileSync(destFile, readFileSync(srcFile, 'utf8'));
  log(`Installed rule '${name}' → .opencode/rules/${name}.md`, 'ok');
  updateAgentsMd(projectRoot);
  return true;
}

/* ─── uninstall ─── */

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
  const destFile = join(projectRoot, '.opencode', 'scripts', `${name}.js`);
  if (!existsSync(destFile)) {
    log(`Script '${name}' not installed`, 'info');
    return false;
  }

  rmSync(destFile, { force: true });
  log(`Uninstalled script '${name}' from .opencode/scripts/`, 'ok');
  updateAgentsMd(projectRoot);
  return true;
}

function uninstallPrompt(name, projectRoot) {
  const destFile = join(projectRoot, '.opencode', 'prompts', `${name}.md`);
  if (!existsSync(destFile)) {
    log(`Prompt '${name}' not installed`, 'info');
    return false;
  }

  rmSync(destFile, { force: true });
  log(`Uninstalled prompt '${name}' from .opencode/prompts/`, 'ok');
  updateAgentsMd(projectRoot);
  return true;
}

function uninstallRule(name, projectRoot) {
  const destFile = join(projectRoot, '.opencode', 'rules', `${name}.md`);
  if (!existsSync(destFile)) {
    log(`Rule '${name}' not installed`, 'info');
    return false;
  }

  rmSync(destFile, { force: true });
  log(`Uninstalled rule '${name}' from .opencode/rules/`, 'ok');
  updateAgentsMd(projectRoot);
  return true;
}

export {
  ensureOpenCodePackageJson,
  installPlatform, installSkill, installAgent, installScript, installPrompt, installRule,
  uninstallPlatform, uninstallSkill, uninstallAgent, uninstallScript, uninstallPrompt, uninstallRule,
};
