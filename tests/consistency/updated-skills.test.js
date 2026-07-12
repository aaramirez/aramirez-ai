import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'fs';
import { join } from 'path';
import { REPO_ROOT } from '../helpers.js';

describe('updated creator skills', () => {
  test('agent-creator documents --mode and --preset flags', () => {
    const content = readFileSync(join(REPO_ROOT, '.opencode/skills/agent-creator/SKILL.md'), 'utf8');
    assert.ok(content.includes('--mode'), 'documents --mode');
    assert.ok(content.includes('--preset'), 'documents --preset');
    assert.ok(content.includes('primary'), 'mentions primary');
    assert.ok(content.includes('subagent'), 'mentions subagent');
    assert.ok(content.includes('reviewer'), 'mentions reviewer preset');
    assert.ok(content.includes('tester'), 'mentions tester preset');
  });

  test('agent-creator no longer references create-subagent.js', () => {
    const content = readFileSync(join(REPO_ROOT, '.opencode/skills/agent-creator/SKILL.md'), 'utf8');
    assert.ok(!content.includes('create-subagent.js'), 'should not reference create-subagent.js');
  });

  test('agent-creator no longer references create-specialized-agent.js', () => {
    const content = readFileSync(join(REPO_ROOT, '.opencode/skills/agent-creator/SKILL.md'), 'utf8');
    assert.ok(!content.includes('create-specialized-agent.js'), 'should not reference create-specialized-agent.js');
  });

  test('AGENTS.md lists all 22 agents', () => {
    const content = readFileSync(join(REPO_ROOT, 'AGENTS.md'), 'utf8');
    assert.ok(content.includes('config-creator'), 'AGENTS.md mentions config-creator');
    assert.ok(content.includes('permission-creator'), 'AGENTS.md mentions permission-creator');
    assert.ok(content.includes('instructions-creator'), 'AGENTS.md mentions instructions-creator');
    assert.ok(content.includes('mcp-creator'), 'AGENTS.md mentions mcp-creator');
    assert.ok(content.includes('new-harness'), 'AGENTS.md mentions new-harness');
    assert.ok(content.includes('agent-creator'), 'AGENTS.md mentions agent-creator');
    assert.ok(content.includes('skill-creator'), 'AGENTS.md mentions skill-creator');
    assert.ok(content.includes('script-creator'), 'AGENTS.md mentions script-creator');
  });

  test('AGENTS.md no longer references harness-generator.js', () => {
    const content = readFileSync(join(REPO_ROOT, 'AGENTS.md'), 'utf8');
    assert.ok(!content.includes('harness-generator.js'), 'AGENTS.md should not reference harness-generator.js');
  });
});
