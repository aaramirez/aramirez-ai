import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join, basename } from 'path';
import { runArai, tmpDir, cleanup, assertFile, assertDir, assertFileContent, assertExitCode, parseFrontmatter, REPO_ROOT } from '../helpers.js';

describe('init output deep validation (Phase 3b + 3c)', () => {
  let dir;
  let projectDir;

  afterEach(() => {
    if (dir) cleanup(dir);
  });

  function runInit(template = 'minimal', description = 'Test project') {
    dir = tmpDir();
    projectDir = join(dir, 'validate-proj');
    const result = runArai(['init', projectDir, '--template', template, '--description', description]);
    assertExitCode(result, 0);
  }

  /* ─── 3b: AGENTS.md partial snapshot ─── */

  test('AGENTS.md has correct project name and description', () => {
    runInit('minimal', '3b description');
    const content = readFileSync(join(projectDir, 'AGENTS.md'), 'utf8');
    assert.ok(content.startsWith('# validate-proj'), 'First line should have project name');
    assert.ok(content.includes('3b description'), 'Should contain description');
  });

  test('AGENTS.md has CLI table with expected commands', () => {
    runInit('minimal');
    const content = readFileSync(join(projectDir, 'AGENTS.md'), 'utf8');
    // Check CLI table contains key commands
    assert.ok(content.includes('arai init'), 'Should mention arai init');
    assert.ok(content.includes('arai install'), 'Should mention arai install');
    assert.ok(content.includes('arai uninstall'), 'Should mention arai uninstall');
    assert.ok(content.includes('arai status'), 'Should mention arai status');
    assert.ok(content.includes('arai generate'), 'Should mention arai generate');
  });

  test('AGENTS.md has expected sections', () => {
    runInit('minimal');
    const content = readFileSync(join(projectDir, 'AGENTS.md'), 'utf8');
    const sections = ['Repository structure', 'Key principles', 'Available agents', 'Available skills', 'CLI quick reference', 'When working'];
    for (const s of sections) {
      assert.ok(content.includes(`## ${s}`), `Should have section: ${s}`);
    }
  });

  test('AGENTS.md available agents table has correct entries', () => {
    runInit('minimal');
    const content = readFileSync(join(projectDir, 'AGENTS.md'), 'utf8');
    assert.ok(content.includes('**build** (default)'), 'Should list build agent');
    assert.ok(content.includes('**plan**'), 'Should list plan agent');
    assert.ok(content.includes('**reviewer**'), 'Should list reviewer agent');
    assert.ok(content.includes('**tester**'), 'Should list tester agent');
    assert.ok(content.includes('**docs**'), 'Should list docs agent');
  });

  /* ─── 3b: Agent .md frontmatter validation (via generate + init) ─── */

  test('generated agent .md has correct YAML frontmatter', () => {
    runInit('full');
    runArai(['generate', 'agent', 'snapshot-agent', '--dir', projectDir, '--description', 'Snapshot test']);
    const fm = parseFrontmatter(join(projectDir, 'shared', 'agents', 'snapshot-agent.md'));
    assert.equal(fm.description, 'Snapshot test');
    assert.equal(fm.mode, 'subagent');
    assert.equal(fm.permission?.edit, 'deny');
    assert.equal(fm.permission?.bash, 'deny');
  });

  test('generated skill .md has correct YAML frontmatter', () => {
    runInit('full');
    runArai(['generate', 'skill', 'snapshot-skill', '--dir', projectDir]);
    const fm = parseFrontmatter(join(projectDir, 'shared', 'skills', 'snapshot-skill', 'SKILL.md'));
    assert.equal(fm.name, 'snapshot-skill');
    assert.equal(fm.license, 'MIT');
    assert.ok(fm.description, 'Should have description');
  });

  /* ─── 3c: Full template deep validation ─── */

  test('full template opencode.json has all 5 source agents', () => {
    runInit('full');
    const config = JSON.parse(readFileSync(join(projectDir, 'platforms', 'opencode', 'opencode.json'), 'utf8'));
    const expectedAgents = ['build', 'plan', 'reviewer', 'tester', 'docs'];
    for (const name of expectedAgents) {
      assert.ok(config.agent?.[name], `Should have agent: ${name}`);
    }
    const agentCount = Object.keys(config.agent || {}).length;
    assert.equal(agentCount, 5, 'Should have exactly 5 agents');
  });

  test('full template opencode.json agent modes are correct', () => {
    runInit('full');
    const config = JSON.parse(readFileSync(join(projectDir, 'platforms', 'opencode', 'opencode.json'), 'utf8'));
    assert.equal(config.agent.build.mode, 'primary');
    assert.equal(config.agent.plan.mode, 'primary');
    assert.equal(config.agent.reviewer.mode, 'subagent');
    assert.equal(config.agent.tester.mode, 'subagent');
    assert.equal(config.agent.docs.mode, 'subagent');
  });

  test('full template opencode.json agent permissions match source', () => {
    runInit('full');
    const config = JSON.parse(readFileSync(join(projectDir, 'platforms', 'opencode', 'opencode.json'), 'utf8'));
    assert.deepEqual(config.agent.plan.permission, { edit: 'deny' });
    assert.deepEqual(config.agent.reviewer.permission, { edit: 'deny' });
    assert.deepEqual(config.agent.tester.permission, { bash: 'allow' });
    assert.deepEqual(config.agent.docs.permission, { edit: 'allow', bash: 'deny' });
  });

  test('full template includes all available skills', () => {
    runInit('full');
    const skillsDir = join(projectDir, 'shared', 'skills');
    const present = readdirSync(skillsDir).filter(f => statSync(join(skillsDir, f)).isDirectory());
    const expected = [
      'agent-creator', 'architecture-creator', 'branding', 'code-review',
      'command-creator', 'config-creator', 'content-ingestion',
      'document-generation', 'flow-creator', 'git', 'harness-creator',
      'instructions-creator', 'kb-management', 'mcp-creator', 'pdf-extraction',
      'permission-creator', 'plugin-creator', 'prompt-creator',
      'reference-creator', 'rule-creator', 'script-creator', 'skill-creator',
      'specialized-agent-creator', 'subagent-creator', 'tool-creator', 'youtube',
    ];
    assert.equal(present.length, expected.length, `Expected ${expected.length} skills, got ${present.length}`);
    for (const name of expected) {
      assert.ok(present.includes(name), `Should have skill: ${name}`);
    }
  });

  test('full template opencode.json has all 3 commands', () => {
    runInit('full');
    const config = JSON.parse(readFileSync(join(projectDir, 'platforms', 'opencode', 'opencode.json'), 'utf8'));
    const expectedCommands = ['test', 'deploy', 'commit'];
    for (const name of expectedCommands) {
      assert.ok(config.command?.[name], `Should have command: ${name}`);
    }
  });

  test('full template has no transform directory', () => {
    runInit('full');
    assert.ok(!existsSync(join(projectDir, 'transforms')), 'Full template should not include transforms');
  });

  test('full template brand.json has correct structure', () => {
    runInit('full');
    const brand = JSON.parse(readFileSync(join(projectDir, 'shared', 'brand.json'), 'utf8'));
    assert.ok(brand.brand.colors, 'Should have colors');
    assert.ok(brand.brand.colors.primary, 'Should have primary color');
    assert.ok(brand.brand.fonts, 'Should have fonts');
    assert.ok(brand.brand.logo, 'Should have logo path');
  });

  test('full template has opencode platform with all subdirectories', () => {
    runInit('full');
    assertDir(join(projectDir, 'platforms', 'opencode'));
    assertDir(join(projectDir, 'platforms', 'opencode', 'agents'));
    assertDir(join(projectDir, 'platforms', 'opencode', 'commands'));
    assertFile(join(projectDir, 'platforms', 'opencode', 'opencode.json'));
  });

  /* ─── 3c: Minimal template specific checks ─── */

  test('minimal template does NOT have full-only skills', () => {
    runInit('minimal');
    const skillsDir = join(projectDir, 'shared', 'skills');
    if (existsSync(skillsDir)) {
      const present = readdirSync(skillsDir).filter(f => statSync(join(skillsDir, f)).isDirectory());
      const fullOnly = ['branding', 'content-ingestion', 'document-generation', 'kb-management', 'pdf-extraction', 'youtube'];
      for (const name of fullOnly) {
        assert.ok(!present.includes(name), `Minimal should NOT include: ${name}`);
      }
    }
  });

  test('minimal template has only git + code-review skills', () => {
    runInit('minimal');
    const skillsDir = join(projectDir, 'shared', 'skills');
    const present = readdirSync(skillsDir).filter(f => statSync(join(skillsDir, f)).isDirectory());
    assert.ok(present.includes('git'), 'Should have git skill');
    assert.ok(present.includes('code-review'), 'Should have code-review skill');
    assert.equal(present.length, 2, 'Minimal should have exactly 2 skills');
  });

  test('minimal template has no brand.json or assets', () => {
    runInit('minimal');
    assert.ok(!existsSync(join(projectDir, 'shared', 'brand.json')), 'Minimal should not have brand.json');
    assert.ok(!existsSync(join(projectDir, 'assets')), 'Minimal should not have assets');
    assert.ok(!existsSync(join(projectDir, 'package.json')), 'Minimal should not have package.json');
  });
});
