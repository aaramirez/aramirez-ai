import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { runArai, tmpDir, cleanup, assertFile, assertDir, assertNoFile, assertExitCode, assertFileContent, REPO_ROOT } from '../helpers.js';

describe('arai generate', () => {
  let dir;

  afterEach(() => {
    if (dir) cleanup(dir);
  });

  function initProject(path, template = 'full') {
    const result = runArai(['init', path, '--template', template]);
    assertExitCode(result, 0);
  }

  test('arai generate skill <name> creates shared/skills/<name>/SKILL.md', () => {
    dir = tmpDir();
    initProject(dir);
    const result = runArai(['generate', 'skill', 'my-skill', '--dir', dir]);
    assertExitCode(result, 0);
    assertFile(join(dir, 'shared', 'skills', 'my-skill', 'SKILL.md'));
  });

  test('generated skill has frontmatter with name and description', () => {
    dir = tmpDir();
    initProject(dir);
    runArai(['generate', 'skill', 'test-skill', '--dir', dir]);
    const content = readFileSync(join(dir, 'shared', 'skills', 'test-skill', 'SKILL.md'), 'utf8');
    assert.ok(content.includes('name: test-skill'), 'Should have name in frontmatter');
    assert.ok(content.match(/^description:/m), 'Should have description in frontmatter');
  });

  test('arai generate agent <name> creates shared/agents/<name>.md', () => {
    dir = tmpDir();
    initProject(dir);
    const result = runArai(['generate', 'agent', 'my-agent', '--dir', dir]);
    assertExitCode(result, 0);
    assertFile(join(dir, 'shared', 'agents', 'my-agent.md'));
  });

  test('generated agent is registered in opencode.json', () => {
    dir = tmpDir();
    initProject(dir);
    runArai(['generate', 'agent', 'test-agent', '--dir', dir]);
    const config = JSON.parse(readFileSync(join(dir, 'platforms', 'opencode', 'opencode.json'), 'utf8'));
    assert.ok(config.agent?.['test-agent'], 'Agent should be registered in opencode.json');
  });

  test('arai generate script <name> creates shared/scripts/<name>.js', () => {
    dir = tmpDir();
    initProject(dir);
    const result = runArai(['generate', 'script', 'my-script', '--dir', dir]);
    assertExitCode(result, 0);
    assertFile(join(dir, 'shared', 'scripts', 'my-script.js'));
  });

  test('arai generate command <name> creates platforms/opencode/commands/<name>.md', () => {
    dir = tmpDir();
    initProject(dir);
    const result = runArai(['generate', 'command', 'my-cmd', '--dir', dir]);
    assertExitCode(result, 0);
    assertFile(join(dir, 'platforms', 'opencode', 'commands', 'my-cmd.md'));
  });

  test('generated command is registered in opencode.json', () => {
    dir = tmpDir();
    initProject(dir);
    runArai(['generate', 'command', 'test-cmd', '--dir', dir]);
    const config = JSON.parse(readFileSync(join(dir, 'platforms', 'opencode', 'opencode.json'), 'utf8'));
    assert.ok(config.command?.['test-cmd'], 'Command should be registered in opencode.json');
  });

  test('arai generate brand creates/updates shared/brand.json', () => {
    dir = tmpDir();
    initProject(dir);
    const result = runArai(['generate', 'brand', '--dir', dir, '--primary', '#ff0000']);
    assertExitCode(result, 0);
    assertFile(join(dir, 'shared', 'brand.json'));
    const brand = JSON.parse(readFileSync(join(dir, 'shared', 'brand.json'), 'utf8'));
    assert.equal(brand.brand.colors.primary, '#ff0000', 'Brand primary color should be updated');
  });

  test('arai generate skill already exists gives warning', () => {
    dir = tmpDir();
    initProject(dir);
    runArai(['generate', 'skill', 'dup-skill', '--dir', dir]);
    const result = runArai(['generate', 'skill', 'dup-skill', '--dir', dir]);
    assert.ok(result.stdout.includes('already exists'), `Expected warning, got: ${result.stdout}`);
  });

  test('arai generate outside arai project gives error', () => {
    dir = tmpDir();
    const result = runArai(['generate', 'skill', 'orphan', '--dir', dir]);
    assert.ok(result.stdout.includes('arai project') || result.stderr.includes('arai project'),
      `Expected error about not being in arai project`);
  });

  test('--description option works for agent generation', () => {
    dir = tmpDir();
    initProject(dir);
    const result = runArai(['generate', 'agent', 'custom-agent', '--dir', dir, '--description', 'My custom agent']);
    assertExitCode(result, 0);
    const config = JSON.parse(readFileSync(join(dir, 'platforms', 'opencode', 'opencode.json'), 'utf8'));
    assert.equal(config.agent['custom-agent'].description, 'My custom agent');
  });
});
