#!/usr/bin/env node
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { parseArgs, writeFileNow, showHelp, println } from './create-base.js';

const USAGE = `node shared/scripts/harness-generator.js --project <json> --output <dir> [options]`;
const DESC = 'Generates a complete opencode harness configuration from a project description JSON.';

const OPTIONS = {
  '--project':   '(required) Path to project JSON file',
  '--output':    'Output directory (default: ./harness-output)',
  '--dry-run':   'Print files without writing',
  '--help':      'Show this help',
};

const KNOWN_AGENTS = {
  build: {
    description: 'Primary builder agent',
    mode: 'primary',
    edit: 'allow', bash: 'allow', read: 'allow',
    prompt: `You are the build agent, responsible for implementing features, fixing bugs, and writing code.

Guidelines:
- Write clean, maintainable, and well-structured code.
- Follow the project's conventions, style, and architecture.
- Run tests before and after making changes.
- Commit frequently with descriptive messages.
- Ask for clarification when requirements are ambiguous.`,
  },
  plan: {
    description: 'Strategic planning agent',
    mode: 'primary',
    edit: 'deny', bash: 'allow', read: 'allow',
    prompt: `You are the plan agent, responsible for analyzing requirements and designing solutions before code is written.

Guidelines:
- Break down tasks into clear, actionable steps.
- Identify risks, dependencies, and edge cases early.
- Propose architecture and design decisions with rationale.
- Estimate effort and suggest implementation order.
- Do not write code — focus on planning and analysis.`,
  },
  reviewer: {
    description: 'Code review specialist',
    mode: 'subagent',
    edit: 'deny', bash: 'ask', read: 'allow',
    prompt: `You are a code review specialist. Analyze code changes for quality, security, performance, and maintainability.

Guidelines:
- Identify potential bugs, logic errors, and edge cases.
- Flag security vulnerabilities (injection, XSS, CSRF, auth issues).
- Suggest performance improvements and better algorithms.
- Enforce code style consistency and best practices.
- Provide constructive, actionable feedback with specific examples.`,
  },
  tester: {
    description: 'Testing specialist',
    mode: 'subagent',
    edit: 'allow', bash: 'allow', read: 'allow',
    prompt: `You are a testing specialist focused on test-driven development and quality assurance.

Guidelines:
- Write tests before or alongside implementation code.
- Cover unit, integration, and edge-case scenarios.
- Ensure test isolation — no shared mutable state between tests.
- Use descriptive test names that explain expected behavior.
- Follow the project's existing test framework and conventions.`,
  },
  docs: {
    description: 'Documentation specialist',
    mode: 'subagent',
    edit: 'allow', bash: 'deny', read: 'allow',
    prompt: `You are a documentation specialist responsible for creating and maintaining project documentation.

Guidelines:
- Write clear, concise, and well-structured documentation.
- Use consistent terminology and formatting throughout.
- Include practical examples for APIs, configuration, and workflows.
- Document trade-offs, assumptions, and known limitations.
- Keep language simple and accessible to the intended audience.`,
  },
};

function loadProject(filePath) {
  let raw;
  try {
    raw = readFileSync(resolve(filePath), 'utf8');
  } catch (err) {
    println(`  Error: Cannot read project file "${filePath}": ${err.message}`);
    process.exit(1);
  }

  let project;
  try {
    project = JSON.parse(raw);
  } catch {
    println('  Error: Project file must be valid JSON');
    process.exit(1);
  }

  if (!project.name) { println('  Error: Project JSON must include "name"'); process.exit(1); }
  if (!project.type) { println('  Error: Project JSON must include "type"'); process.exit(1); }
  if (!project.language) { println('  Error: Project JSON must include "language"'); process.exit(1); }

  return project;
}

function getStrictnessSettings(strictness) {
  switch (strictness) {
    case 'strict':
      return {
        permission: {
          bash: { 'npm *': 'allow', 'npx *': 'ask', '*': 'ask' },
          edit: 'ask',
          read: 'allow',
        },
      };
    case 'relaxed':
      return {
        permission: {
          bash: { '*': 'allow' },
          edit: 'allow',
          read: 'allow',
        },
      };
    case 'balanced':
    default:
      return {
        permission: {
          bash: { 'git *': 'allow', 'npm *': 'allow', 'npx *': 'ask', '*': 'ask' },
          edit: 'ask',
          read: 'allow',
        },
      };
  }
}

