import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { REPO_ROOT } from '../helpers.js';

describe('QA checklist — harness', () => {
  describe('project structure', () => {
    test('AGENTS.md exists', () => {
      assert.ok(existsSync(join(REPO_ROOT, 'AGENTS.md')), 'AGENTS.md must exist');
    });

    test('opencode.json exists', () => {
      assert.ok(existsSync(join(REPO_ROOT, 'opencode.json')), 'opencode.json must exist');
    });

    test('package.json exists', () => {
      assert.ok(existsSync(join(REPO_ROOT, 'package.json')), 'package.json must exist');
    });

    test('.opencode directory exists', () => {
      assert.ok(existsSync(join(REPO_ROOT, '.opencode')), '.opencode directory must exist');
    });

    test('.opencode/agents directory exists', () => {
      assert.ok(existsSync(join(REPO_ROOT, '.opencode', 'agents')), '.opencode/agents must exist');
    });

    test('.opencode/skills directory exists', () => {
      assert.ok(existsSync(join(REPO_ROOT, '.opencode', 'skills')), '.opencode/skills must exist');
    });

    test('.opencode/scripts directory exists', () => {
      assert.ok(existsSync(join(REPO_ROOT, '.opencode', 'scripts')), '.opencode/scripts must exist');
    });
  });

  describe('opencode.json validity', () => {
    const configPath = join(REPO_ROOT, 'opencode.json');
    let config;

    test('opencode.json is valid JSON', () => {
      const raw = readFileSync(configPath, 'utf8');
      config = JSON.parse(raw);
      assert.ok(config, 'config should not be empty');
    });

    test('opencode.json has agent key', () => {
      assert.ok(config.agent, 'config should have agent key');
    });

    test('opencode.json has command key', () => {
      assert.ok(config.command, 'config should have command key');
    });

    test('all agents have required fields', () => {
      for (const [name, agent] of Object.entries(config.agent)) {
        assert.ok(agent.description, `Agent ${name} missing description`);
        assert.ok(agent.mode, `Agent ${name} missing mode`);
      }
    });
  });

  describe('package.json validity', () => {
    const pkg = JSON.parse(readFileSync(join(REPO_ROOT, 'package.json'), 'utf8'));

    test('package.json has name', () => {
      assert.ok(pkg.name, 'package.json must have name');
    });

    test('package.json has test script', () => {
      assert.ok(pkg.scripts?.test, 'package.json must have test script');
    });

    test('package.json has type: module', () => {
      assert.equal(pkg.type, 'module', 'package.json must have type: module');
    });
  });

  describe('every agent .md has frontmatter', () => {
    const agentsDir = join(REPO_ROOT, '.opencode', 'agents');
    if (!existsSync(agentsDir)) return;

    const files = readdirSync(agentsDir).filter(f => f.endsWith('.md'));

    for (const file of files) {
      test(`${file} starts with ---`, () => {
        const content = readFileSync(join(agentsDir, file), 'utf8');
        assert.ok(content.startsWith('---'), `${file} should start with YAML frontmatter`);
        assert.ok(content.includes('---', 3), `${file} should have closing ---`);
      });
    }
  });

  describe('every SKILL.md has frontmatter', () => {
    const skillsDir = join(REPO_ROOT, '.opencode', 'skills');
    if (!existsSync(skillsDir)) return;

    const dirs = readdirSync(skillsDir).filter(d =>
      statSync(join(skillsDir, d)).isDirectory()
    );

    for (const dir of dirs) {
      const skillMd = join(skillsDir, dir, 'SKILL.md');
      if (!existsSync(skillMd)) continue;

      test(`${dir}/SKILL.md has frontmatter`, () => {
        const content = readFileSync(skillMd, 'utf8');
        assert.ok(content.startsWith('---'), `SKILL.md should start with ---`);
        assert.ok(content.includes('---', 3), `SKILL.md should have closing ---`);
      });
    }
  });

  describe('scripts are executable', () => {
    const scriptsDir = join(REPO_ROOT, '.opencode', 'scripts');
    if (!existsSync(scriptsDir)) return;

    const scripts = readdirSync(scriptsDir).filter(f => f.endsWith('.js'));

    for (const script of scripts) {
      test(`scripts/${script} is valid ESM`, () => {
        const content = readFileSync(join(scriptsDir, script), 'utf8');
        assert.ok(content.includes('import ') || content.includes('export '),
          `${script} should use ESM syntax (import/export)`);
      });
    }
  });

  describe('no orphan agent files', () => {
    const config = JSON.parse(readFileSync(join(REPO_ROOT, 'opencode.json'), 'utf8'));
    const agentsDir = join(REPO_ROOT, '.opencode', 'agents');
    if (!existsSync(agentsDir)) return;

    const files = readdirSync(agentsDir).filter(f => f.endsWith('.md'));

    for (const file of files) {
      const name = file.replace(/\.md$/, '');
      test(`agent ${name} has opencode.json entry`, () => {
        assert.ok(config.agent[name], `Agent file ${file} exists but no opencode.json entry`);
      });
    }
  });

  describe('no orphan skill files', () => {
    const skillsDir = join(REPO_ROOT, '.opencode', 'skills');
    if (!existsSync(skillsDir)) return;

    const dirs = readdirSync(skillsDir).filter(d =>
      statSync(join(skillsDir, d)).isDirectory()
    );

    for (const dir of dirs) {
      test(`skill ${dir} has SKILL.md`, () => {
        assert.ok(
          existsSync(join(skillsDir, dir, 'SKILL.md')),
          `Skill directory ${dir} exists but no SKILL.md`
        );
      });
    }
  });
});
