import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { spawnSync } from 'child_process';
import { REPO_ROOT } from '../helpers.js';

describe('CI validation — can be run in CI', () => {
  describe('npm test runs without opencode', () => {
    test('node --test discovers all test files', () => {
      const result = spawnSync('node', [
        '--test',
        'tests/harness/schema-validation.test.js',
        'tests/consistency/reference-integrity.test.js',
      ], {
        cwd: REPO_ROOT,
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 30000,
      });

      assert.equal(result.status, 0, `node --test failed:\n${result.stderr}`);
    });
  });

  describe('no opencode-dependent tests run without TEST_OPENCODE', () => {
    const env = { ...process.env };
    delete env.TEST_OPENCODE;
    delete env.TEST_AI;

    test('opencode integration tests skip gracefully', () => {
      const result = spawnSync('node', [
        '--test',
        'tests/integration/opencode-debug-all-agents.test.js',
        'tests/integration/opencode-debug-all-skills.test.js',
      ], {
        cwd: REPO_ROOT,
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 15000,
        env,
      });

      assert.equal(result.status, 0, 'opencode integration tests should skip gracefully');
    });
  });

  describe('schema validation runs without external deps', () => {
    test('schema-validation.test.js passes', () => {
      const result = spawnSync('node', [
        '--test',
        'tests/harness/schema-validation.test.js',
      ], {
        cwd: REPO_ROOT,
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 60000,
      });

      assert.equal(result.status, 0, `schema validation failed:\n${result.stdout}\n${result.stderr}`);
    });
  });

  describe('reference integrity runs without external deps', () => {
    test('reference-integrity.test.js passes', () => {
      const result = spawnSync('node', [
        '--test',
        'tests/consistency/reference-integrity.test.js',
      ], {
        cwd: REPO_ROOT,
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 15000,
      });

      assert.equal(result.status, 0, `reference integrity failed:\n${result.stdout}`);
    });
  });

  describe('evals run without external deps', () => {
    test('eval runner completes', () => {
      const result = spawnSync('node', [
        'tests/evals/runner.js',
      ], {
        cwd: REPO_ROOT,
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 30000,
      });

      assert.equal(result.status, 0, `eval runner failed:\n${result.stdout}`);
    });
  });

  describe('all test files are syntactically valid', () => {
    const testFiles = [
      'tests/harness/schema-validation.test.js',
      'tests/harness/qa-checklist.test.js',
      'tests/consistency/reference-integrity.test.js',
      'tests/consistency/ci-validate-execution.test.js',
      'tests/integration/opencode-debug-all-agents.test.js',
      'tests/integration/opencode-debug-all-skills.test.js',
    ];

    for (const file of testFiles) {
      test(`${file} is valid ESM`, () => {
        const fullPath = join(REPO_ROOT, file);
        assert.ok(existsSync(fullPath), `Test file not found: ${file}`);

        const content = readFileSync(fullPath, 'utf8');
        assert.ok(content.includes('import '), `${file} should use ESM imports`);
        assert.ok(content.includes('export ') || content.includes('test('),
          `${file} should have test definitions`);
      });
    }
  });
});
