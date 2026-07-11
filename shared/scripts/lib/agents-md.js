/**
 * Dynamic AGENTS.md helpers — build directory tree, agents table, skills table,
 * CLI table, and update the project's AGENTS.md.
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { join, basename } from 'path';
import { isDir, REPO_ROOT } from './helpers.js';
import { resolvePartial, applyVars } from './template-utils.js';

function buildDirectoryTree(projectDir) {
  const indent = '  ';
  const lines = [];
  const topDirs = [];

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

  for (let i = 0; i < topDirs.length; i++) {
    const dir = topDirs[i];
    const isLastTop = i === topDirs.length - 1 && rootFiles.length === 0;
    const prefix = isLastTop ? '└── ' : '├── ';
    lines.push(`${indent}${prefix}${dir.name}/${dir.label ? `  ${dir.label}` : ''}`);

    for (let j = 0; j < dir.children.length; j++) {
      const child = dir.children[j];
      const isLastChild = j === dir.children.length - 1;
      const childPrefix = isLastTop ? `${indent}    ` : `${indent}│   `;
      lines.push(`${childPrefix}${isLastChild ? '└── ' : '├── '}${child}/`);
    }
  }

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

export { buildDirectoryTree, buildAgentsTable, buildSkillsTable, buildCliTable, buildVarsFromProjectState, updateAgentsMd };
