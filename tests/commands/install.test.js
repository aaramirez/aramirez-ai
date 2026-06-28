import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { runArai, tmpDir, cleanup, assertFile, assertDir, assertExitCode, REPO_ROOT } from '../helpers.js';

describe('arai install/uninstall', () => {
  let dir;

  afterEach(() => {
    if (dir) cleanup(dir);
  });

  // ── install (bare) ──

  test('arai install (bare) creates .opencode/ with subdirs', () => {
    dir = tmpDir();
    const result = runArai(['install', '--project', dir]);
    assertExitCode(result, 0);
    assertDir(join(dir, '.opencode'));
    assertDir(join(dir, '.opencode', 'agents'));
    assertDir(join(dir, '.opencode', 'skills'));
    assertDir(join(dir, '.opencode', 'commands'));
  });

  test('arai install (bare) creates opencode.json at project root', () => {
    dir = tmpDir();
    runArai(['install', '--project', dir]);
    assertFile(join(dir, 'opencode.json'));
  });

  test('arai install --project <dir> works', () => {
    dir = tmpDir();
    const sub = join(dir, 'subdir');
    runArai(['install', '--project', sub]);
    assertFile(join(sub, 'opencode.json'));
    assertDir(join(sub, '.opencode'));
  });

  test('arai install warns if already installed', () => {
    dir = tmpDir();
    runArai(['install', '--project', dir]);
    const result = runArai(['install', '--project', dir]);
    assert.ok(result.stdout.includes('already installed'), `Expected warning, got: ${result.stdout}`);
  });

  // ── install skill ──

  test('arai install skill <name> copies skill to .opencode/skills/', () => {
    dir = tmpDir();
    runArai(['install', '--project', dir]);
    const result = runArai(['install', 'skill', 'git', '--project', dir]);
    assertExitCode(result, 0);
    assertFile(join(dir, '.opencode', 'skills', 'git', 'SKILL.md'));
  });

  test('arai install skill <name> auto-installs opencode if missing', () => {
    dir = tmpDir();
    const result = runArai(['install', 'skill', 'git', '--project', dir]);
    assertExitCode(result, 0);
    assertDir(join(dir, '.opencode'));
    assertFile(join(dir, '.opencode', 'skills', 'git', 'SKILL.md'));
    assertFile(join(dir, 'opencode.json'));
  });

  test('arai install skill <unknown> gives error with available list', () => {
    dir = tmpDir();
    runArai(['install', '--project', dir]);
    const result = runArai(['install', 'skill', 'nonexistent-skill', '--project', dir]);
    assert.ok(result.exitCode !== 0 || result.stdout.includes('not found') || result.stderr.includes('not found'),
      `Expected error, got: ${result.stdout} ${result.stderr}`);
  });

  // ── install agent ──

  test('arai install agent <name> copies agent .md and registers in opencode.json', () => {
    dir = tmpDir();
    runArai(['install', '--project', dir]);
    const result = runArai(['install', 'agent', 'reviewer', '--project', dir]);
    assertExitCode(result, 0);
    assertFile(join(dir, '.opencode', 'agents', 'reviewer.md'));

    const config = JSON.parse(readFileSync(join(dir, 'opencode.json'), 'utf8'));
    assert.ok(config.agent?.reviewer, 'reviewer should be in opencode.json');
  });

  test('arai install agent <name> auto-installs opencode if missing', () => {
    dir = tmpDir();
    const result = runArai(['install', 'agent', 'reviewer', '--project', dir]);
    assertExitCode(result, 0);
    assertDir(join(dir, '.opencode'));
    assertFile(join(dir, '.opencode', 'agents', 'reviewer.md'));
    assertFile(join(dir, 'opencode.json'));
  });

  // ── install script ──

  test('arai install script <name> copies to shared/scripts/', () => {
    dir = tmpDir();
    const result = runArai(['install', 'script', 'ci-validate', '--project', dir]);
    assertExitCode(result, 0);
    assertFile(join(dir, 'shared', 'scripts', 'ci-validate.js'));
  });

  // ── install prompt ──

  test('arai install prompt <name> copies to shared/prompts/', () => {
    dir = tmpDir();
    const result = runArai(['install', 'prompt', 'commit-message', '--project', dir]);
    assertExitCode(result, 0);
    assertFile(join(dir, 'shared', 'prompts', 'commit-message.md'));
  });

  // ── install rule ──

  test('arai install rule <name> copies to shared/rules/', () => {
    dir = tmpDir();
    const result = runArai(['install', 'rule', 'code-style', '--project', dir]);
    assertExitCode(result, 0);
    assertFile(join(dir, 'shared', 'rules', 'code-style.md'));
  });

  // ── uninstall (bare) ──

  test('arai uninstall (bare) removes .opencode/ and opencode.json', () => {
    dir = tmpDir();
    runArai(['install', '--project', dir]);
    const result = runArai(['uninstall', '--project', dir]);
    assertExitCode(result, 0);
    assert.ok(!existsSync(join(dir, '.opencode')), '.opencode should be removed');
    assert.ok(!existsSync(join(dir, 'opencode.json')), 'opencode.json should be removed');
  });

  test('arai uninstall with nothing to uninstall gives info message', () => {
    dir = tmpDir();
    const result = runArai(['uninstall', '--project', dir]);
    assert.ok(result.stdout.includes('No opencode'), `Expected info, got: ${result.stdout}`);
  });

  // ── uninstall skill ──

  test('arai uninstall skill <name> removes skill directory', () => {
    dir = tmpDir();
    runArai(['install', '--project', dir]);
    runArai(['install', 'skill', 'git', '--project', dir]);
    assertFile(join(dir, '.opencode', 'skills', 'git', 'SKILL.md'));

    const result = runArai(['uninstall', 'skill', 'git', '--project', dir]);
    assertExitCode(result, 0);
    assert.ok(!existsSync(join(dir, '.opencode', 'skills', 'git')),
      'Skill directory should be removed');
  });

  test('arai uninstall skill <not-installed> gives info message', () => {
    dir = tmpDir();
    runArai(['install', '--project', dir]);
    const result = runArai(['uninstall', 'skill', 'git', '--project', dir]);
    assert.ok(result.stdout.includes('not installed'), `Expected info, got: ${result.stdout}`);
  });

  // ── uninstall agent ──

  test('arai uninstall agent <name> removes agent .md and opencode.json entry', () => {
    dir = tmpDir();
    runArai(['install', '--project', dir]);
    runArai(['install', 'agent', 'reviewer', '--project', dir]);
    assertFile(join(dir, '.opencode', 'agents', 'reviewer.md'));

    const result = runArai(['uninstall', 'agent', 'reviewer', '--project', dir]);
    assertExitCode(result, 0);
    assert.ok(!existsSync(join(dir, '.opencode', 'agents', 'reviewer.md')),
      'Agent file should be removed');

    const config = JSON.parse(readFileSync(join(dir, 'opencode.json'), 'utf8'));
    assert.ok(!config.agent?.reviewer, 'reviewer should not be in opencode.json');
  });

  // ── uninstall script/prompt/rule ──

  test('arai uninstall script <name> removes from shared/scripts/', () => {
    dir = tmpDir();
    runArai(['install', 'script', 'ci-validate', '--project', dir]);
    assertFile(join(dir, 'shared', 'scripts', 'ci-validate.js'));

    const result = runArai(['uninstall', 'script', 'ci-validate', '--project', dir]);
    assertExitCode(result, 0);
    assert.ok(!existsSync(join(dir, 'shared', 'scripts', 'ci-validate.js')));
  });

  test('arai uninstall prompt <name> removes from shared/prompts/', () => {
    dir = tmpDir();
    runArai(['install', 'prompt', 'commit-message', '--project', dir]);
    const result = runArai(['uninstall', 'prompt', 'commit-message', '--project', dir]);
    assertExitCode(result, 0);
    assert.ok(!existsSync(join(dir, 'shared', 'prompts', 'commit-message.md')));
  });

  test('arai uninstall rule <name> removes from shared/rules/', () => {
    dir = tmpDir();
    runArai(['install', 'rule', 'code-style', '--project', dir]);
    const result = runArai(['uninstall', 'rule', 'code-style', '--project', dir]);
    assertExitCode(result, 0);
    assert.ok(!existsSync(join(dir, 'shared', 'rules', 'code-style.md')));
  });

  // ── composite scenarios ──

  test('install, then install skill on existing install', () => {
    dir = tmpDir();
    runArai(['install', '--project', dir]);
    runArai(['install', 'skill', 'git', '--project', dir]);
    runArai(['install', 'skill', 'code-review', '--project', dir]);

    assertFile(join(dir, '.opencode', 'skills', 'git', 'SKILL.md'));
    assertFile(join(dir, '.opencode', 'skills', 'code-review', 'SKILL.md'));
  });

  test('--project path works for install and uninstall', () => {
    dir = tmpDir();
    const sub = join(dir, 'other-dir');
    runArai(['install', '--project', sub]);
    assertFile(join(sub, 'opencode.json'));

    runArai(['install', 'skill', 'git', '--project', sub]);
    assertFile(join(sub, '.opencode', 'skills', 'git', 'SKILL.md'));

    runArai(['uninstall', '--project', sub]);
    assert.ok(!existsSync(join(sub, 'opencode.json')));
  });

  test('installed skill content matches source', () => {
    dir = tmpDir();
    runArai(['install', '--project', dir]);
    runArai(['install', 'skill', 'git', '--project', dir]);

    const sourceContent = readFileSync(join(REPO_ROOT, 'shared', 'skills', 'git', 'SKILL.md'), 'utf8');
    const installedContent = readFileSync(join(dir, '.opencode', 'skills', 'git', 'SKILL.md'), 'utf8');
    assert.equal(installedContent, sourceContent, 'Installed skill content should match source');
  });
});
