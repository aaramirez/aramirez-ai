import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { runArai, tmpDir, cleanup, assertFile, assertDir, assertNoFile, assertExitCode, assertFileContent, REPO_ROOT } from '../helpers.js';

describe('full lifecycle', () => {
  let dir;

  afterEach(() => {
    if (dir) cleanup(dir);
  });

  test('minimal lifecycle: init → install → add → uninstall', () => {
    dir = tmpDir();

    // 1. arai init minimal
    const initResult = runArai(['init', dir, '--template', 'minimal', '--description', 'Lifecycle test']);
    assertExitCode(initResult, 0);
    assertDir(join(dir, '.opencode', 'skills', 'git'));
    assertFile(join(dir, '.opencode', 'skills', 'code-review', 'SKILL.md'));
    assertFile(join(dir, 'shared', 'prompts', 'commit-message.md'));
    assertFile(join(dir, 'shared', 'rules', 'code-style.md'));
    assertFile(join(dir, 'opencode.json'));
    assert.ok(!existsSync(join(dir, '.opencode', 'agents')),
      'Minimal template should not have agents (agents: [])');
    assertFile(join(dir, 'AGENTS.md'));

    // 2. Verify AGENTS.md describes the project
    const agentsContent = readFileSync(join(dir, 'AGENTS.md'), 'utf8');
    assert.ok(agentsContent.includes('Lifecycle test'), 'Description should be in AGENTS.md');

    // 3. arai install (no-op since opencode already installed from init)
    const installResult = runArai(['install', '--project', dir]);
    assertExitCode(installResult, 0);

    // 4. arai install agent docs (add individual agent)
    const agentResult = runArai(['install', 'agent', 'docs', '--project', dir]);
    assertExitCode(agentResult, 0);
    assertDir(join(dir, '.opencode', 'agents'));
    assertFile(join(dir, '.opencode', 'agents', 'docs.md'));
    assertFile(join(dir, 'opencode.json'));

    // 5. Verify opencode.json has agents (build, plan, etc.)
    const config = JSON.parse(readFileSync(join(dir, 'opencode.json'), 'utf8'));
    assert.ok(config.agent?.build, 'Should have build agent');
    assert.ok(config.agent?.plan, 'Should have plan agent');

    // 5. arai status shows installed
    const statusResult = runArai(['status'], dir);
    assertExitCode(statusResult, 0);
    assert.ok(statusResult.stdout.includes('installed'), 'Status should show installed');

    // 6. arai install skill git
    const skillResult = runArai(['install', 'skill', 'git', '--project', dir]);
    assertExitCode(skillResult, 0);
    assertFile(join(dir, '.opencode', 'skills', 'git', 'SKILL.md'));

    // 7. arai install agent reviewer
    const reviewerResult = runArai(['install', 'agent', 'reviewer', '--project', dir]);
    assertExitCode(reviewerResult, 0);
    assertFile(join(dir, '.opencode', 'agents', 'reviewer.md'));

    // 8. Verify reviewer in opencode.json
    const config2 = JSON.parse(readFileSync(join(dir, 'opencode.json'), 'utf8'));
    assert.ok(config2.agent?.reviewer, 'reviewer should be in opencode.json');

    // 9. arai install prompt commit-message
    const promptResult = runArai(['install', 'prompt', 'commit-message', '--project', dir]);
    assertExitCode(promptResult, 0);
    assertFile(join(dir, 'shared', 'prompts', 'commit-message.md'));

    // 10. arai install rule code-style
    const ruleResult = runArai(['install', 'rule', 'code-style', '--project', dir]);
    assertExitCode(ruleResult, 0);
    assertFile(join(dir, 'shared', 'rules', 'code-style.md'));

    // 11. arai install script ci-validate
    const scriptResult = runArai(['install', 'script', 'ci-validate', '--project', dir]);
    assertExitCode(scriptResult, 0);
    assertFile(join(dir, 'shared', 'scripts', 'ci-validate.js'));

    // 12. arai uninstall skill git
    const unskillResult = runArai(['uninstall', 'skill', 'git', '--project', dir]);
    assertExitCode(unskillResult, 0);
    assert.ok(!existsSync(join(dir, '.opencode', 'skills', 'git')), 'Git skill should be removed');

    // 13. arai uninstall agent reviewer
    const unagentResult = runArai(['uninstall', 'agent', 'reviewer', '--project', dir]);
    assertExitCode(unagentResult, 0);
    assert.ok(!existsSync(join(dir, '.opencode', 'agents', 'reviewer.md')), 'Reviewer agent should be removed');

    // 14. Verify reviewer removed from opencode.json
    const config3 = JSON.parse(readFileSync(join(dir, 'opencode.json'), 'utf8'));
    assert.ok(!config3.agent?.reviewer, 'reviewer should not be in opencode.json');

    // 15. arai uninstall prompt
    runArai(['uninstall', 'prompt', 'commit-message', '--project', dir]);
    assert.ok(!existsSync(join(dir, 'shared', 'prompts', 'commit-message.md')));

    // 16. arai uninstall rule
    runArai(['uninstall', 'rule', 'code-style', '--project', dir]);
    assert.ok(!existsSync(join(dir, 'shared', 'rules', 'code-style.md')));

    // 17. arai uninstall script
    runArai(['uninstall', 'script', 'ci-validate', '--project', dir]);
    assert.ok(!existsSync(join(dir, 'shared', 'scripts', 'ci-validate.js')));

    // 18. arai uninstall (bare) — remove opencode platform
    const uninstallResult = runArai(['uninstall', '--project', dir]);
    assertExitCode(uninstallResult, 0);
    assert.ok(!existsSync(join(dir, '.opencode')), '.opencode should be removed');
    assert.ok(!existsSync(join(dir, 'opencode.json')), 'opencode.json should be removed');
  });

  test('full template lifecycle: init → verify structure', () => {
    dir = tmpDir();

    const initResult = runArai(['init', dir, '--template', 'full', '--description', 'Full lifecycle']);
    assertExitCode(initResult, 0);

    // All skills copied
    const skillsDir = join(dir, '.opencode', 'skills');
    const skillDirs = readdirSync(skillsDir).filter(f => statSync(join(skillsDir, f)).isDirectory());
    assert.ok(skillDirs.length >= 8, `Expected at least 8 skills, got ${skillDirs.length}`);

    // All scripts copied
    const scriptsDir = join(dir, 'shared', 'scripts');
    const scriptFiles = readdirSync(scriptsDir).filter(f => f.endsWith('.js'));
    assert.ok(scriptFiles.length > 0, 'Should have scripts');

    // Package.json
    assertFile(join(dir, 'package.json'));

    // Branding
    assertFile(join(dir, 'shared', 'brand.json'));

    // Assets
    assertFile(join(dir, 'assets', 'images', 'logo.svg'));
    assertFile(join(dir, 'assets', 'images', 'logo-white.svg'));

    // OpenCode platform
    assertFile(join(dir, 'opencode.json'));

    // Verify opencode.json has no skills.paths (native discovery)
    const config = JSON.parse(readFileSync(join(dir, 'opencode.json'), 'utf8'));
    assert.ok(!config.skills?.paths, 'Should not have skills.paths (native discovery)');
  });
});