function buildOpencodeConfig(project, outputDir) {
  const model = project.model || 'opencode/big-pickle';
  const small_model = project.small_model || 'anthropic/claude-haiku-4-5';
  const workflow = project.workflow || 'plan-first';
  const strictnessSettings = getStrictnessSettings(project.strictness);

  const skillPaths = ['.opencode/skills', '~/.config/opencode/skills'];
  if (project.skills && project.skills.length > 0) {
    project.skills.forEach(s => {
      const p = `.opencode/skills/${s}`;
      if (!skillPaths.includes(p)) skillPaths.push(p);
    });
  }

  const config = {
    $schema: 'https://opencode.ai/config.json',
    model,
    small_model,
    default_agent: project.agents && project.agents.length > 0 ? project.agents[0] : 'build',
    shell: '/bin/zsh',
    instructions: ['AGENTS.md'],
    skills: { paths: skillPaths },
    agent: {},
    command: {},
    mcp: {},
    references: project.references || {},
    ...strictnessSettings,
    formatter: true,
    lsp: true,
    compaction: {
      auto: true,
      tail_turns: 10,
    },
    tool_output: {
      max_lines: 1000,
      max_bytes: 40960,
    },
  };

  if (project.agents) {
    for (const name of project.agents) {
      const known = KNOWN_AGENTS[name];
      config.agent[name] = {
        description: known ? known.description : `${name} agent`,
        mode: known ? known.mode : 'subagent',
      };
    }
  }

  if (project.mcps) {
    for (const mcp of project.mcps) {
      config.mcp[mcp.name] = {
        type: mcp.type,
        url: mcp.url,
      };
      if (mcp.header) {
        config.mcp[mcp.name].header = mcp.header;
      }
    }
  }

  if (project.commands) {
    for (const cmd of project.commands) {
      config.command[cmd.name] = {
        template: cmd.template,
      };
    }
  }

  return JSON.stringify(config, null, 2) + '\n';
}

function buildAgentsMd(project) {
  const agents = project.agents || ['build'];
  const lines = [
    `# ${project.name} — AI Agent Instructions`,
    '',
    `**Type:** ${project.type}  `,
    `**Language:** ${project.language}  `,
    `**Model:** ${project.model || 'opencode/big-pickle'}  `,
    `**Workflow:** ${project.workflow || 'plan-first'}  `,
    `**Strictness:** ${project.strictness || 'balanced'}  `,
    '',
    project.description ? `> ${project.description}\n` : '',
    '## Agents',
    '',
  ];

  for (const name of agents) {
    const known = KNOWN_AGENTS[name];
    const desc = known ? known.description : `${name} agent`;
    lines.push(`- **${name}**: ${desc}`);
  }

  lines.push('', '## Workflow', '');
  if (project.workflow === 'plan-first') {
    lines.push('1. **Plan** analyzes requirements and designs a solution.');
    lines.push('2. **Build** implements the plan.');
    lines.push('3. **Tester** validates with tests.');
    lines.push('4. **Reviewer** audits code quality.');
    lines.push('5. **Docs** updates documentation.');
  } else {
    lines.push('Follow the standard development workflow: code, test, review, deploy.');
  }

  if (project.commands) {
    lines.push('', '## Commands', '');
    for (const cmd of project.commands) {
      lines.push(`- \`${cmd.name}\`: ${cmd.template}`);
    }
  }

  lines.push('');
  return lines.join('\n');
}

function buildAgentFile(name, project) {
  const known = KNOWN_AGENTS[name];
  if (known) {
    const lines = ['---'];
    lines.push(`description: ${known.description}`);
    lines.push(`mode: ${known.mode}`);
    if (project.model) lines.push(`model: ${project.model}`);
    lines.push('permission:');
    lines.push(`  edit: ${known.edit}`);
    lines.push(`  bash: ${known.bash}`);
    lines.push(`  read: ${known.read}`);
    lines.push('---');
    lines.push('');
    lines.push(known.prompt);
    return lines.join('\n') + '\n';
  }

  return `---
description: ${name} agent
mode: subagent
permission:
  edit: allow
  bash: allow
  read: allow
---

You are ${name}, an AI agent specialized in assisting with the ${project.name} project.

Operate according to the following guidelines:
- Mode: subagent
- Always respect the permission boundaries defined in the frontmatter.
- Be concise, accurate, and thorough in your responses.
- Follow the user's instructions precisely.
- Stay within your designated scope.
`;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.help) {
    showHelp('harness-generator.js', USAGE, DESC, OPTIONS);
    process.exit(0);
  }

  if (!opts.project) {
    println('  Error: --project is required');
    process.exit(1);
  }

  const project = loadProject(opts.project);
  const outputDir = resolve(opts.output || './harness-output');
  const dryRun = opts.dryRun;

  const created = [];

  const configContent = buildOpencodeConfig(project, outputDir);
  writeFileNow(resolve(outputDir, 'opencode.json'), configContent, dryRun);
  created.push(resolve(outputDir, 'opencode.json'));

  const agentsMdContent = buildAgentsMd(project);
  writeFileNow(resolve(outputDir, 'AGENTS.md'), agentsMdContent, dryRun);
  created.push(resolve(outputDir, 'AGENTS.md'));

  const agents = project.agents || ['build'];
  for (const name of agents) {
    const agentContent = buildAgentFile(name, project);
    const agentPath = resolve(outputDir, `.opencode/agents/${name}.md`);
    writeFileNow(agentPath, agentContent, dryRun);
    created.push(agentPath);
  }

  if (project.skills && project.skills.length > 0) {
    const skillsDir = resolve(outputDir, '.opencode/skills/.gitkeep');
    writeFileNow(skillsDir, '', dryRun);
    created.push(skillsDir);
  }

  println('');
  println(`  Harness generated for "${project.name}"`);
  println(`  Output: ${outputDir}`);
  println(`  Files created (${created.length}):`);
  for (const f of created) {
    const prefix = dryRun ? '[dry-run] ' : '';
    println(`    ${prefix}${f.replace(outputDir, '.').replace(/^\//, '')}`);
  }
  println('');
}

main();
