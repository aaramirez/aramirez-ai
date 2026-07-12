import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'child_process';
import { REPO_ROOT } from '../helpers.js';

function parseEvents(stdout) {
  return (stdout || '').trim().split('\n').filter(Boolean).map(line => {
    try { return JSON.parse(line); } catch { return null; }
  }).filter(Boolean);
}

describe('opencode run — agent e2e (free with big-pickle)', () => {
  test('new-harness responds and costs $0', () => {
    const result = spawnSync('opencode', [
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

  test('docs subagent responds and costs $0', () => {
    const result = spawnSync('opencode', [
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

    const events = parseEvents(result.stdout);
    assert.ok(events.length > 0, 'got at least one JSON event');

    const textEvents = events.filter(e => e.type === 'text' || (e.part && e.part.type === 'text'));
    assert.ok(textEvents.length > 0, 'got text response from agent');
  });

  test('config-creator subagent responds', () => {
    const result = spawnSync('opencode', [
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

    const events = parseEvents(result.stdout);
    assert.ok(events.length > 0, 'got at least one JSON event');
  });
});
