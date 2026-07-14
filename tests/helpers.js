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
 * Handles flat keys and arbitrary nested objects.
 */
export function parseFrontmatter(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const match = content.match(/^---\n([\s\S]+?)\n---/);
  if (!match) return {};

  const body = match[1];
  const lines = body.split('\n');
  const root = {};
  const stack = [{ obj: root, indent: -1 }];

  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const indent = line.search(/\S/);
    const m = line.match(/^(\s*)(\S+?):\s*(.*)/);
    if (!m) continue;

    const key = m[2];
    const val = m[3];

    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }

    if (val) {
      stack[stack.length - 1].obj[key] = val;
    } else {
      const newObj = {};
      stack[stack.length - 1].obj[key] = newObj;
      stack.push({ obj: newObj, indent });
    }
  }

  return root;
}

/**
 * Run opencode debug command and return parsed result.
 */
export function runOpencode(...args) {
  const flat = args.flat();
  const opts = flat.find(a => typeof a === 'object' && a !== null && !Array.isArray(a)) || {};
  const cmdArgs = flat.filter(a => typeof a === 'string' || Array.isArray(a)).flat();
  const result = spawnSync('opencode', cmdArgs, {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    stdio: 'pipe',
    timeout: opts.timeout || 30000,
  });
  return {
    stdout: (result.stdout || '').trim(),
    stderr: (result.stderr || '').trim(),
    exitCode: result.status ?? 1,
  };
}

/**
 * Validate an object against a simple schema definition.
 * Schema format: { required: [...], properties: { key: { type, enum, pattern, maxLength, minLength } } }
 * Returns { valid: boolean, errors: string[] }
 */
export function validateSchema(obj, schema, context = '') {
  const errors = [];
  const prefix = context ? `${context}: ` : '';

  if (schema.required) {
    for (const key of schema.required) {
      if (obj[key] === undefined || obj[key] === null || obj[key] === '') {
        errors.push(`${prefix}Missing required field: ${key}`);
      }
    }
  }

  if (schema.properties) {
    for (const [key, rules] of Object.entries(schema.properties)) {
      const val = obj[key];
      if (val === undefined || val === null) continue;

      if (rules.enum && !rules.enum.includes(val)) {
        errors.push(`${prefix}${key} must be one of [${rules.enum.join(', ')}], got: "${val}"`);
      }
      if (rules.type === 'string' && typeof val !== 'string') {
        errors.push(`${prefix}${key} must be a string, got: ${typeof val}`);
      }
      if (rules.minLength && typeof val === 'string' && val.length < rules.minLength) {
        errors.push(`${prefix}${key} must be >= ${rules.minLength} chars, got: ${val.length}`);
      }
      if (rules.maxLength && typeof val === 'string' && val.length > rules.maxLength) {
        errors.push(`${prefix}${key} must be <= ${rules.maxLength} chars, got: ${val.length}`);
      }
      if (rules.pattern && typeof val === 'string' && !new RegExp(rules.pattern).test(val)) {
        errors.push(`${prefix}${key} does not match pattern: ${rules.pattern}, got: "${val}"`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
