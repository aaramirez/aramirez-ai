import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { runArai, tmpDir, cleanup, assertFile, assertDir, assertExitCode, REPO_ROOT } from '../helpers.js';

describe('arai generate outcome validation (Phase 3a)', () => {
  let dir;

  afterEach(() => {
    if (dir) cleanup(dir);
  });

  function initProject(path, template = 'full') {
    const result = runArai(['init', path, '--template', template]);
    assertExitCode(result, 0);
  }

  /* ─── 3a: skill content depth ─── */

  test('generate skill produces file with license: MIT and headings', () => {
    dir = tmpDir();
    initProject(dir);
    const result = runArai(['generate', 'skill', 'deep-skill', '--dir', dir]);
    assertExitCode(result, 0);
    const content = readFileSync(join(dir, '.opencode', 'skills', 'deep-skill', 'SKILL.md'), 'utf8');
    assert.ok(content.includes('license: MIT'), 'Should have MIT license');
    assert.ok(content.match(/^## /m), 'Should have at least one ## heading');
    assert.ok(content.includes('Usage'), 'Should have Usage section');
    assert.ok(content.includes('Workflow'), 'Should have Workflow section');
  });

  /* ─── 3a: agent content depth ─── */

  test('generate agent produces valid frontmatter fields', () => {
    dir = tmpDir();
    initProject(dir);
    const result = runArai(['generate', 'agent', 'deep-agent', '--dir', dir]);
    assertExitCode(result, 0);
    const content = readFileSync(join(dir, 'shared', 'agents', 'deep-agent.md'), 'utf8');
    assert.ok(content.includes('description:'), 'Should have description field');
    assert.ok(content.includes('mode: subagent'), 'Should be subagent mode');
    assert.ok(content.includes('edit: deny'), 'Should have edit deny permission');
    assert.ok(content.includes('bash: deny'), 'Should have bash deny permission');
  });

  test('generate agent registers in opencode.json with correct mode', () => {
    dir = tmpDir();
    initProject(dir);
    runArai(['generate', 'agent', 'deep-agent', '--dir', dir]);
    const config = JSON.parse(readFileSync(join(dir, 'opencode.json'), 'utf8'));
    const entry = config.agent?.['deep-agent'];
    assert.ok(entry, 'Agent should be registered');
    assert.equal(entry.mode, 'subagent', 'Agent mode should be subagent');
    assert.ok(entry.model, 'Should have model field');
    assert.ok(entry.permission, 'Should have permission field');
  });

  /* ─── 3a: command content depth ─── */

  test('generate command registers with description and template in opencode.json', () => {
    dir = tmpDir();
    initProject(dir);
    const result = runArai(['generate', 'command', 'deep-cmd', '--dir', dir, '--description', 'Test command']);
    assertExitCode(result, 0);
    assertFile(join(dir, '.opencode', 'commands', 'deep-cmd.md'));
    const config = JSON.parse(readFileSync(join(dir, 'opencode.json'), 'utf8'));
    const entry = config.command?.['deep-cmd'];
    assert.ok(entry, 'Command should be registered');
    assert.ok(entry.description?.length >= 5, `Should have description, got: ${entry.description}`);
    assert.ok(entry.template?.length > 0, 'Should have template field');
  });

  /* ─── 3a: brand content depth ─── */

  test('generate brand produces valid JSON with all required fields', () => {
    dir = tmpDir();
    initProject(dir);
    const result = runArai(['generate', 'brand', '--dir', dir]);
    assertExitCode(result, 0);
    assertFile(join(dir, 'shared', 'brand.json'));
    const brand = JSON.parse(readFileSync(join(dir, 'shared', 'brand.json'), 'utf8'));
    assert.ok(brand.brand, 'Should have brand root key');
    assert.ok(brand.brand.name, 'Should have brand name');
    assert.ok(brand.brand.colors, 'Should have colors');
    assert.ok(brand.brand.colors.primary, 'Should have primary color');
    assert.ok(brand.brand.colors.secondary, 'Should have secondary color');
    assert.ok(brand.brand.colors.accent, 'Should have accent color');
    assert.ok(brand.brand.colors.text, 'Should have text color');
    assert.ok(brand.brand.colors.background, 'Should have background color');
    assert.ok(brand.brand.colors['light-bg'] || brand.brand.colors.light_bg, 'Should have light-bg color');
    assert.ok(brand.brand.logo, 'Should have logo path');
    assert.ok(brand.brand.logo_white, 'Should have logo_white path');
    assert.ok(brand.brand.fonts, 'Should have fonts');
    assert.ok(brand.brand.fonts.heading, 'Should have heading font');
    assert.ok(brand.brand.fonts.body, 'Should have body font');
  });

  test('generate brand --primary overrides primary color', () => {
    dir = tmpDir();
    initProject(dir);
    runArai(['generate', 'brand', '--dir', dir, '--primary', '#ff6600']);
    const brand = JSON.parse(readFileSync(join(dir, 'shared', 'brand.json'), 'utf8'));
    assert.equal(brand.brand.colors.primary, '#ff6600');
  });

  /* ─── 3a: kb structure depth ─── */

  function kbDirPath() {
    return join(dir, 'test-vault');
  }

  function kbVaultPath() {
    // kbInstall(<target>) creates <target>/kb/
    return join(kbDirPath(), 'kb');
  }

  test('generate kb creates expected directory structure', () => {
    dir = tmpDir();
    initProject(dir);
    const result = runArai(['generate', 'kb', kbDirPath()], dir);
    assertExitCode(result, 0);

    const vault = kbVaultPath();

    // Top-level files
    assertFile(join(vault, 'Index.md'));

    // Obsidian config
    assertDir(join(vault, '.obsidian'));
    assertFile(join(vault, '.obsidian', 'app.json'));
    assertFile(join(vault, '.obsidian', 'graph.json'));
    assertFile(join(vault, '.obsidian', 'workspace.json'));

    // Subdirectories
    const expectedDirs = ['Architecture', 'Team', 'Processes', 'Knowledge'];
    for (const sub of expectedDirs) {
      assertDir(join(vault, sub));
      assertFile(join(vault, sub, 'Index.md'));
    }

    // Obsidian configs are valid JSON
    assert.doesNotThrow(() => JSON.parse(readFileSync(join(vault, '.obsidian', 'app.json'), 'utf8')));
    assert.doesNotThrow(() => JSON.parse(readFileSync(join(vault, '.obsidian', 'graph.json'), 'utf8')));
    assert.doesNotThrow(() => JSON.parse(readFileSync(join(vault, '.obsidian', 'workspace.json'), 'utf8')));
  });

  test('generate kb Index.md has wikilinks to subdirectories', () => {
    dir = tmpDir();
    initProject(dir);
    const result = runArai(['generate', 'kb', kbDirPath()], dir);
    assertExitCode(result, 0);
    const indexContent = readFileSync(join(kbVaultPath(), 'Index.md'), 'utf8');
    for (const sub of ['Architecture', 'Team', 'Processes', 'Knowledge']) {
      assert.ok(
        indexContent.includes(`[[${sub}/Index|${sub}]]`) || indexContent.includes(`[[${sub}]]`),
        `Index.md should have wikilink for ${sub}`
      );
    }
  });

  test('generate kb --force overwrites existing vault', () => {
    dir = tmpDir();
    initProject(dir);
    const vpath = kbVaultPath();
    // Create first
    const r1 = runArai(['generate', 'kb', kbDirPath()], dir);
    assertExitCode(r1, 0);
    assertDir(vpath);
    // Should warn without --force
    const r2 = runArai(['generate', 'kb', kbDirPath()], dir);
    assert.ok(
      r2.stdout.includes('already exists'),
      `Expected 'already exists' warning, got: ${r2.stdout}`
    );
    // Should succeed with --force
    const r3 = runArai(['generate', 'kb', kbDirPath(), '--force'], dir);
    assertExitCode(r3, 0);
    assertDir(vpath);
  });
});
