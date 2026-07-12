import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'child_process';
import { REPO_ROOT } from '../helpers.js';

function runOpencode(...args) {
  const result = spawnSync('opencode', args, {
    cwd: REPO_ROOT,
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

function tryRunOpencode(...args) {
  try {
    return runOpencode(...args);
  } catch {
    return { stdout: '', stderr: 'command failed', exitCode: 1 };
  }
}

describe('opencode debug — agent validation', () => {
  const REQUIRED_AGENTS = [
    'build', 'new-harness',
    'config-creator', 'permission-creator', 'instructions-creator',
    'mcp-creator', 'architecture-creator',
    'plugin-creator', 'tool-creator',
    'rule-creator', 'command-creator',
    'reviewer', 'tester'
  ];

  for (const agent of REQUIRED_AGENTS) {
    test(`agent "${agent}" loads in opencode`, () => {
      const result = tryRunOpencode('debug', 'agent', agent);
      assert.equal(result.exitCode, 0, `opencode debug agent ${agent} failed: ${result.stderr}`);
      assert.ok(result.stdout.length > 10, `output is not empty for ${agent}`);
    });
  }

  test('new-harness has primary mode', () => {
    const result = runOpencode('debug', 'agent', 'new-harness');
    assert.equal(result.exitCode, 0);
    assert.ok(result.stdout.includes('primary'), 'mode is primary');
  });

  test('reviewer has subagent mode', () => {
    const result = runOpencode('debug', 'agent', 'reviewer');
    assert.equal(result.exitCode, 0);
    assert.ok(result.stdout.includes('subagent'), 'mode is subagent');
  });
});

describe('opencode debug — skills validation', () => {
  test('harness-generator skill is loaded', () => {
    const result = runOpencode('debug', 'skill');
    assert.equal(result.exitCode, 0);
    assert.ok(result.stdout.includes('harness-generator'), 'harness-generator skill found');
  });

  test('customize-opencode skill is loaded', () => {
    const result = runOpencode('debug', 'skill');
    assert.equal(result.exitCode, 0);
    assert.ok(result.stdout.includes('customize-opencode'), 'customize-opencode skill found');
  });
});

describe('opencode debug — config validation', () => {
  test('opencode.json resolves without errors', () => {
    const result = tryRunOpencode('debug', 'config');
    assert.equal(result.exitCode, 0, `config validation failed: ${result.stderr}`);
    assert.ok(result.stdout.length > 0, 'config output is not empty');
  });

  test('config has agents section', () => {
    const result = runOpencode('debug', 'config');
    assert.equal(result.exitCode, 0);
    assert.ok(result.stdout.includes('agent'), 'config has agents');
  });
});
