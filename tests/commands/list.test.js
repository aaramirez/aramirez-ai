import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'fs';
import { join } from 'path';
import { runArai, assertExitCode, REPO_ROOT } from '../helpers.js';

describe('arai list', () => {

  test('arai list skills exits with code 0 and lists skills', () => {
    const result = runArai(['list', 'skills']);
    assertExitCode(result, 0);
    assert.ok(result.stdout.includes('git'), 'Should list git skill');
    assert.ok(result.stdout.includes('branding'), 'Should list branding skill');
  });

  test('arai list agents lists build, plan, reviewer, tester, docs', () => {
    const result = runArai(['list', 'agents']);
    assertExitCode(result, 0);
    assert.ok(result.stdout.includes('build'), 'Should list build agent');
    assert.ok(result.stdout.includes('plan'), 'Should list plan agent');
    assert.ok(result.stdout.includes('reviewer'), 'Should list reviewer agent');
    assert.ok(result.stdout.includes('tester'), 'Should list tester agent');
    assert.ok(result.stdout.includes('docs'), 'Should list docs agent');
  });

  test('arai list scripts lists .js files', () => {
    const result = runArai(['list', 'scripts']);
    assertExitCode(result, 0);
    assert.ok(result.stdout.includes('ci-validate.js'), 'Should list ci-validate.js');
  });

  test('arai list templates lists minimal and full', () => {
    const result = runArai(['list', 'templates']);
    assertExitCode(result, 0);
    assert.ok(result.stdout.includes('minimal'), 'Should list minimal template');
    assert.ok(result.stdout.includes('full'), 'Should list full template');
  });

  test('arai list commands lists test, deploy, commit, plan', () => {
    const result = runArai(['list', 'commands']);
    assertExitCode(result, 0);
    assert.ok(result.stdout.includes('test'), 'Should list test command');
    assert.ok(result.stdout.includes('deploy'), 'Should list deploy command');
    assert.ok(result.stdout.includes('commit'), 'Should list commit command');
    assert.ok(result.stdout.includes('plan'), 'Should list plan command');
  });

  test('arai list mcp lists github and playwright', () => {
    const result = runArai(['list', 'mcp']);
    assertExitCode(result, 0);
    assert.ok(result.stdout.includes('github'), 'Should list github MCP');
    assert.ok(result.stdout.includes('playwright'), 'Should list playwright MCP');
  });

  test('arai list <invalid> gives error', () => {
    const result = runArai(['list', 'invalid-thing']);
    assert.ok(result.exitCode !== 0 || result.stderr.includes('unknown') || result.stderr.includes('Invalid') || result.stderr.includes('not found') || result.stdout.includes('unknown'),
      `Expected error for invalid list subcommand. Exit: ${result.exitCode}\nstdout: ${result.stdout}\nstderr: ${result.stderr}`);
  });

  test('arai generate is not a valid command (removed)', () => {
    const result = runArai(['generate']);
    assert.ok(result.exitCode !== 0, `arai generate should fail, got exit code ${result.exitCode}`);
    assert.ok(result.stderr.includes('unknown command') || result.stdout.includes('unknown command'),
      `Expected "unknown command" error. stdout: ${result.stdout}\nstderr: ${result.stderr}`);
  });

  test('bin/arai.js does not import generate.js', () => {
    const content = readFileSync(join(REPO_ROOT, 'bin', 'arai.js'), 'utf8');
    assert.ok(!content.includes('generate.js'), 'bin/arai.js should not import generate.js');
    assert.ok(!content.includes("command('generate')"), 'bin/arai.js should not define generate subcommand');
  });
});
