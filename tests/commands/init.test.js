import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync, mkdirSync, writeFileSync } from 'fs';
import { join, basename } from 'path';
import { runArai, tmpDir, cleanup, assertFile, assertDir, assertFileContent, assertNoFile, assertExitCode } from '../helpers.js';

describe('arai init', () => {
  let dir;
  let projectDir;

  afterEach(() => {
    if (dir) cleanup(dir);
  });

  test('creates project directory with minimal template (default)', () => {
    dir = tmpDir();
    projectDir = join(dir, 'myproj');
    const result = runArai(['init', projectDir]);
    assertExitCode(result, 0);
    assertDir(projectDir);
  });

  test('creates AGENTS.md', () => {
    dir = tmpDir();
    projectDir = join(dir, 'myproj2');
    runArai(['init', projectDir]);
    assertFile(join(projectDir, 'AGENTS.md'));
  });

  test('creates .gitignore', () => {
    dir = tmpDir();
    projectDir = join(dir, 'myproj3');
    runArai(['init', projectDir]);
    assertFile(join(projectDir, '.gitignore'));
  });

  test('minimal template includes git skill', () => {
    dir = tmpDir();
    projectDir = join(dir, 'minimal-test');
    runArai(['init', projectDir, '--template', 'minimal']);
    assertFile(join(projectDir, '.opencode', 'skills', 'git', 'SKILL.md'));
  });

  test('minimal template includes code-review skill', () => {
    dir = tmpDir();
    projectDir = join(dir, 'minimal-test2');
    runArai(['init', projectDir, '--template', 'minimal']);
    assertFile(join(projectDir, '.opencode', 'skills', 'code-review', 'SKILL.md'));
  });

  test('minimal template includes commit-message prompt', () => {
    dir = tmpDir();
    projectDir = join(dir, 'minimal-test3');
    runArai(['init', projectDir, '--template', 'minimal']);
    assertFile(join(projectDir, 'shared', 'prompts', 'commit-message.md'));
  });

  test('minimal template includes code-style rule', () => {
    dir = tmpDir();
    projectDir = join(dir, 'minimal-test4');
    runArai(['init', projectDir, '--template', 'minimal']);
    assertFile(join(projectDir, 'shared', 'rules', 'code-style.md'));
  });

  test('minimal template includes opencode platform', () => {
    dir = tmpDir();
    projectDir = join(dir, 'minimal-test5');
    runArai(['init', projectDir, '--template', 'minimal']);
    assertFile(join(projectDir, 'opencode.json'));
    assert.ok(!existsSync(join(projectDir, '.opencode', 'agents')),
      'Minimal template should not have agents (agents: [])');
    assert.ok(!existsSync(join(projectDir, '.opencode', 'commands')),
      'Minimal template should not have commands (commands: [])');
  });

  test('minimal template does NOT include full skills (e.g. branding)', () => {
    dir = tmpDir();
    projectDir = join(dir, 'minimal-test6');
    runArai(['init', projectDir, '--template', 'minimal']);
    assert.ok(!existsSync(join(projectDir, '.opencode', 'skills', 'branding', 'SKILL.md')),
      'Minimal template should not include branding skill');
  });

  test('minimal template does NOT include transforms dir', () => {
    dir = tmpDir();
    projectDir = join(dir, 'minimal-test7');
    runArai(['init', projectDir, '--template', 'minimal']);
    assert.ok(!existsSync(join(projectDir, 'transforms')),
      'Minimal template should not include transforms');
  });

  test('full template includes all skills', () => {
    dir = tmpDir();
    projectDir = join(dir, 'full-test');
    runArai(['init', projectDir, '--template', 'full']);
    const skillsDir = join(projectDir, '.opencode', 'skills');
    const dirs = readdirSync(skillsDir).filter(f => statSync(join(skillsDir, f)).isDirectory());
    assert.ok(dirs.length >= 8, `Expected at least 8 skills, got ${dirs.length}`);
  });

  test('full template includes scripts directory', () => {
    dir = tmpDir();
    projectDir = join(dir, 'full-test2');
    runArai(['init', projectDir, '--template', 'full']);
    assertDir(join(projectDir, '.opencode', 'scripts'));
  });

  test('full template includes branding', () => {
    dir = tmpDir();
    projectDir = join(dir, 'full-test3');
    runArai(['init', projectDir, '--template', 'full']);
    assertFile(join(projectDir, 'shared', 'brand.json'));
  });

  test('full template includes assets with logos', () => {
    dir = tmpDir();
    projectDir = join(dir, 'full-test4');
    runArai(['init', projectDir, '--template', 'full']);
    assertFile(join(projectDir, 'assets', 'images', 'logo.svg'));
    assertFile(join(projectDir, 'assets', 'images', 'logo-white.svg'));
  });

  test('full template includes package.json', () => {
    dir = tmpDir();
    projectDir = join(dir, 'full-test5');
    runArai(['init', projectDir, '--template', 'full']);
    assertFile(join(projectDir, 'package.json'));
  });

  test('--description option is reflected in AGENTS.md', () => {
    dir = tmpDir();
    projectDir = join(dir, 'desc-test');
    runArai(['init', projectDir, '--description', 'My custom project']);
    assertFileContent(join(projectDir, 'AGENTS.md'), /My custom project/);
  });

  test('generated opencode.json has no skills.paths (native discovery)', () => {
    dir = tmpDir();
    projectDir = join(dir, 'skills-test');
    runArai(['init', projectDir, '--template', 'minimal']);
    const configPath = join(projectDir, 'opencode.json');
    const config = JSON.parse(readFileSync(configPath, 'utf8'));
    assert.ok(!config.skills?.paths,
      `Expected no skills.paths, got: ${JSON.stringify(config.skills?.paths)}`);
  });

  test('fails gracefully if directory already exists and is not empty', () => {
    dir = tmpDir();
    projectDir = join(dir, 'existing-dir');
    // Create a non-empty dir
    mkdirSync(projectDir, { recursive: true });
    writeFileSync(join(projectDir, 'some-file.txt'), 'content');
    const result = runArai(['init', projectDir]);
    assert.ok(result.exitCode !== 0 || result.stderr.includes('not empty') || result.stdout.includes('not empty'),
      `Expected error about non-empty directory, got exit code ${result.exitCode}\nstdout: ${result.stdout}\nstderr: ${result.stderr}`);
  });

  test('generated AGENTS.md accurately describes project structure', () => {
    dir = tmpDir();
    projectDir = join(dir, 'acc-test');
    runArai(['init', projectDir, '--template', 'minimal']);
    const agentsContent = readFileSync(join(projectDir, 'AGENTS.md'), 'utf8');
    assert.ok(agentsContent.includes('.opencode/skills'), 'AGENTS.md should mention .opencode/skills');
    assert.ok(agentsContent.includes('.opencode'), 'AGENTS.md should mention .opencode');
  });
});
