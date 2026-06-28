import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'fs';
import { join } from 'path';
import { runArai, tmpDir, cleanup, assertFile, assertDir, assertExitCode, REPO_ROOT } from '../helpers.js';

describe('arai sync skill', () => {
  let dir;

  afterEach(() => {
    if (dir) cleanup(dir);
  });

  test('sync skill (no name) syncs all skills to .opencode/skills/', () => {
    dir = tmpDir();
    runArai(['install', '--project', dir]);
    const result = runArai(['sync', 'skill', '--project', dir]);
    assertExitCode(result, 0);
    assertDir(join(dir, '.opencode', 'skills'));
    assertFile(join(dir, '.opencode', 'skills', 'git', 'SKILL.md'));
  });

  test('sync skill <name> syncs only that skill', () => {
    dir = tmpDir();
    runArai(['install', '--project', dir]);
    runArai(['sync', 'skill', 'branding', '--project', dir]);
    assertFile(join(dir, '.opencode', 'skills', 'branding', 'SKILL.md'));
  });

  test('sync skill <nonexistent> gives error', () => {
    dir = tmpDir();
    runArai(['install', '--project', dir]);
    const result = runArai(['sync', 'skill', 'nonexistent-skill', '--project', dir]);
    assert.ok(result.stdout.includes('not found'), `Expected error, got: ${result.stdout}`);
  });

  test('synced skill content matches source', () => {
    dir = tmpDir();
    runArai(['install', '--project', dir]);
    runArai(['sync', 'skill', 'git', '--project', dir]);
    const sourceContent = readFileSync(join(REPO_ROOT, 'shared', 'skills', 'git', 'SKILL.md'), 'utf8');
    const syncedContent = readFileSync(join(dir, '.opencode', 'skills', 'git', 'SKILL.md'), 'utf8');
    assert.equal(syncedContent, sourceContent, 'Synced content should match source');
  });

  test('sync skill without opencode installed works anyway', () => {
    dir = tmpDir();
    const result = runArai(['sync', 'skill', '--project', dir]);
    assertExitCode(result, 0);
  });
});
