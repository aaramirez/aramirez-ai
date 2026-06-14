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
  const source = join(REPO_ROOT, 'agents', 'opencode');

  if (!isDir(source)) {
    log(`agents/opencode/ not found in repo`, 'err');
    return false;
  }

  if (existsSync(target) && !statSync(target).isSymbolicLink()) {
    log(`~/.config/opencode already exists and is not a symlink. Backing up...`, 'warn');
    run(`mv "${target}" "${target}.bak"`);
  }

  symlinkTarget(source, target);
  log(`Symlinked agents/opencode/ → ~/.config/opencode/`, 'ok');
  return true;
}

function installOpenCodeProject(projectDir, copyMode = false) {
  const projectRoot = resolve(projectDir);
  const source = join(REPO_ROOT, 'agents', 'opencode');

  if (!isDir(source)) {
    log(`agents/opencode/ not found`, 'err');
    return false;
  }

  ensureDir(projectRoot);

  if (copyMode) {
    const dotOpcodes = ['.opencode', join(projectRoot, '.opencode')];
    const targetDir = join(projectRoot, '.opencode');
    ensureDir(targetDir);

    for (const sub of ['agents', 'commands', 'plugins', 'skills', 'mcp', 'themes']) {
      const src = join(source, sub);
      const dst = join(targetDir, sub);
      if (isDir(src) && !existsSync(dst)) {
        cpSync(src, dst, { recursive: true });
      }
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

function installAgent(agent, scope, dir, copyMode) {
  const agentDir = join(REPO_ROOT, 'agents', agent);
  if (!isDir(agentDir)) {
    log(`Agent '${agent}' not found at agents/${agent}/`, 'err');
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
      log(`Symlinked agents/${agent}/ → ${target}`, 'ok');
    }
  } else if (scope === 'project') {
    if (agent === 'opencode') {
      installOpenCodeProject(dir, copyMode);
    } else {
      const info = AGENT_PATHS[agent];
      const projectRoot = resolve(dir);
      const targetDir = join(projectRoot, info.projectDir);
      ensureDir(targetDir);
      cpSync(agentDir, targetDir, { recursive: true });
      log(`Copied agents/${agent}/ → ${targetDir}`, 'ok');
    }
  }
}

function uninstallAgent(agent) {
  const info = AGENT_PATHS[agent];
  if (!info) { log(`Agent '${agent}' not supported`, 'err'); return; }

  const target = info.global;
  if (existsSync(target) && statSync(target).isSymbolicLink()) {
    unlinkSync(target);
    log(`Removed symlink ${target}`, 'ok');
  } else if (existsSync(target)) {
    log(`${target} exists but is not a symlink. Remove manually.`, 'warn');
  } else {
    log(`${agent} is not installed globally`, 'info');
  }
}

function showStatus() {
  console.log('\n📋 arai status — aramirez-ai\n');

  for (const agent of AGENTS) {
    const info = AGENT_PATHS[agent];
    const target = info.global;
    const agentDir = join(REPO_ROOT, 'agents', agent);
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
  const result = run('git pull --ff-only 2>&1');
  if (result === null) {
    log('Failed to pull. Check git remote.', 'err');
    return;
  }
  log(result, 'ok');
  log('Installing dependencies...', 'info');
  run('npm install');
  log('Done', 'ok');
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
    const cursorRulesDir = join(REPO_ROOT, 'agents', 'cursor', 'rules');
    ensureDir(cursorRulesDir);

    for (const skill of skills) {
      const skillPath = join(skillsDir, skill, 'SKILL.md');
      if (!existsSync(skillPath)) continue;
      const content = readFileSync(skillPath, 'utf8');
      const description = content.match(/^description:\s*(.+)/m)?.[1] || skill;

      const cursorRule = `# ${skill}\n\n${description}\n\n${stripFrontmatter(content)}\n`;
      writeFileSync(join(cursorRulesDir, `${skill}.md`), cursorRule);
    }
    log(`Transformed ${skills.length} skills → agents/cursor/rules/`, 'ok');

  } else if (targetAgent === 'codex') {
    const codexDir = join(REPO_ROOT, 'agents', 'codex');
    ensureDir(codexDir);

    for (const skill of skills) {
      const skillPath = join(skillsDir, skill, 'SKILL.md');
      if (!existsSync(skillPath)) continue;
      const content = readFileSync(skillPath, 'utf8');
      writeFileSync(join(codexDir, `${skill}.md`), stripFrontmatter(content));
    }
    log(`Transformed ${skills.length} skills → agents/codex/`, 'ok');

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
  .description('Uninstall an agent global configuration')
  .action(uninstallAgent);

program
  .command('status')
  .description('Show installation status for all agents')
  .action(showStatus);

program
  .command('update')
  .description('Pull latest changes and re-apply configuration')
  .action(doUpdate);

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
