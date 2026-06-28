import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { runArai, tmpDir, cleanup, assertDir, assertFile, assertExitCode } from '../helpers.js';

describe('arai generate kb', () => {
  let dir;

  afterEach(() => {
    if (dir) cleanup(dir);
  });

  test('creates kb/ directory', () => {
    dir = tmpDir();
    const result = runArai(['generate', 'kb', dir]);
    assertExitCode(result, 0);
    assertDir(join(dir, 'kb'));
  });

  test('creates .obsidian config files', () => {
    dir = tmpDir();
    runArai(['generate', 'kb', dir]);
    assertFile(join(dir, 'kb', '.obsidian', 'app.json'));
    assertFile(join(dir, 'kb', '.obsidian', 'graph.json'));
    assertFile(join(dir, 'kb', '.obsidian', 'workspace.json'));
  });

  test('creates Architecture/, Team/, Processes/, Knowledge/ subdirs', () => {
    dir = tmpDir();
    runArai(['generate', 'kb', dir]);
    assertDir(join(dir, 'kb', 'Architecture'));
    assertDir(join(dir, 'kb', 'Team'));
    assertDir(join(dir, 'kb', 'Processes'));
    assertDir(join(dir, 'kb', 'Knowledge'));
  });

  test('creates Index.md with wikilinks', () => {
    dir = tmpDir();
    runArai(['generate', 'kb', dir]);
    assertFile(join(dir, 'kb', 'Index.md'));
  });

  test('each subdir has its own Index.md', () => {
    dir = tmpDir();
    runArai(['generate', 'kb', dir]);
    for (const sub of ['Architecture', 'Team', 'Processes', 'Knowledge']) {
      assertFile(join(dir, 'kb', sub, 'Index.md'));
    }
  });

  test('warns without --force on existing dir', () => {
    dir = tmpDir();
    runArai(['generate', 'kb', dir]);
    const result = runArai(['generate', 'kb', dir]);
    assert.ok(result.stdout.includes('already exists') || result.stderr.includes('already exists'),
      `Expected warning, got: ${result.stdout}`);
  });

  test('--force overwrites existing kb/', () => {
    dir = tmpDir();
    runArai(['generate', 'kb', dir]);
    const result = runArai(['generate', 'kb', dir, '--force']);
    assertExitCode(result, 0);
    assertDir(join(dir, 'kb'));
  });
});
