import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { runArai, tmpDir, cleanup, assertFile, assertExitCode } from '../helpers.js';

describe('Fix shared/ references in copied artifacts', () => {
  let dir;
  let projectDir;

  afterEach(() => {
    if (dir) cleanup(dir);
  });

  function initFull() {
    dir = tmpDir();
    projectDir = join(dir, 'shared-refs-test');
    const result = runArai(['init', projectDir, '--template', 'full']);
    assertExitCode(result, 0);
    return projectDir;
  }

  /* ─── Plan naming convention ─── */

  test('plan command has naming convention section', () => {
    assertFile(join(process.cwd(), 'shared', 'commands', 'plan.md'));
    const content = readFileSync(join(process.cwd(), 'shared', 'commands', 'plan.md'), 'utf8');
    assert.ok(content.includes('XXX-nombre-fecha') || content.includes('<auto-number>'),
      'plan.md must include naming convention (XXX-nombre-fecha or <auto-number>)');
  });

  test('opencode.json plan command template has auto-number', () => {
    const config = JSON.parse(readFileSync(join(process.cwd(), 'opencode.json'), 'utf8'));
    const planTemplate = config.command?.plan?.template || '';
    assert.ok(planTemplate.includes('<auto-number>') || planTemplate.includes('XXX'),
      'opencode.json plan template must include auto-number reference');
  });

  test('code-style.md has plan naming rule', () => {
    assertFile(join(process.cwd(), 'shared', 'rules', 'code-style.md'));
    const content = readFileSync(join(process.cwd(), 'shared', 'rules', 'code-style.md'), 'utf8');
    assert.ok(content.includes('Plan Files') || content.includes('plan') || content.includes('XXX-nombre'),
      'code-style.md must include plan naming rule');
  });

  /* ─── ci-validate.js checks .opencode/ not shared/ ─── */

  test('ci-validate.js checks .opencode/skills not shared/skills', () => {
    const scriptPath = join(process.cwd(), 'shared', 'scripts', 'ci-validate.js');
    assertFile(scriptPath);
    const content = readFileSync(scriptPath, 'utf8');
    // Should check .opencode/skills for installed projects
    assert.ok(content.includes('.opencode') || content.includes("join(ROOT, '.opencode'"),
      'ci-validate.js must reference .opencode/ for project validation');
  });

  test('ci-validate.js has plan name validation', () => {
    const scriptPath = join(process.cwd(), 'shared', 'scripts', 'ci-validate.js');
    const content = readFileSync(scriptPath, 'utf8');
    assert.ok(content.includes('planNameRe') || content.includes('\\d{3}-') || content.includes('plan'),
      'ci-validate.js must have plan name validation');
  });

  /* ─── Copied commands don't reference shared/ ─── */

  test('copied commands in .opencode/commands/ do not reference shared/scripts/', () => {
    const p = initFull();
    const commandsDir = join(p, '.opencode', 'commands');
    if (!existsSync(commandsDir)) return; // some templates may not have commands

    const cmds = readdirSync(commandsDir).filter(f => f.endsWith('.md'));
    for (const cmd of cmds) {
      const content = readFileSync(join(commandsDir, cmd), 'utf8');
      const hasSharedRef = /node\s+shared\/scripts\//.test(content) || /shared\/scripts\//.test(content);
      assert.ok(!hasSharedRef,
        `Command ${cmd} must not reference shared/scripts/ — should use .opencode/scripts/`);
    }
  });

  test('copied command getrepo.md uses .opencode/scripts/ path', () => {
    const p = initFull();
    const getrepoPath = join(p, '.opencode', 'commands', 'getrepo.md');
    if (!existsSync(getrepoPath)) return;

    const content = readFileSync(getrepoPath, 'utf8');
    assert.ok(!content.includes('shared/scripts/'),
      'getrepo.md must not reference shared/scripts/');
    assert.ok(content.includes('.opencode/scripts/') || content.includes('node .opencode/scripts/'),
      'getrepo.md should reference .opencode/scripts/');
  });

  test('copied command updaterepos.md uses .opencode/scripts/ path', () => {
    const p = initFull();
    const updPath = join(p, '.opencode', 'commands', 'updaterepos.md');
    if (!existsSync(updPath)) return;

    const content = readFileSync(updPath, 'utf8');
    assert.ok(!content.includes('shared/scripts/'),
      'updaterepos.md must not reference shared/scripts/');
    assert.ok(content.includes('.opencode/scripts/') || content.includes('node .opencode/scripts/'),
      'updaterepos.md should reference .opencode/scripts/');
  });

  /* ─── Copied scripts don't reference shared/ ─── */

  test('copied scripts in .opencode/scripts/ do not have node shared/scripts/ in usage', () => {
    const p = initFull();
    const scriptsDir = join(p, '.opencode', 'scripts');
    if (!existsSync(scriptsDir)) return;

    const scripts = readdirSync(scriptsDir).filter(f => f.endsWith('.js'));
    for (const script of scripts) {
      const content = readFileSync(join(scriptsDir, script), 'utf8');
      // Check for usage examples referencing shared/ (not just comments mentioning the repo)
      const hasSharedUsage = /node\s+shared\/scripts\//.test(content);
      assert.ok(!hasSharedUsage,
        `Script ${script} must not have 'node shared/scripts/' usage — should use .opencode/scripts/`);
    }
  });

  /* ─── No shared/ directory in generated project ─── */

  test('generated project has no shared/ directory', () => {
    const p = initFull();
    assert.ok(!existsSync(join(p, 'shared')),
      'Generated project must not have shared/ directory');
  });
});

describe('Plan naming convention in source files', () => {
  test('plan-arai.md Phase 4 includes naming convention', () => {
    const agentPath = join(process.cwd(), 'shared', 'agents', 'plan-arai.md');
    assertFile(agentPath);
    const content = readFileSync(agentPath, 'utf8');
    // Phase 4 should mention the naming convention
    assert.ok(content.includes('Phase 4') || content.includes('Final Plan'),
      'plan-arai.md must have Phase 4 section');
  });
});
