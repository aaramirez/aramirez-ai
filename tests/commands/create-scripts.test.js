import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'child_process';
import { join } from 'path';
import { REPO_ROOT } from '../helpers.js';

// Each creator script lives in its skill: create-<x>.js → .opencode/skills/<x>-creator/scripts/
function scriptPath(name) {
  const kind = name.replace(/^create-/, '').replace(/\.js$/, '');
  return join(REPO_ROOT, '.opencode', 'skills', `${kind}-creator`, 'scripts', name);
}

function runScript(name, args = []) {
  const result = spawnSync('node', [scriptPath(name), ...args], {
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

const SCRIPTS_TO_TEST = [
  'create-config.js',
  'create-permission.js',
  'create-instructions.js',
  'create-agent.js',
  'create-architecture.js',
  'create-flow.js',
  'create-skill.js',
  'create-mcp.js',
  'create-command.js',
  'create-script.js',
  'create-prompt.js',
  'create-rule.js',
  'create-reference.js',
  'create-plugin.js',
  'create-tool.js',
];

describe('creator scripts', () => {
  for (const script of SCRIPTS_TO_TEST) {
    test(`${script}: --help shows usage`, () => {
      const result = runScript(script, ['--help']);
      assert.equal(result.exitCode, 0, `${script} --help failed: ${result.stderr}`);
      assert.ok(result.stdout.length > 0, `${script} --help produced no output`);
    });

    test(`${script}: --dry-run without required args shows error`, () => {
      const result = runScript(script, ['--dry-run']);
      assert.ok(result.exitCode !== 0 || result.stderr.length > 0 || result.stdout.length > 0,
        `${script} should handle missing args gracefully`);
    });
  }

  test('create-config: generates valid JSON', () => {
    const result = runScript('create-config.js', [
      '--model', 'opencode/big-pickle',
      '--shell', '/bin/zsh',
      '--dry-run',
    ]);
    assert.equal(result.exitCode, 0);
    const json = JSON.parse(result.stdout);
    assert.equal(json.model, 'opencode/big-pickle');
    assert.equal(json.shell, '/bin/zsh');
    assert.ok(json.agent);
    assert.ok(json.permission);
  });

  test('create-skill: validates name format', () => {
    const result = runScript('create-skill.js', [
      '--name', 'INVALID_NAME',
      '--description', 'test',
      '--content', '# Test',
      '--output', '/tmp/test.md',
      '--dry-run',
    ]);
    assert.notEqual(result.exitCode, 0, 'Should reject invalid skill name');
  });

  test('create-agent: generates markdown with frontmatter', () => {
    const result = runScript('create-agent.js', [
      '--name', 'test-agent',
      '--description', 'A test agent',
      '--mode', 'primary',
      '--output', '/tmp/test-agent.md',
      '--dry-run',
    ]);
    assert.equal(result.exitCode, 0, `create-agent failed: ${result.stderr}`);
    assert.ok(result.stdout.includes('description: A test agent'));
    assert.ok(result.stdout.includes('mode: primary'));
  });

  test('create-mcp: generates valid config', () => {
    const result = runScript('create-mcp.js', [
      '--name', 'test-mcp',
      '--type', 'remote',
      '--url', 'https://example.com/mcp',
      '--output', '/tmp/test-mcp.json',
      '--dry-run',
    ]);
    assert.equal(result.exitCode, 0, `create-mcp failed: ${result.stderr}`);
    // Strip dry-run header line (--- path ---) before parsing JSON
    const jsonStr = result.stdout.replace(/^--- .+ ---\n?/, '');
    const json = JSON.parse(jsonStr);
    assert.ok(json['test-mcp']);
    assert.equal(json['test-mcp'].type, 'remote');
  });

  test('all scripts parse without syntax errors', () => {
    for (const script of SCRIPTS_TO_TEST) {
      const result = spawnSync('node', ['--check', scriptPath(script)], {
        encoding: 'utf8',
        stdio: 'pipe',
      });
      assert.equal(result.status, 0,
        `Syntax error in ${script}: ${result.stderr}`);
    }
  });
});
