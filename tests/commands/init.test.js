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

  test('succeeds on existing non-empty directory (additive mode)', () => {
    dir = tmpDir();
    projectDir = join(dir, 'existing-dir');
    mkdirSync(projectDir, { recursive: true });
    writeFileSync(join(projectDir, 'some-file.txt'), 'content');
    writeFileSync(join(projectDir, 'README.md'), '# My Project');
    const result = runArai(['init', projectDir]);
    assertExitCode(result, 0);
    assertFile(join(projectDir, 'some-file.txt'));
    assertFile(join(projectDir, 'README.md'));
    assertFileContent(join(projectDir, 'some-file.txt'), 'content');
    assertFile(join(projectDir, 'opencode.json'));
    assertFile(join(projectDir, 'AGENTS.md'));
  });

  test('merges .gitignore on existing directory', () => {
    dir = tmpDir();
    projectDir = join(dir, 'merge-gitignore');
    mkdirSync(projectDir, { recursive: true });
    writeFileSync(join(projectDir, '.gitignore'), 'build/\n*.class\n');
    runArai(['init', projectDir]);
    const content = readFileSync(join(projectDir, '.gitignore'), 'utf8');
    assert.ok(content.includes('build/'), 'Preserves existing .gitignore entries');
    assert.ok(content.includes('*.class'), 'Preserves existing .gitignore entries');
    assert.ok(content.includes('node_modules/'), 'Adds arai .gitignore entries');
    assert.ok(content.includes('.env'), 'Adds arai .gitignore entries');
  });

  test('merges package.json on existing directory', () => {
    dir = tmpDir();
    projectDir = join(dir, 'merge-pkg');
    mkdirSync(projectDir, { recursive: true });
    writeFileSync(join(projectDir, 'package.json'), JSON.stringify({
      name: 'my-app', version: '2.0.0', dependencies: { express: '^4.18.0' }
    }, null, 2));
    runArai(['init', projectDir, '--template', 'full']);
    const pkg = JSON.parse(readFileSync(join(projectDir, 'package.json'), 'utf8'));
    assert.equal(pkg.name, 'my-app', 'Preserves existing package name');
    assert.equal(pkg.version, '2.0.0', 'Preserves existing version');
    assert.deepEqual(pkg.dependencies, { express: '^4.18.0' }, 'Preserves existing dependencies');
    assert.equal(pkg.type, 'module', 'Adds type: module');
    assert.ok(pkg.engines, 'Adds engines field');
  });

  test('skips repos.json if it already exists', () => {
    dir = tmpDir();
    projectDir = join(dir, 'skip-repos');
    mkdirSync(projectDir, { recursive: true });
    const customRepos = [{ name: 'my/repo', url: 'https://github.com/my/repo.git' }];
    writeFileSync(join(projectDir, 'repos.json'), JSON.stringify(customRepos));
    runArai(['init', projectDir, '--template', 'full']);
    const repos = JSON.parse(readFileSync(join(projectDir, 'repos.json'), 'utf8'));
    assert.equal(repos[0].name, 'my/repo', 'Preserves existing repos.json');
  });

  test('does not overwrite existing assets', () => {
    dir = tmpDir();
    projectDir = join(dir, 'keep-assets');
    mkdirSync(projectDir, { recursive: true });
    mkdirSync(join(projectDir, 'assets', 'images'), { recursive: true });
    writeFileSync(join(projectDir, 'assets', 'images', 'logo.svg'), '<svg>custom</svg>');
    runArai(['init', projectDir, '--template', 'full']);
    const content = readFileSync(join(projectDir, 'assets', 'images', 'logo.svg'), 'utf8');
    assert.equal(content, '<svg>custom</svg>', 'Preserves existing custom logo');
  });

  test('overwrites opencode.json (arai-managed)', () => {
    dir = tmpDir();
    projectDir = join(dir, 'overwrite-config');
    mkdirSync(projectDir, { recursive: true });
    writeFileSync(join(projectDir, 'opencode.json'), '{}');
    runArai(['init', projectDir, '--template', 'minimal']);
    const config = JSON.parse(readFileSync(join(projectDir, 'opencode.json'), 'utf8'));
    assert.ok(config.model, 'opencode.json should be overwritten with template');
  });

  test('overwrites AGENTS.md (auto-generated)', () => {
    dir = tmpDir();
    projectDir = join(dir, 'overwrite-agents');
    mkdirSync(projectDir, { recursive: true });
    writeFileSync(join(projectDir, 'AGENTS.md'), '# Old content');
    runArai(['init', projectDir]);
    const content = readFileSync(join(projectDir, 'AGENTS.md'), 'utf8');
    assert.ok(!content.includes('Old content'), 'AGENTS.md should be regenerated');
    assert.ok(content.includes('AI Agent Instructions'), 'AGENTS.md should have arai template');
  });

  test('preserves arbitrary user directories', () => {
    dir = tmpDir();
    projectDir = join(dir, 'preserve-user');
    mkdirSync(projectDir, { recursive: true });
    mkdirSync(join(projectDir, 'src'), { recursive: true });
    writeFileSync(join(projectDir, 'src', 'index.ts'), 'export {}');
    mkdirSync(join(projectDir, 'lib'), { recursive: true });
    writeFileSync(join(projectDir, 'lib', 'utils.js'), 'module.exports = {}');
    runArai(['init', projectDir]);
    assertFile(join(projectDir, 'src', 'index.ts'));
    assertFile(join(projectDir, 'lib', 'utils.js'));
    assertFileContent(join(projectDir, 'src', 'index.ts'), 'export {}');
  });

  test('sets type:module even when existing package.json has no type', () => {
    dir = tmpDir();
    projectDir = join(dir, 'no-type');
    mkdirSync(projectDir, { recursive: true });
    writeFileSync(join(projectDir, 'package.json'), JSON.stringify({ name: 'x' }));
    runArai(['init', projectDir, '--template', 'full']);
    const pkg = JSON.parse(readFileSync(join(projectDir, 'package.json'), 'utf8'));
    assert.equal(pkg.type, 'module');
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
