import { mkdtempSync, rmSync, existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve, dirname } from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import assert from 'node:assert/strict';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = resolve(__dirname, '..');
export const ARAI_PATH = join(REPO_ROOT, 'bin', 'arai.js');

export function runArai(args = [], cwd) {
  const cmdArgs = [ARAI_PATH, ...args];
  const result = spawnSync('node', cmdArgs, {
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

export function tmpDir() {
  return mkdtempSync(join(tmpdir(), 'arai-test-'));
}

export function cleanup(dir) {
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true });
  }
}

export function assertFile(path) {
  assert.ok(existsSync(path), `Expected file to exist: ${path}`);
}

export function assertNoFile(path) {
  assert.ok(!existsSync(path), `Expected file to NOT exist: ${path}`);
}

export function assertDir(path) {
  assert.ok(existsSync(path) && statSync(path).isDirectory(), `Expected directory to exist: ${path}`);
}

export function assertFileContent(path, pattern) {
  assertFile(path);
  const content = readFileSync(path, 'utf8');
  if (typeof pattern === 'string') {
    assert.ok(content.includes(pattern), `Expected file to contain: "${pattern}"\nFile: ${path}`);
  } else if (pattern instanceof RegExp) {
    assert.ok(pattern.test(content), `Expected file to match: ${pattern}\nFile: ${path}`);
  }
}

export function assertNoFileContent(path, pattern) {
  if (!existsSync(path)) return;
  const content = readFileSync(path, 'utf8');
  if (typeof pattern === 'string') {
    assert.ok(!content.includes(pattern), `Expected file to NOT contain: "${pattern}"\nFile: ${path}`);
  } else if (pattern instanceof RegExp) {
    assert.ok(!pattern.test(content), `Expected file to NOT match: ${pattern}\nFile: ${path}`);
  }
}

export function assertDirContent(path, expectedFiles) {
  assertDir(path);
  const actual = readdirSync(path).sort();
  const expected = [...expectedFiles].sort();
  assert.deepEqual(actual, expected, `Directory content mismatch: ${path}`);
}

export function assertExitCode(result, code) {
  assert.equal(result.exitCode, code, `Expected exit code ${code}, got ${result.exitCode}\nstdout: ${result.stdout}\nstderr: ${result.stderr}`);
}

export function assertOk(condition, message) {
  assert.ok(condition, message);
}

/**
 * Parse YAML frontmatter from a markdown file (between --- delimiters).
 * Handles flat keys and one level of indented objects (e.g., permission:).
 */
export function parseFrontmatter(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const match = content.match(/^---\n([\s\S]+?)\n---/);
  if (!match) return {};
  const body = match[1];
  const result = {};
  const lines = body.split('\n');
  let currentKey = null;
  for (const line of lines) {
    if (/^\s/.test(line) && currentKey) {
      const indentedMatch = line.match(/^\s{2,}(\S+?):\s*(.*)/);
      if (indentedMatch) {
        if (!result[currentKey]) result[currentKey] = {};
        result[currentKey][indentedMatch[1]] = indentedMatch[2] || '';
      }
    } else {
      const topMatch = line.match(/^(\S+?):\s*(.*)/);
      if (topMatch) {
        currentKey = topMatch[1];
        result[currentKey] = topMatch[2] || '';
      }
    }
  }
  return result;
}
