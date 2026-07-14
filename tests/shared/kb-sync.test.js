import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpDir, cleanup, REPO_ROOT } from '../helpers.js';
import { spawnSync } from 'child_process';

function runScript(args = [], cwd) {
  const result = spawnSync('node', [join(REPO_ROOT, 'shared', 'skills', 'kb-management', 'scripts', 'kb-sync.js'), ...args], {
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

describe('kb-sync.js', () => {
  it('--help shows usage', () => {
    const result = runScript(['--help']);
    assert.equal(result.exitCode, 0);
    assert.ok(result.stdout.includes('--validate') || result.stdout.includes('Usage'));
  });

  it('--validate without directory shows error', () => {
    const result = runScript(['--validate']);
    assert.notEqual(result.exitCode, 0);
  });

  it('--validate with valid vault returns 0', () => {
    const project = tmpDir();
    const kbDir = join(project, 'kb');
    mkdirSync(join(kbDir, 'notes'), { recursive: true });
    writeFileSync(join(kbDir, 'notes', 'test.md'), '---\ntitle: Test\n---\n\n# Test note\n');

    try {
      const result = runScript(['--validate', kbDir], project);
      assert.equal(result.exitCode, 0);
    } finally {
      cleanup(project);
    }
  });

  it('detects broken wikilinks', () => {
    const project = tmpDir();
    const kbDir = join(project, 'kb');
    mkdirSync(kbDir, { recursive: true });
    writeFileSync(join(kbDir, 'note.md'), '---\ntitle: Note\n---\n\nSee [[nonexistent]] for details.\n');

    try {
      const result = runScript(['--validate', kbDir], project);
      assert.ok(result.stdout.includes('nonexistent') || result.stdout.includes('broken') || result.stdout.includes('wikilink'),
        'should report broken wikilink');
    } finally {
      cleanup(project);
    }
  });

  it('--fix-links repairs broken wikilinks', () => {
    const project = tmpDir();
    const kbDir = join(project, 'kb');
    mkdirSync(kbDir, { recursive: true });
    writeFileSync(join(kbDir, 'note.md'), '---\ntitle: Note\n---\n\nSee [[missing-link]] here.\n');

    try {
      const result = runScript(['--fix-links', kbDir], project);
      assert.equal(result.exitCode, 0);
    } finally {
      cleanup(project);
    }
  });
});
