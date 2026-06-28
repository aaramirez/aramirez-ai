import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { REPO_ROOT, parseFrontmatter } from '../helpers.js';

const OPENCODE_DIR = join(REPO_ROOT, 'platforms', 'opencode');
const CONFIG_PATH = join(OPENCODE_DIR, 'opencode.json');

describe('platforms/opencode consistency', () => {
  let config;
  test('opencode.json is valid JSON', () => {
    const raw = readFileSync(CONFIG_PATH, 'utf8');
    config = JSON.parse(raw);
    assert.ok(config, 'opencode.json could not be parsed');
  });

  test('opencode.json has all required top-level keys', () => {
    const required = ['model', 'default_agent', 'agent', 'skills', 'permission'];
    for (const key of required) {
      assert.ok(key in config, `opencode.json missing required key: "${key}"`);
    }
  });

  test('every agent in opencode.json has mode and description', () => {
    for (const [name, agent] of Object.entries(config.agent || {})) {
      assert.ok(agent.mode, `Agent "${name}" missing "mode"`);
      assert.ok(agent.description, `Agent "${name}" missing "description"`);
    }
  });

  test('every command in opencode.json has description and template', () => {
    for (const [name, cmd] of Object.entries(config.command || {})) {
      assert.ok(cmd.description, `Command "${name}" missing "description"`);
      assert.ok(cmd.template, `Command "${name}" missing "template"`);
    }
  });

  test('MCP servers are NOT defined in mcp/servers.json (no duplication)', () => {
    const mcpFile = join(OPENCODE_DIR, 'mcp', 'servers.json');
    assert.ok(!existsSync(mcpFile), 'mcp/servers.json should not exist — MCP is in opencode.json');
  });

  test('skills paths include ../shared/skills', () => {
    const paths = config.skills?.paths || [];
    assert.ok(paths.includes('../shared/skills'),
      'Skills paths should include ../shared/skills for direct shared skill access');
  });

  test('agent .md files in agents/ have matching opencode.json entries', () => {
    const agentsDir = join(OPENCODE_DIR, 'agents');
    if (!existsSync(agentsDir)) return;
    const mdFiles = readdirSync(agentsDir).filter(f => f.endsWith('.md'));
    for (const file of mdFiles) {
      const agentName = file.replace(/\.md$/, '');
      assert.ok(config.agent?.[agentName],
        `Agent file ${file} exists but no matching entry in opencode.json`);
    }
  });

  test('every subagent in opencode.json has a matching .md file (bidirectional)', () => {
    const agentsDir = join(OPENCODE_DIR, 'agents');
    if (!existsSync(agentsDir)) return;
    const mdFiles = new Set(readdirSync(agentsDir)
      .filter(f => f.endsWith('.md'))
      .map(f => f.replace(/\.md$/, '')));
    for (const [name, agent] of Object.entries(config.agent || {})) {
      if (agent.mode !== 'subagent') continue;
      assert.ok(mdFiles.has(name),
        `Subagent "${name}" in opencode.json has no .md file in agents/`);
    }
  });

  test('agent .md frontmatter permission matches opencode.json entry', () => {
    const agentsDir = join(OPENCODE_DIR, 'agents');
    if (!existsSync(agentsDir)) return;
    const mdFiles = readdirSync(agentsDir).filter(f => f.endsWith('.md'));
    for (const file of mdFiles) {
      const agentName = file.replace(/\.md$/, '');
      const expectedPerm = config.agent?.[agentName]?.permission;
      if (!expectedPerm) continue;
      const fm = parseFrontmatter(join(agentsDir, file));
      const mdPerm = fm.permission || {};
      for (const key of Object.keys(expectedPerm)) {
        assert.equal(mdPerm[key], expectedPerm[key],
          `Permission mismatch for ${agentName}.${key}: .md says "${mdPerm[key]}", opencode.json says "${expectedPerm[key]}"`);
      }
    }
  });

  test('only opencode platform exists (no claude/cursor/codex)', () => {
    const platformsDir = join(REPO_ROOT, 'platforms');
    const platforms = readdirSync(platformsDir).filter(f =>
      statSync(join(platformsDir, f)).isDirectory()
    ).sort();
    assert.deepEqual(platforms, ['opencode'],
      `Only 'opencode' platform should exist. Found: ${platforms.join(', ')}`);
  });
});
