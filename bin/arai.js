#!/usr/bin/env node

import { Command } from 'commander';
import { resolve } from 'path';
import { createRequire } from 'module';

import { VALID_TYPES, log, pkg } from '../shared/scripts/lib/helpers.js';
import { installPlatform, installSkill, installAgent, installScript, installPrompt, installRule, uninstallPlatform, uninstallSkill, uninstallAgent, uninstallScript, uninstallPrompt, uninstallRule } from '../shared/scripts/lib/install.js';
import { syncProject, skillsSync } from '../shared/scripts/lib/sync.js';
import { scaffoldProject, listTemplates } from '../shared/scripts/lib/scaffold.js';
import { listSkills, listAgents, listScripts, listCommands, listMcp } from '../shared/scripts/lib/list.js';
import { showStatus, doUpdate } from '../shared/scripts/lib/status.js';

const program = new Command();

program
  .name('arai')
  .version(pkg.version)
  .description('aramirez-ai: opencode AI configuration manager');

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

// --- list ---

const listCmd = program
  .command('list')
  .description('List available resources (skills, agents, scripts, templates, commands, mcp)');

listCmd.command('skills').description('List available shared skills').action(listSkills);
listCmd.command('agents').description('List agents registered in opencode.json').action(listAgents);
listCmd.command('scripts').description('List available scripts (standalone + co-located in skills)').action(listScripts);
listCmd.command('templates').description('List available scaffolding templates').action(listTemplates);
listCmd.command('commands').description('List opencode commands').action(listCommands);
listCmd.command('mcp').description('List configured MCP servers').action(listMcp);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
