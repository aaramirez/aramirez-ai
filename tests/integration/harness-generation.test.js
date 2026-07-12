import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'child_process';
import { mkdtempSync, rmSync, existsSync, readFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { REPO_ROOT } from '../helpers.js';

const SCRIPTS_DIR = join(REPO_ROOT, 'shared', 'scripts');

function runScript(name, args = []) {
  const result = spawnSync('node', [join(SCRIPTS_DIR, name), ...args], {
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

describe('harness generation flow', () => {
  let tempDir;

  test('setup', () => {
    tempDir = mkdtempSync(join(tmpdir(), 'harness-flow-'));
  });

  test('generates complete project from scratch', () => {
    const projectDir = join(tempDir, 'my-project');
    mkdirSync(join(projectDir, '.opencode', 'agents'), { recursive: true });

    // 1. Create opencode.json
    const configResult = runScript('create-config.js', [
      '--model', 'opencode/big-pickle',
      '--shell', '/bin/zsh',
      '--output', join(projectDir, 'opencode.json'),
    ]);
    assert.equal(configResult.exitCode, 0, `create-config failed: ${configResult.stderr}`);

    // 2. Create agents
    const buildResult = runScript('create-agent.js', [
      '--name', 'build',
      '--mode', 'primary',
      '--description', 'Primary builder',
      '--output', join(projectDir, '.opencode', 'agents', 'build.md'),
    ]);
    assert.equal(buildResult.exitCode, 0, `create-agent build failed: ${buildResult.stderr}`);

    const planResult = runScript('create-agent.js', [
      '--name', 'plan',
      '--preset', 'plan',
      '--output', join(projectDir, '.opencode', 'agents', 'plan.md'),
    ]);
    assert.equal(planResult.exitCode, 0, `create-agent plan failed: ${planResult.stderr}`);

    const reviewerResult = runScript('create-agent.js', [
      '--name', 'reviewer',
      '--preset', 'reviewer',
      '--output', join(projectDir, '.opencode', 'agents', 'reviewer.md'),
    ]);
    assert.equal(reviewerResult.exitCode, 0, `create-agent reviewer failed: ${reviewerResult.stderr}`);

    const testerResult = runScript('create-agent.js', [
      '--name', 'tester',
      '--preset', 'tester',
      '--output', join(projectDir, '.opencode', 'agents', 'tester.md'),
    ]);
    assert.equal(testerResult.exitCode, 0, `create-agent tester failed: ${testerResult.stderr}`);

    // 3. Create permission config
    const permResult = runScript('create-permission.js', [
      '--strictness', 'balanced',
      '--output', join(projectDir, 'permission.json'),
    ]);
    assert.equal(permResult.exitCode, 0, `create-permission failed: ${permResult.stderr}`);

    // 4. Create AGENTS.md
    const instrResult = runScript('create-instructions.js', [
      '--type', 'api',
      '--language', 'typescript',
      '--description', 'API REST para e-commerce',
      '--output', join(projectDir, 'AGENTS.md'),
    ]);
    assert.equal(instrResult.exitCode, 0, `create-instructions failed: ${instrResult.stderr}`);

    // Verify all files exist
    assert.ok(existsSync(join(projectDir, 'opencode.json')), 'opencode.json exists');
    assert.ok(existsSync(join(projectDir, 'AGENTS.md')), 'AGENTS.md exists');
    assert.ok(existsSync(join(projectDir, 'permission.json')), 'permission.json exists');
    assert.ok(existsSync(join(projectDir, '.opencode', 'agents', 'build.md')), 'build.md exists');
    assert.ok(existsSync(join(projectDir, '.opencode', 'agents', 'plan.md')), 'plan.md exists');
    assert.ok(existsSync(join(projectDir, '.opencode', 'agents', 'reviewer.md')), 'reviewer.md exists');
    assert.ok(existsSync(join(projectDir, '.opencode', 'agents', 'tester.md')), 'tester.md exists');

    // Verify agent structures
    const buildContent = readFileSync(join(projectDir, '.opencode', 'agents', 'build.md'), 'utf8');
    assert.ok(buildContent.includes('mode: primary'), 'build is primary');

    const reviewerContent = readFileSync(join(projectDir, '.opencode', 'agents', 'reviewer.md'), 'utf8');
    assert.ok(reviewerContent.includes('mode: subagent'), 'reviewer is subagent');
    assert.ok(reviewerContent.includes('edit: deny'), 'reviewer has edit: deny');

    const testerContent = readFileSync(join(projectDir, '.opencode', 'agents', 'tester.md'), 'utf8');
    assert.ok(testerContent.includes('mode: subagent'), 'tester is subagent');
    assert.ok(testerContent.includes('bash: allow'), 'tester has bash: allow');

    // Verify opencode.json is valid and has agents
    const config = JSON.parse(readFileSync(join(projectDir, 'opencode.json'), 'utf8'));
    assert.ok(config.model, 'config has model');
  });

  test('cleanup', () => {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
