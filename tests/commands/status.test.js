import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { runArai, tmpDir, cleanup, assertExitCode } from '../helpers.js';

describe('arai status', () => {
  let dir;

  afterEach(() => {
    if (dir) cleanup(dir);
  });

  test('arai status in clean project shows not installed', () => {
    dir = tmpDir();
    const result = runArai(['status'], dir);
    assertExitCode(result, 0);
    assert.ok(result.stdout.includes('not installed'), `Expected 'not installed', got: ${result.stdout}`);
  });

  test('arai status shows opencode installed after arai install', () => {
    dir = tmpDir();
    runArai(['install', '--project', dir]);
    const result = runArai(['status'], dir);
    assertExitCode(result, 0);
    assert.ok(result.stdout.includes('installed'), `Expected 'installed', got: ${result.stdout}`);
  });

  test('arai status shows installed agents count', () => {
    dir = tmpDir();
    runArai(['install', '--project', dir]);
    runArai(['install', 'agent', 'reviewer', '--project', dir]);
    const result = runArai(['status'], dir);
    assertExitCode(result, 0);
    assert.ok(result.stdout.includes('agents'), `Expected agents info, got: ${result.stdout}`);
  });

  test('arai status shows installed skills count', () => {
    dir = tmpDir();
    runArai(['install', '--project', dir]);
    runArai(['install', 'skill', 'git', '--project', dir]);
    const result = runArai(['status'], dir);
    assertExitCode(result, 0);
    assert.ok(result.stdout.includes('skills'), `Expected skills info, got: ${result.stdout}`);
  });
});
