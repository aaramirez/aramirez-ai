import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpDir, cleanup, REPO_ROOT } from '../helpers.js';
import { spawnSync } from 'child_process';

function runScript(args = [], cwd) {
  const result = spawnSync('node', [join(REPO_ROOT, 'shared', 'scripts', 'create-brand.js'), ...args], {
    cwd: cwd || REPO_ROOT,
    encoding: 'utf8',
    stdio: 'pipe',
  });
  return {
    stdout: (result.stdout || '').trim(),
    stderr: (result.stderr || '').trim(),
    exitCode: result.status ?? 1,
  };
}

describe('create-brand.js', () => {
  it('--help shows usage', () => {
    const result = runScript(['--help']);
    assert.equal(result.exitCode, 0);
    assert.ok(result.stdout.includes('--init') || result.stdout.includes('Usage'));
  });

  it('--validate without brand.json shows error', () => {
    const project = tmpDir();
    try {
      const result = runScript(['--validate'], project);
      assert.notEqual(result.exitCode, 0);
    } finally {
      cleanup(project);
    }
  });

  it('--init generates valid brand.json', () => {
    const project = tmpDir();
    try {
      const result = runScript(['--init', '--name', 'TestCo'], project);
      assert.equal(result.exitCode, 0);
      assert.ok(existsSync(join(project, 'brand.json')));
      const brand = JSON.parse(readFileSync(join(project, 'brand.json'), 'utf8'));
      assert.ok(brand.brand, 'brand.json should have brand key');
      assert.ok(brand.brand.name, 'brand should have name');
    } finally {
      cleanup(project);
    }
  });

  it('--show displays current config', () => {
    const project = tmpDir();
    try {
      runScript(['--init', '--name', 'ShowTest'], project);
      const result = runScript(['--show'], project);
      assert.equal(result.exitCode, 0);
      assert.ok(result.stdout.includes('ShowTest') || result.stdout.includes('brand'));
    } finally {
      cleanup(project);
    }
  });

  it('brand.json has required fields', () => {
    const project = tmpDir();
    try {
      runScript(['--init', '--name', 'FieldTest'], project);
      const brand = JSON.parse(readFileSync(join(project, 'brand.json'), 'utf8'));
      assert.ok(brand.brand.colors, 'should have colors');
      assert.ok(brand.brand.fonts, 'should have fonts');
    } finally {
      cleanup(project);
    }
  });
});
