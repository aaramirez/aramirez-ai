import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'fs';
import { join } from 'path';
import { REPO_ROOT } from '../helpers.js';

const CONFIG_PATH = join(REPO_ROOT, 'opencode.json');

describe('opencode.json agent registrations', () => {
  let config;

  test('loads opencode.json', () => {
    config = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
    assert.ok(config.agent, 'has agents section');
  });

  const REQUIRED_AGENTS = {
    'config-creator':          { mode: 'subagent', path: '.opencode/agents/config-creator.md' },
    'permission-creator':      { mode: 'subagent', path: '.opencode/agents/permission-creator.md' },
    'instructions-creator':    { mode: 'subagent', path: '.opencode/agents/instructions-creator.md' },
    'mcp-creator':             { mode: 'subagent', path: '.opencode/agents/mcp-creator.md' },
    'architecture-creator':    { mode: 'subagent', path: '.opencode/agents/architecture-creator.md' },
    'flow-creator':            { mode: 'subagent', path: '.opencode/agents/flow-creator.md' },
    'plugin-creator':          { mode: 'subagent', path: '.opencode/agents/plugin-creator.md' },
    'tool-creator':            { mode: 'subagent', path: '.opencode/agents/tool-creator.md' },
    'prompt-creator':          { mode: 'subagent', path: '.opencode/agents/prompt-creator.md' },
    'rule-creator':            { mode: 'subagent', path: '.opencode/agents/rule-creator.md' },
    'reference-creator':       { mode: 'subagent', path: '.opencode/agents/reference-creator.md' },
    'command-creator':         { mode: 'subagent', path: '.opencode/agents/command-creator.md' },
    'agent-creator':           { mode: 'subagent', path: '.opencode/agents/agent-creator.md' },
    'skill-creator':           { mode: 'subagent', path: '.opencode/agents/skill-creator.md' },
    'script-creator':          { mode: 'subagent', path: '.opencode/agents/script-creator.md' },
    'new-harness':             { mode: 'primary',   path: '.opencode/agents/new-harness.md' },
  };

  for (const [name, expected] of Object.entries(REQUIRED_AGENTS)) {
    test(`${name} is registered correctly`, () => {
      const agent = config.agent[name];
      assert.ok(agent, `Agent ${name} not found in opencode.json`);
      assert.equal(agent.mode, expected.mode, `${name} mode mismatch`);
      assert.equal(agent.path, expected.path, `${name} path mismatch`);
    });
  }

  test('total agent count is at least 22', () => {
    assert.ok(Object.keys(config.agent).length >= 22, 'should have at least 22 agents');
  });
});
