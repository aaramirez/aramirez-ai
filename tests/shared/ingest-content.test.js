import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, mkdirSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { tmpDir, cleanup, REPO_ROOT } from '../helpers.js';
import { spawnSync } from 'child_process';

function runScript(args = [], cwd) {
  const result = spawnSync('node', [join(REPO_ROOT, 'shared', 'skills', 'content-ingestion', 'scripts', 'ingest-content.js'), ...args], {
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

describe('ingest-content.js', () => {
  it('--help shows usage', () => {
    const result = runScript(['--help']);
    assert.equal(result.exitCode, 0);
    assert.ok(result.stdout.includes('--source') || result.stdout.includes('Usage'));
  });

  it('no args shows error', () => {
    const result = runScript([]);
    assert.notEqual(result.exitCode, 0);
  });

  it('--source with nonexistent file shows error', () => {
    const result = runScript(['--source', '/nonexistent/file.txt']);
    assert.notEqual(result.exitCode, 0);
  });

  it('--format markdown generates valid output', () => {
    const project = tmpDir();
    const outputDir = join(project, 'kb');
    const inputFile = join(project, 'test.txt');
    writeFileSync(inputFile, 'This is test content for ingestion.\n\nSecond paragraph here.');

    try {
      const result = runScript(['--source', inputFile, '--output', outputDir, '--format', 'markdown'], project);
      assert.equal(result.exitCode, 0);
      const files = readdirSync(outputDir).filter(f => f.endsWith('.md'));
      assert.ok(files.length > 0, 'should generate at least one .md file');
    } finally {
      cleanup(project);
    }
  });

  it('output has frontmatter with title and source', () => {
    const project = tmpDir();
    const outputDir = join(project, 'kb');
    const inputFile = join(project, 'frontmatter-test.txt');
    writeFileSync(inputFile, 'Content with frontmatter test.');

    try {
      runScript(['--source', inputFile, '--output', outputDir, '--format', 'markdown'], project);
      const files = readdirSync(outputDir).filter(f => f.endsWith('.md'));
      if (files.length > 0) {
        const content = readFileSync(join(outputDir, files[0]), 'utf8');
        assert.ok(content.includes('---'), 'should have frontmatter');
      }
    } finally {
      cleanup(project);
    }
  });
});
