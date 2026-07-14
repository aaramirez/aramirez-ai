import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'fs';
import { join } from 'path';
import { spawnSync } from 'child_process';
import { REPO_ROOT } from '../helpers.js';

const SHARED = join(REPO_ROOT, 'shared');

describe('shared CI validation execution', () => {
  test('ci-validate.js exists', () => {
    assert.ok(existsSync(join(SHARED, 'scripts', 'ci-validate.js')),
      'ci-validate.js must exist');
  });

  test('ci-validate.js runs without errors', () => {
    const result = spawnSync('node', [
      join(SHARED, 'scripts', 'ci-validate.js'),
    ], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 15000,
    });

    assert.equal(result.status, 0,
      `ci-validate.js failed:\n${result.stdout}\n${result.stderr}`);
  });

  test('ci-validate.js --help shows usage', () => {
    const result = spawnSync('node', [
      join(SHARED, 'scripts', 'ci-validate.js'),
      '--help',
    ], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 10000,
    });

    assert.equal(result.status, 0, `--help failed:\n${result.stderr}`);
    assert.ok(result.stdout.length > 0, '--help should produce output');
  });
});
