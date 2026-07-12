import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'child_process';
import { join } from 'path';
import { mkdtempSync, rmSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { REPO_ROOT } from '../helpers.js';

const SCRIPT = join(REPO_ROOT, 'shared', 'scripts', 'create-agent.js');

function run(args = []) {
  const result = spawnSync('node', [SCRIPT, ...args], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    stdio: 'pipe',
  });
  return {
    stdout: (result.stdout || '').trim(),
    stderr: (result.stderr || '').trim(),
    exitCode: result.status ?? 1,
  };
}

function tmpFile(name) {
  const dir = mkdtempSync(join(tmpdir(), 'agent-test-'));
  return join(dir, name);
}

describe('create-agent.js consolidated', () => {
  test('--help shows usage with --mode and --preset', () => {
    const result = run(['--help']);
    assert.equal(result.exitCode, 0);
    assert.ok(result.stdout.includes('--mode'), 'help shows --mode');
    assert.ok(result.stdout.includes('--preset'), 'help shows --preset');
    assert.ok(result.stdout.includes('primary'), 'help mentions primary');
    assert.ok(result.stdout.includes('subagent'), 'help mentions subagent');
  });

  test('creates primary agent by default', () => {
    const out = tmpFile('build.md');
    const result = run(['--name', 'build', '--description', 'Test agent', '--output', out, '--dry-run']);
    assert.equal(result.exitCode, 0, result.stderr);
    assert.ok(result.stdout.includes('mode: primary'), 'default mode is primary');
  });

  test('--mode subagent creates subagent', () => {
    const out = tmpFile('reviewer.md');
    const result = run(['--name', 'reviewer', '--description', 'Test', '--mode', 'subagent', '--output', out, '--dry-run']);
    assert.equal(result.exitCode, 0, result.stderr);
    assert.ok(result.stdout.includes('mode: subagent'), 'mode is subagent');
  });

  test('--preset reviewer auto-configures permissions', () => {
    const out = tmpFile('reviewer.md');
    const result = run(['--name', 'reviewer', '--preset', 'reviewer', '--output', out, '--dry-run']);
    assert.equal(result.exitCode, 0, result.stderr);
    assert.ok(result.stdout.includes('mode: subagent'), 'preset sets mode=subagent');
    assert.ok(result.stdout.includes('edit: deny'), 'preset sets edit=deny');
    assert.ok(result.stdout.includes('bash: ask'), 'preset sets bash=ask');
    assert.ok(result.stdout.includes('read: allow'), 'preset sets read=allow');
  });

  test('--preset tester auto-configures permissions', () => {
    const out = tmpFile('tester.md');
    const result = run(['--name', 'tester', '--preset', 'tester', '--output', out, '--dry-run']);
    assert.equal(result.exitCode, 0, result.stderr);
    assert.ok(result.stdout.includes('mode: subagent'), 'preset sets mode=subagent');
    assert.ok(result.stdout.includes('edit: allow'), 'preset sets edit=allow');
    assert.ok(result.stdout.includes('bash: allow'), 'preset sets bash=allow');
  });

  test('--preset plan creates primary with deny edit', () => {
    const out = tmpFile('plan.md');
    const result = run(['--name', 'plan', '--preset', 'plan', '--output', out, '--dry-run']);
    assert.equal(result.exitCode, 0, result.stderr);
    assert.ok(result.stdout.includes('mode: primary'), 'preset sets mode=primary');
    assert.ok(result.stdout.includes('edit: deny'), 'preset sets edit=deny');
  });

  test('--preset docs creates subagent with deny bash', () => {
    const out = tmpFile('docs.md');
    const result = run(['--name', 'docs', '--preset', 'docs', '--output', out, '--dry-run']);
    assert.equal(result.exitCode, 0, result.stderr);
    assert.ok(result.stdout.includes('mode: subagent'), 'preset sets mode=subagent');
    assert.ok(result.stdout.includes('bash: deny'), 'preset sets bash=deny');
  });

  test('--preset security', () => {
    const out = tmpFile('security.md');
    const result = run(['--name', 'security', '--preset', 'security', '--output', out, '--dry-run']);
    assert.equal(result.exitCode, 0, result.stderr);
    assert.ok(result.stdout.includes('mode: subagent'));
    assert.ok(result.stdout.includes('edit: deny'));
    assert.ok(result.stdout.includes('bash: ask'));
  });

  test('--preset devops', () => {
    const out = tmpFile('devops.md');
    const result = run(['--name', 'devops', '--preset', 'devops', '--output', out, '--dry-run']);
    assert.equal(result.exitCode, 0, result.stderr);
    assert.ok(result.stdout.includes('mode: subagent'));
    assert.ok(result.stdout.includes('edit: allow'));
    assert.ok(result.stdout.includes('bash: allow'));
  });

  test('--preset architect', () => {
    const out = tmpFile('architect.md');
    const result = run(['--name', 'architect', '--preset', 'architect', '--output', out, '--dry-run']);
    assert.equal(result.exitCode, 0, result.stderr);
    assert.ok(result.stdout.includes('mode: subagent'));
    assert.ok(result.stdout.includes('edit: deny'));
    assert.ok(result.stdout.includes('bash: ask'));
  });

  test('manual flags override preset defaults', () => {
    const out = tmpFile('custom.md');
    const result = run([
      '--name', 'custom', '--preset', 'reviewer',
      '--mode', 'primary', '--edit', 'allow',
      '--output', out, '--dry-run'
    ]);
    assert.equal(result.exitCode, 0, result.stderr);
    assert.ok(result.stdout.includes('mode: primary'), 'manual override works');
    assert.ok(result.stdout.includes('edit: allow'), 'manual override works');
  });

  test('--dry-run shows output without creating files', () => {
    const out = tmpFile('dry.md');
    const result = run(['--name', 'dry', '--description', 'Test', '--output', out, '--dry-run']);
    assert.equal(result.exitCode, 0, result.stderr);
    assert.ok(result.stdout.includes('dry'), 'output contains name');
    assert.ok(!existsSync(out), 'file not created in dry-run');
  });

  test('errors without --name', () => {
    const result = run([]);
    assert.notEqual(result.exitCode, 0, 'should fail without --name');
    assert.ok(result.stderr.includes('--name') || result.stdout.includes('--name'));
  });

  test('errors with invalid preset', () => {
    const result = run(['--name', 'bad', '--preset', 'nonexistent', '--output', '/tmp/x.md']);
    assert.notEqual(result.exitCode, 0, 'should fail with invalid preset');
  });

  test('errors with invalid mode', () => {
    const result = run(['--name', 'bad', '--mode', 'invalid', '--description', 'x', '--output', '/tmp/x.md']);
    assert.notEqual(result.exitCode, 0, 'should fail with invalid mode');
  });

  test('all 8 presets produce valid output', () => {
    const presets = ['build', 'plan', 'reviewer', 'tester', 'docs', 'security', 'devops', 'architect'];
    for (const preset of presets) {
      const out = tmpFile(`${preset}.md`);
      const result = run(['--name', preset, '--preset', preset, '--output', out, '--dry-run']);
      assert.equal(result.exitCode, 0, `${preset} preset failed: ${result.stderr}`);
      assert.ok(result.stdout.includes('---'), `${preset} has frontmatter`);
      assert.ok(result.stdout.includes('mode:'), `${preset} has mode`);
      assert.ok(result.stdout.includes('permission:'), `${preset} has permissions`);
    }
  });
});
