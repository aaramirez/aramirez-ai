import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { REPO_ROOT, validateSchema, parseFrontmatter, tmpDir, cleanup } from '../helpers.js';
import { spawnSync } from 'child_process';

const SCHEMAS = {
  agentMd: {
    required: ['description', 'mode', 'model'],
    properties: {
      mode: { enum: ['primary', 'subagent'] },
      model: { type: 'string', minLength: 1 },
      description: { type: 'string', minLength: 10 },
      permission: {
        properties: {
          edit: { enum: ['allow', 'deny'] },
          bash: { enum: ['allow', 'deny', 'ask'] },
          read: { enum: ['allow', 'deny'] },
        },
      },
    },
  },
  skillMd: {
    required: ['name', 'description', 'license'],
    properties: {
      name: { pattern: '^[a-z][a-z0-9-]*$', maxLength: 64 },
      description: { type: 'string', minLength: 10, maxLength: 200 },
      license: { type: 'string' },
    },
  },
  opencodeJson: {
    required: ['agent'],
    properties: {},
  },
};

const AGENTS_DIR = join(REPO_ROOT, '.opencode', 'agents');
const SKILLS_DIR = join(REPO_ROOT, '.opencode', 'skills');
const CONFIG_PATH = join(REPO_ROOT, 'opencode.json');

describe('schema validation', () => {
  describe('agent .md frontmatter schemas', () => {
    const agentFiles = existsSync(AGENTS_DIR)
      ? readdirSync(AGENTS_DIR).filter(f => f.endsWith('.md'))
      : [];

    for (const file of agentFiles) {
      test(`${file} has valid frontmatter schema`, () => {
        const fm = parseFrontmatter(join(AGENTS_DIR, file));
        const result = validateSchema(fm, SCHEMAS.agentMd, file);
        assert.ok(result.valid, `Schema errors:\n${result.errors.join('\n')}`);
      });
    }
  });

  describe('SKILL.md frontmatter schemas', () => {
    const skillDirs = existsSync(SKILLS_DIR)
      ? readdirSync(SKILLS_DIR).filter(d =>
          statSync(join(SKILLS_DIR, d)).isDirectory()
        )
      : [];

    for (const dir of skillDirs) {
      const skillMd = join(SKILLS_DIR, dir, 'SKILL.md');
      if (!existsSync(skillMd)) continue;

      test(`${dir}/SKILL.md has valid frontmatter schema`, () => {
        const fm = parseFrontmatter(skillMd);
        const result = validateSchema(fm, SCHEMAS.skillMd, dir);
        assert.ok(result.valid, `Schema errors:\n${result.errors.join('\n')}`);
      });
    }
  });

  describe('opencode.json agent entries', () => {
    test('opencode.json has valid agent registrations', () => {
      const config = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
      assert.ok(config.agent, 'opencode.json should have agent key');

      for (const [name, agent] of Object.entries(config.agent)) {
        assert.ok(agent.description, `Agent ${name} should have description`);
        assert.ok(agent.mode, `Agent ${name} should have mode`);
        assert.ok(
          ['primary', 'subagent'].includes(agent.mode),
          `Agent ${name} mode should be primary or subagent, got: ${agent.mode}`
        );
        if (agent.path) {
          assert.ok(
            agent.path.startsWith('.opencode/agents/'),
            `Agent ${name} path should start with .opencode/agents/`
          );
          assert.ok(
            agent.path.endsWith('.md'),
            `Agent ${name} path should end with .md`
          );
        }
      }
    });
  });

  describe('creator script --dry-run output', () => {
    const scripts = [
      { name: 'create-agent.js', skill: 'agent-creator', args: ['--name', 'test-agent', '--mode', 'subagent', '--description', 'Test agent', '--output', '/tmp/test-agent.md'] },
      { name: 'create-config.js', skill: 'config-creator', args: ['--model', 'opencode/big-pickle', '--output', '/tmp/test-config.json'] },
      { name: 'create-skill.js', skill: 'skill-creator', args: ['--name', 'test-skill', '--description', 'Test skill', '--content', 'Test content', '--output', '/tmp/test-skill.md'] },
      { name: 'create-command.js', skill: 'command-creator', args: ['--name', 'test-cmd', '--description', 'Test command', '--template', 'test template', '--output', '/tmp/test-cmd.md'] },
      { name: 'create-permission.js', skill: 'permission-creator', args: ['--strictness', 'balanced', '--output', '/tmp/test-permission.json'] },
      { name: 'create-flow.js', skill: 'flow-creator', args: ['--name', 'test-flow', '--stages', 'plan,build', '--output', '/tmp/test-flow.json'] },
      { name: 'create-rule.js', skill: 'rule-creator', args: ['--name', 'test-rule', '--description', 'Test rule', '--content', 'rule content', '--output', '/tmp/test-rule.md'] },
      { name: 'create-prompt.js', skill: 'prompt-creator', args: ['--name', 'test-prompt', '--description', 'Test prompt', '--content', 'prompt content', '--output', '/tmp/test-prompt.md'] },
      { name: 'create-reference.js', skill: 'reference-creator', args: ['--name', 'test-ref', '--description', 'Test reference', '--url', 'https://example.com', '--content', 'Test content', '--path', 'docs/test.md', '--output', '/tmp/test-ref.md'] },
      { name: 'create-mcp.js', skill: 'mcp-creator', args: ['--name', 'test-mcp', '--type', 'remote', '--url', 'https://example.com/mcp', '--output', '/tmp/test-mcp.json'] },
      { name: 'create-tool.js', skill: 'tool-creator', args: ['--name', 'test-tool', '--description', 'Test tool', '--schema', '{"type":"object"}', '--output', '/tmp/test-tool.md'] },
    ];

    for (const { name, skill, args } of scripts) {
      test(`${name} --dry-run produces valid output`, () => {
        const scriptPath = join(REPO_ROOT, '.opencode', 'skills', skill, 'scripts', name);
        if (!existsSync(scriptPath)) {
          console.log(`  SKIP: ${scriptPath} not found`);
          return;
        }

        const result = spawnSync('node', [scriptPath, ...args, '--dry-run'], {
          cwd: REPO_ROOT,
          encoding: 'utf8',
          stdio: 'pipe',
          timeout: 15000,
        });

        assert.equal(result.status, 0, `Script failed:\n${result.stderr}`);
        assert.ok(result.stdout.length > 0, 'Script should produce output');
      });
    }
  });
});
