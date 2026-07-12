import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'child_process';

const NEW_AGENTS = ['agent-creator', 'skill-creator', 'script-creator'];

function debugAgent(name) {
  const result = spawnSync('opencode', ['debug', 'agent', name], {
    encoding: 'utf8',
    stdio: 'pipe',
    timeout: 30000,
  });
  return {
    stdout: (result.stdout || '').trim(),
    stderr: (result.stderr || '').trim(),
    exitCode: result.status ?? 1,
  };
}

describe('opencode debug agent validation', { timeout: 120000 }, () => {
  for (const name of NEW_AGENTS) {
    test(`${name}: opencode debug agent loads successfully`, () => {
      const result = debugAgent(name);
      assert.equal(result.exitCode, 0, `opencode debug agent ${name} failed:\n${result.stderr || result.stdout}`);
    });

    test(`${name}: returns valid JSON with required fields`, () => {
      const result = debugAgent(name);
      assert.equal(result.exitCode, 0);
      const agent = JSON.parse(result.stdout);
      assert.equal(agent.name, name, 'name matches');
      assert.equal(agent.mode, 'subagent', 'mode is subagent');
      assert.ok(agent.model, 'has model');
      assert.ok(agent.prompt, 'has prompt');
      assert.ok(agent.description, 'has description');
    });

    test(`${name}: has skill tool available`, () => {
      const result = debugAgent(name);
      assert.equal(result.exitCode, 0);
      const agent = JSON.parse(result.stdout);
      assert.equal(agent.tools.skill, true, 'skill tool must be available');
    });

    test(`${name}: prompt references corresponding skill`, () => {
      const result = debugAgent(name);
      assert.equal(result.exitCode, 0);
      const agent = JSON.parse(result.stdout);
      assert.ok(
        agent.prompt.includes(name),
        `prompt should reference skill "${name}"`
      );
    });
  }
});
