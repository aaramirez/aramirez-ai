import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'child_process';
import { REPO_ROOT, OPENCODE_BIN } from '../helpers.js';

function parseEvents(stdout) {
  return (stdout || '').trim().split('\n').filter(Boolean).map(line => {
    try { return JSON.parse(line); } catch { return null; }
  }).filter(Boolean);
}

// Calls a live remote model, whose latency and empty replies make it flaky under the
// parallel suite. Opt in like ai-validation.test.js: TEST_AI=true npm test
const USE_AI = process.env.TEST_AI === 'true';

describe('opencode run — agent e2e (free with big-pickle)', { skip: !USE_AI && 'set TEST_AI=true to run live model tests' }, () => {
  test('new-harness responds and costs $0', () => {
    const result = spawnSync(OPENCODE_BIN, [
      'run', '--agent', 'new-harness',
      '--model', 'opencode/big-pickle',
      'Di hola y confirma que eres el agente new-harness',
      '--format', 'json',
    ], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 120000,
    });

    const stderr = (result.stderr || '');
    assert.ok(!stderr.includes('not found'), `agent not found: ${stderr.slice(0, 200)}`);

    const events = parseEvents(result.stdout);
    assert.ok(events.length > 0, 'got at least one JSON event');

    const textEvents = events.filter(e => e.type === 'text' || (e.part && e.part.type === 'text'));
    assert.ok(textEvents.length > 0, 'got text response from agent');

    const stepFinish = events.find(e => e.type === 'step_finish' || (e.part && e.part.type === 'step-finish'));
    if (stepFinish) {
      const cost = stepFinish.part?.cost ?? stepFinish.cost;
      assert.equal(cost, 0, 'big-pickle is free (cost: 0)');
    }
  });

  // `opencode run` only drives primary agents: for a subagent it warns and falls back to
  // the default agent, so this checks opencode recognises docs as a subagent.
  test('docs is recognised as a subagent by opencode run', () => {
    const result = spawnSync(OPENCODE_BIN, [
      'run', '--agent', 'docs',
      '--model', 'opencode/big-pickle',
      'Say hello in one sentence',
      '--format', 'json',
    ], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 60000,
    });

    const stderr = (result.stderr || '');
    assert.ok(!stderr.includes('not found'), `agent not found: ${stderr.slice(0, 200)}`);
    assert.ok(stderr.includes('is a subagent'), `docs should be reported as a subagent: ${stderr.slice(0, 200)}`);

    const events = parseEvents(result.stdout);
    assert.ok(events.length > 0, 'got at least one JSON event');
  });

  test('config-creator is recognised as a subagent by opencode run', () => {
    const result = spawnSync(OPENCODE_BIN, [
      'run', '--agent', 'config-creator',
      '--model', 'opencode/big-pickle',
      'Say hello in one sentence',
      '--format', 'json',
    ], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 60000,
    });

    const stderr = (result.stderr || '');
    assert.ok(!stderr.includes('not found'), `agent not found: ${stderr.slice(0, 200)}`);
    assert.ok(stderr.includes('is a subagent'), `config-creator should be reported as a subagent: ${stderr.slice(0, 200)}`);

    const events = parseEvents(result.stdout);
    assert.ok(events.length > 0, 'got at least one JSON event');
  });
});
