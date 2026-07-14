#!/usr/bin/env node
/**
 * create-instructions.js — Generate AGENTS.md for opencode agents
 *
 * Usage:
 *   node .opencode/scripts/create-instructions.js --type web --language typescript --description "E-commerce platform" --output ./AGENTS.md
 *   node .opencode/scripts/create-instructions.js --type api --help
 */

import { resolve } from 'path';
import { parseArgs, writeFileNow, showHelp, println } from '../../../scripts/create-base.js';

const USAGE = 'node .opencode/scripts/create-instructions.js [options]';
const DESC = 'Generate an AGENTS.md file with project instructions for opencode agents.';

const PROJECT_TYPES = ['web', 'api', 'cli', 'library', 'mobile', 'data', 'infra'];

function detectLanguage(type) {
  const map = {
    web: 'javascript',
    api: 'typescript',
    cli: 'javascript',
    library: 'typescript',
    mobile: 'typescript',
    data: 'python',
    infra: 'hcl',
  };
  return map[type] || 'javascript';
}

function techStackNotes(type, lang) {
  const stacks = {
    web: 'Node.js, Express, React, or similar framework',
    api: 'Node.js, Fastify, Express, or similar framework',
    cli: 'Node.js, Commander, or similar framework',
    library: 'Node.js, TypeScript, or similar',
    mobile: 'React Native, Expo, or similar',
    data: 'Python, Jupyter, Pandas, or similar',
    infra: 'Terraform, Ansible, or similar',
  };
  return stacks[type] || 'Node.js';
}

function conventionsFor(type, lang) {
  const base = [];
  base.push(`- Use **${lang}** as the primary language`);
  base.push('- Follow language-specific style guides and best practices');

  if (lang === 'typescript' || lang === 'javascript') {
    base.push('- Use ES Module (ESM) syntax for Node.js projects');
    base.push('- Use 2-space indentation');
    base.push('- Use semicolons');
    base.push('- Use single quotes for strings');
    base.push('- Define types/interfaces for all data structures');
    base.push('- Use `const` by default, `let` only when reassigning');
    base.push('- Avoid default exports; use named exports');
  } else if (lang === 'python') {
    base.push('- Follow PEP 8 style guide');
    base.push('- Use 4-space indentation');
    base.push('- Use type hints for function signatures');
    base.push('- Use `snake_case` for variables and functions');
  }

  if (type === 'api') {
    base.push('- Follow RESTful conventions for endpoints');
    base.push('- Use OpenAPI/Swagger for API documentation');
    base.push('- Validate all request inputs');
  } else if (type === 'cli') {
    base.push('- Provide `--help` flag for all commands');
    base.push('- Use meaningful exit codes (0 for success, non-zero for errors)');
  } else if (type === 'web') {
    base.push('- Ensure responsive design and accessibility');
    base.push('- Follow semantic HTML and ARIA best practices');
  } else if (type === 'infra') {
    base.push('- Use infrastructure-as-code principles');
    base.push('- Tag all resources with project and environment identifiers');
  }

  return base;
}

function testingFor(type) {
  const tests = {
    web: 'Vitest or Playwright',
    api: 'Vitest or Supertest',
    cli: 'node:test or Vitest',
    library: 'Vitest or node:test',
    mobile: 'Jest or Detox',
    data: 'pytest',
    infra: 'Terratest or Checkov',
  };
  return tests[type] || 'node:test or Vitest';
}

function testCommandsFor(type) {
  const cmds = {
    web: '`npm test`',
    api: '`npm test`',
    cli: '`npm test`',
    library: '`npm test`',
    mobile: '`npm test`',
    data: '`pytest`',
    infra: '`terraform validate`',
  };
  return cmds[type] || '`npm test`';
}

