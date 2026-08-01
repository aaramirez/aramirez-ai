import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { pathToFileURL } from 'url';
import { spawnSync } from 'child_process';
import { REPO_ROOT, tmpDir, cleanup } from '../helpers.js';

const WRAPPER = join(REPO_ROOT, '.opencode', 'scripts', 'mytasks.js');
const MYTASKS_CLI = resolve(REPO_ROOT, '..', 'mytasks', 'packages', 'cli', 'dist', 'index.js');

describe('mytasks wrapper script', () => {
  test('wrapper exists and is ESM', () => {
    assert.ok(existsSync(WRAPPER), `Wrapper not found: ${WRAPPER}`);
  });

  test('imports resolveMytasksRepo and buildCliPath', async () => {
    const mod = await import(pathToFileURL(WRAPPER).href);
    assert.equal(typeof mod.resolveMytasksRepo, 'function');
    assert.equal(typeof mod.buildCliPath, 'function');
    assert.equal(typeof mod.run, 'function');
  });

  test('resolveMytasksRepo defaults to <repoRoot>/../mytasks', async () => {
    const mod = await import(pathToFileURL(WRAPPER).href);
    const expected = resolve(REPO_ROOT, '..', 'mytasks');
    assert.equal(mod.resolveMytasksRepo({}, REPO_ROOT), expected);
  });

  test('resolveMytasksRepo honors MYTASKS_REPO override', async () => {
    const mod = await import(pathToFileURL(WRAPPER).href);
    assert.equal(mod.resolveMytasksRepo({ MYTASKS_REPO: '/custom/repo' }, REPO_ROOT), '/custom/repo');
  });

  test('buildCliPath points to packages/cli/dist/index.js', async () => {
    const mod = await import(pathToFileURL(WRAPPER).href);
    assert.equal(mod.buildCliPath('/repo'), join('/repo', 'packages', 'cli', 'dist', 'index.js'));
  });

  test('run fails with exit 1 and build hint when dist is missing', async () => {
    const mod = await import(pathToFileURL(WRAPPER).href);
    const dir = tmpDir();
    try {
      const result = mod.run([], { MYTASKS_REPO: dir }, REPO_ROOT);
      assert.equal(result.status, 1);
      assert.match(result.message, /npm run build/);
    } finally {
      cleanup(dir);
    }
  });

  test('integration: list --json returns ok envelope', { skip: !existsSync(MYTASKS_CLI) }, () => {
    const result = spawnSync('node', [WRAPPER, 'list', '--json'], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 30000,
    });
    assert.equal(result.status, 0, `stderr: ${result.stderr}`);
    const parsed = JSON.parse(result.stdout);
    assert.equal(parsed.ok, true);
    assert.ok(Array.isArray(parsed.data));
  });
});
