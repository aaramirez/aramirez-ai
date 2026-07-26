import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync, mkdirSync } from 'fs';
import { join } from 'path';
import { spawnSync } from 'child_process';
import { tmpDir, cleanup, assertFile, assertDir, assertFileContent } from '../helpers.js';

describe('kb-init.js — KB creation', () => {
  let dir;
  let kbDir;

  afterEach(() => { if (dir) cleanup(dir); });

  function runKbInit(args = []) {
    const scriptPath = join(process.cwd(), 'shared', 'skills', 'kb-management', 'scripts', 'kb-init.js');
    const result = spawnSync('node', [scriptPath, ...args], {
      cwd: dir,
      encoding: 'utf8',
      stdio: 'pipe',
    });
    return {
      stdout: (result.stdout || '').trim(),
      stderr: (result.stderr || '').trim(),
      exitCode: result.status ?? 1,
    };
  }

  test('creates standard KB directory structure', () => {
    dir = tmpDir();
    kbDir = join(dir, 'test-kb');
    
    // This will fail until kb-init.js is implemented
    const result = runKbInit(['test-kb', '--prefix', 'test', '--description', 'Test KB']);
    
    assert.equal(result.exitCode, 0, `Command failed: ${result.stderr}`);
    assertDir(kbDir);
    assertDir(join(kbDir, '01-Fundamentos'));
    assertFile(join(kbDir, 'Index.md'));
    assertFile(join(kbDir, 'como-usar-este-kb.md'));
    assertFile(join(kbDir, 'test-glossary.md'));
    assertFile(join(kbDir, 'test-timeline.md'));
  });

  test('Index.md has correct frontmatter', () => {
    dir = tmpDir();
    kbDir = join(dir, 'test-kb');
    
    runKbInit(['test-kb', '--prefix', 'test', '--description', 'Test Knowledge Base']);
    
    const content = readFileSync(join(kbDir, 'Index.md'), 'utf8');
    assert.ok(content.includes('title:'), 'Index.md should have title');
    assert.ok(content.includes('tags:'), 'Index.md should have tags');
    assert.ok(content.includes('created:'), 'Index.md should have created date');
  });

  test('README.md in section has learning objectives', () => {
    dir = tmpDir();
    kbDir = join(dir, 'test-kb');
    
    runKbInit(['test-kb', '--prefix', 'test', '--description', 'Test KB']);
    
    const content = readFileSync(join(kbDir, '01-Fundamentos', 'README.md'), 'utf8');
    assert.ok(content.includes('Objetivos'), 'Section README should have objectives');
    assert.ok(content.includes('Fundamentos'), 'Section should have correct name');
  });

  test('creates .gitignore', () => {
    dir = tmpDir();
    kbDir = join(dir, 'test-kb');
    
    runKbInit(['test-kb', '--prefix', 'test', '--description', 'Test KB']);
    
    assertFile(join(kbDir, '.gitignore'));
    const content = readFileSync(join(kbDir, '.gitignore'), 'utf8');
    assert.ok(content.includes('node_modules'), '.gitignore should exclude node_modules');
  });

  test('fails if directory already exists', () => {
    dir = tmpDir();
    kbDir = join(dir, 'existing-kb');
    mkdirSync(kbDir, { recursive: true });
    
    const result = runKbInit(['existing-kb', '--prefix', 'test', '--description', 'Test KB']);
    
    assert.notEqual(result.exitCode, 0, 'Should fail if directory exists');
    assert.ok(result.stderr.includes('already exists'), 'Error should mention already exists');
  });

  test('--prefix sets correct tag namespace', () => {
    dir = tmpDir();
    kbDir = join(dir, 'my-kb');
    
    runKbInit(['my-kb', '--prefix', 'mytopic', '--description', 'My Topic KB']);
    
    const content = readFileSync(join(kbDir, 'Index.md'), 'utf8');
    assert.ok(content.includes('mytopic/'), 'Tags should use prefix namespace');
  });
});