function buildContent(opts) {
  const type = opts.type || 'web';
  const lang = opts.language || detectLanguage(type);
  const description = opts.description || '';
  const workflow = opts.workflow || 'plan-first';
  const conventions = conventionsFor(type, lang);
  const techStack = techStackNotes(type, lang);
  const testingTool = testingFor(type);
  const testCmd = testCommandsFor(type);
  const name = opts.name || 'my-project';

  const workflowDesc = workflow === 'plan-first'
    ? 'For any significant change, start by analyzing the problem and creating a plan. Present the plan to the user before writing code.'
    : 'Start by understanding the codebase structure. Write code first, then verify with tests. For complex changes, create a brief plan upfront.';

  const lines = [];

  lines.push(`# ${name} — AI Agent Instructions`);
  lines.push('');
  if (description) {
    lines.push(description);
    lines.push('');
  }
  lines.push('This repository is configured with **aramirez-ai** — an opencode AI configuration manager.');
  lines.push('');

  // ── Project Overview ──
  lines.push('## Project overview');
  lines.push('');
  lines.push(`This is a **${type}** project built with **${lang}**.`);
  if (description) {
    lines.push(` ${description}`);
  }
  lines.push('');

  // ── Tech stack ──
  lines.push('## Tech stack');
  lines.push('');
  lines.push(`- **Language:** ${lang}`);
  lines.push(`- **Runtime/Framework:** ${techStack}`);
  lines.push(`- **Testing:** ${testingTool}`);
  lines.push('');

  // ── Development workflow ──
  lines.push('## Development workflow');
  lines.push('');
  lines.push(workflowDesc);
  lines.push('');

  // ── Code conventions ──
  lines.push('## Code conventions');
  lines.push('');
  for (const c of conventions) {
    lines.push(c);
  }
  lines.push('');

  // ── Agent instructions ──
  lines.push('## Agent instructions');
  lines.push('');
  lines.push('| Agent | Mode | Description |');
  lines.push('|-------|------|-------------|');
  lines.push('| **build** (default) | primary | Default build agent for coding tasks |');
  lines.push('| **plan** | primary | Planning agent for architecture and design (edit: deny) |');
  lines.push('| **reviewer** | subagent | Code review specialist (edit: deny) |');
  lines.push('| **tester** | subagent | Testing specialist (bash: allow) |');
  lines.push('| **docs** | subagent | Documentation specialist (edit: allow, bash: deny) |');
  lines.push('');

  // ── Commit conventions ──
  lines.push('## Commit conventions');
  lines.push('');
  lines.push('Use conventional commits:');
  lines.push('');
  lines.push('```');
  lines.push('<type>(<scope>): <description>');
  lines.push('```');
  lines.push('');
  lines.push('Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`, `perf`.');

  if (type === 'api' || type === 'web') {
    lines.push(' Scope should reflect the module or endpoint changed.');
  }
  lines.push('');

  // ── Test conventions ──
  lines.push('## Test conventions');
  lines.push('');
  lines.push(`- Use **${testingTool}** for testing`);
  lines.push(`- Run ${testCmd} before pushing changes`);
  lines.push('- Place test files alongside source files (`*.test.js` or `__tests__/`)');
  lines.push('- Every new feature must include tests');
  lines.push('- Bug fixes must include a regression test');
  lines.push('');

  return lines.join('\n');
}

function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.help) {
    showHelp('create-instructions.js', USAGE, DESC, {
      '--type <type>':         `Project type: ${PROJECT_TYPES.join(', ')} (default: web)`,
      '--language <lang>':     'Programming language (default: detected from type)',
      '--description <text>':  'Short project description',
      '--workflow <mode>':     'Workflow mode: plan-first, code-first (default: plan-first)',
      '--output <file>':       'Output file path (default: ./AGENTS.md)',
      '--dry-run':             'Print to stdout instead of writing',
      '--help':                'Show this help message',
    });
    process.exit(0);
  }

  const type = opts.type || 'web';

  if (!PROJECT_TYPES.includes(type)) {
    println(`Error: Unknown project type "${type}". Supported: ${PROJECT_TYPES.join(', ')}`);
    process.exit(1);
  }

  opts.type = type;
  const content = buildContent(opts);
  const output = opts.output || './AGENTS.md';
  const dryRun = opts.dryRun || false;

  if (dryRun) {
    println(content);
  } else {
    writeFileNow(resolve(output), content, false);
  }
}

main();
