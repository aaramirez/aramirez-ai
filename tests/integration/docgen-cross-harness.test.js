import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { runArai, tmpDir, cleanup, assertFile, assertDir, assertExitCode } from '../helpers.js';

describe('docgen cross-harness validation', () => {
  let dir;
  let projectDir;

  afterEach(() => { if (dir) cleanup(dir); });

  function initFull() {
    dir = tmpDir();
    projectDir = join(dir, 'docgen-harness');
    const result = runArai(['init', projectDir, '--template', 'full', '--description', 'Docgen test']);
    assertExitCode(result, 0);
    return projectDir;
  }

  test('assets/templates/deck.css exists in generated harness', () => {
    const p = initFull();
    assertFile(join(p, 'assets', 'templates', 'deck.css'));
    const css = readFileSync(join(p, 'assets', 'templates', 'deck.css'), 'utf8');
    assert.ok(css.length > 100, 'deck.css should have meaningful content');
  });

  test('assets/templates/report.css exists in generated harness', () => {
    const p = initFull();
    assertFile(join(p, 'assets', 'templates', 'report.css'));
    const css = readFileSync(join(p, 'assets', 'templates', 'report.css'), 'utf8');
    assert.ok(css.length > 100, 'report.css should have meaningful content');
  });

  test('assets/templates/specs/ has 29 spec templates', () => {
    const p = initFull();
    assertDir(join(p, 'assets', 'templates', 'specs'));
    const specs = readdirSync(join(p, 'assets', 'templates', 'specs'))
      .filter(f => f.endsWith('.json'));
    assert.equal(specs.length, 29, `Expected 29 specs, got ${specs.length}`);
  });

  test('shared/scripts/docgen/ has all 12 scripts', () => {
    const p = initFull();
    assertDir(join(p, 'shared', 'scripts', 'docgen'));
    const scripts = readdirSync(join(p, 'shared', 'scripts', 'docgen'))
      .filter(f => f.endsWith('.js'));
    assert.ok(scripts.length >= 10, `Expected >=10 docgen scripts, got ${scripts.length}`);
  });

  test('shared/brand.json exists with valid brand config', () => {
    const p = initFull();
    assertFile(join(p, 'shared', 'brand.json'));
    const brand = JSON.parse(readFileSync(join(p, 'shared', 'brand.json'), 'utf8'));
    assert.ok(brand.brand, 'brand.json must have brand object');
    assert.ok(brand.brand.name, 'brand must have name');
    assert.ok(brand.brand.colors?.primary, 'brand must have primary color');
    assert.ok(brand.brand.logo, 'brand must have logo path');
  });

  test('assets/images/logo.svg exists', () => {
    const p = initFull();
    assertFile(join(p, 'assets', 'images', 'logo.svg'));
    const svg = readFileSync(join(p, 'assets', 'images', 'logo.svg'), 'utf8');
    assert.ok(svg.includes('<svg'), 'logo.svg must be valid SVG');
  });

  test('assets/images/logo-white.svg exists', () => {
    const p = initFull();
    assertFile(join(p, 'assets', 'images', 'logo-white.svg'));
  });

  test('docgen scripts parse without syntax errors', () => {
    const p = initFull();
    const scriptsDir = join(p, 'shared', 'scripts', 'docgen');
    const critical = ['index.js', 'charts.js', 'html-theme.js', 'report-theme.js',
      'build-deck.js', 'build-report.js', 'build-image.js', 'build-web.js'];
    for (const name of critical) {
      const path = join(scriptsDir, name);
      assert.ok(existsSync(path), `Script ${name} should exist`);
      const content = readFileSync(path, 'utf8');
      assert.ok(content.length > 0, `Script ${name} should not be empty`);
    }
  });

  test('opencode.json has agent definitions', () => {
    const p = initFull();
    const config = JSON.parse(readFileSync(join(p, 'opencode.json'), 'utf8'));
    assert.ok(config.agent, 'opencode.json must have agents');
    assert.ok(config.agent.build, 'Must have build agent');
    assert.ok(config.agent.plan, 'Must have plan agent');
  });

  test('deck.css contains valid CSS selectors', () => {
    const p = initFull();
    const css = readFileSync(join(p, 'assets', 'templates', 'deck.css'), 'utf8');
    assert.ok(css.includes('.slide'), 'deck.css must have .slide class');
    assert.ok(css.includes('.cover'), 'deck.css must have .cover class');
  });

  test('report.css contains valid CSS selectors', () => {
    const p = initFull();
    const css = readFileSync(join(p, 'assets', 'templates', 'report.css'), 'utf8');
    assert.ok(css.includes('.cover-page'), 'report.css must have .cover-page class');
    assert.ok(css.includes('.data-table'), 'report.css must have .data-table class');
  });

  test('full template includes all 30 skills', () => {
    const p = initFull();
    assertDir(join(p, '.opencode', 'skills'));
    const skills = readdirSync(join(p, '.opencode', 'skills'))
      .filter(f => statSync(join(p, '.opencode', 'skills', f)).isDirectory());
    assert.equal(skills.length, 30, `Expected 30 skills, got ${skills.length}`);
  });

  test('full template includes all agents', () => {
    const p = initFull();
    assertDir(join(p, '.opencode', 'agents'));
    const agents = readdirSync(join(p, '.opencode', 'agents'))
      .filter(f => f.endsWith('.md'));
    assert.ok(agents.length >= 4, `Expected >=4 agents, got ${agents.length}`);
  });

  test('full template includes all commands', () => {
    const p = initFull();
    assertDir(join(p, '.opencode', 'commands'));
    const cmds = readdirSync(join(p, '.opencode', 'commands'))
      .filter(f => f.endsWith('.md'));
    assert.ok(cmds.length >= 3, `Expected >=3 commands, got ${cmds.length}`);
  });

  test('full template includes plugins and tui', () => {
    const p = initFull();
    assertFile(join(p, '.opencode', 'plugins', 'custom-logo.tsx'));
    assertFile(join(p, '.opencode', 'tui.json'));
  });
});
