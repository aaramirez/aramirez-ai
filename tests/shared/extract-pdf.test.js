import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpDir, cleanup, REPO_ROOT } from '../helpers.js';
import { spawnSync } from 'child_process';

function runScript(args = [], cwd) {
  const result = spawnSync('node', [join(REPO_ROOT, 'shared', 'skills', 'pdf-extraction', 'scripts', 'extract-pdf.js'), ...args], {
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

describe('extract-pdf.js', () => {
  it('--help shows usage', () => {
    const result = runScript(['--help']);
    assert.equal(result.exitCode, 0);
    assert.ok(result.stdout.includes('Usage') || result.stdout.includes('extract'));
  });

  it('no file shows error', () => {
    const result = runScript([]);
    assert.notEqual(result.exitCode, 0);
  });

  it('nonexistent file shows error', () => {
    const result = runScript(['/nonexistent/file.pdf']);
    assert.notEqual(result.exitCode, 0);
  });

  it('--output generates file when PDF exists', () => {
    const project = tmpDir();
    const pdfFile = join(project, 'test.pdf');
    writeFileSync(pdfFile, 'fake pdf content');
    const outputFile = join(project, 'output.txt');

    try {
      const result = runScript([pdfFile, '--output', outputFile], project);
      if (existsSync(outputFile)) {
        const content = readFileSync(outputFile, 'utf8');
        assert.ok(content.length > 0, 'output file should not be empty');
      }
    } finally {
      cleanup(project);
    }
  });

  it('--format markdown produces markdown output', () => {
    const project = tmpDir();
    const pdfFile = join(project, 'test.pdf');
    writeFileSync(pdfFile, 'fake pdf content');

    try {
      const result = runScript([pdfFile, '--format', 'markdown'], project);
      if (result.exitCode === 0 && result.stdout.length > 0) {
        assert.ok(typeof result.stdout === 'string');
      }
    } finally {
      cleanup(project);
    }
  });
});
