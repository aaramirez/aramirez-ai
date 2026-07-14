import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { REPO_ROOT } from '../helpers.js';

describe('reference integrity', () => {
  describe('AGENTS.md script references', () => {
    const agentsMd = readFileSync(join(REPO_ROOT, 'AGENTS.md'), 'utf8');

    const scriptRefs = [...agentsMd.matchAll(/\| (\S+\.js) \|/g)]
      .map(m => m[1])
      .filter(p => p.startsWith('.opencode/'));

    test('AGENTS.md has script references', () => {
      assert.ok(scriptRefs.length > 0, 'Should find at least one script reference in AGENTS.md');
    });

    for (const ref of scriptRefs) {
      test(`referenced script exists: ${ref}`, () => {
        const fullPath = join(REPO_ROOT, ref);
        assert.ok(existsSync(fullPath), `Script referenced in AGENTS.md not found: ${ref}`);
      });
    }
  });

  describe('opencode.json agent path references', () => {
    const config = JSON.parse(readFileSync(join(REPO_ROOT, 'opencode.json'), 'utf8'));

    for (const [name, agent] of Object.entries(config.agent || {})) {
      if (!agent.path) continue;

      test(`agent "${name}" path exists: ${agent.path}`, () => {
        const fullPath = join(REPO_ROOT, agent.path);
        assert.ok(existsSync(fullPath), `Agent .md file not found: ${agent.path}`);
      });
    }
  });

  describe('every skill has SKILL.md', () => {
    const skillsDir = join(REPO_ROOT, '.opencode', 'skills');
    if (!existsSync(skillsDir)) return;

    const skillDirs = readdirSync(skillsDir).filter(d =>
      statSync(join(skillsDir, d)).isDirectory()
    );

    for (const dir of skillDirs) {
      test(`skill "${dir}" has SKILL.md`, () => {
        const skillMd = join(skillsDir, dir, 'SKILL.md');
        assert.ok(existsSync(skillMd), `SKILL.md not found for skill: ${dir}`);
      });
    }
  });

  describe('agent .md files have corresponding opencode.json entry', () => {
    const agentsDir = join(REPO_ROOT, '.opencode', 'agents');
    if (!existsSync(agentsDir)) return;

    const config = JSON.parse(readFileSync(join(REPO_ROOT, 'opencode.json'), 'utf8'));
    const agentFiles = readdirSync(agentsDir).filter(f => f.endsWith('.md'));

    for (const file of agentFiles) {
      const name = file.replace(/\.md$/, '');
      test(`agent "${name}" is registered in opencode.json`, () => {
        assert.ok(
          config.agent && config.agent[name],
          `Agent file ${file} exists but no entry in opencode.json`
        );
      });
    }
  });

  describe('scripts referenced in SKILL.md bodies exist', () => {
    const skillsDir = join(REPO_ROOT, '.opencode', 'skills');
    if (!existsSync(skillsDir)) return;

    const skillDirs = readdirSync(skillsDir).filter(d =>
      statSync(join(skillsDir, d)).isDirectory() &&
      existsSync(join(skillsDir, d, 'SKILL.md'))
    );

    for (const dir of skillDirs) {
      const skillMd = readFileSync(join(skillsDir, dir, 'SKILL.md'), 'utf8');
      const scriptRefs = [...skillMd.matchAll(/\.opencode\/skills\/([a-z0-9-]+)\/scripts\/([a-z0-9-]+\.js)/g)]
        .map(m => `.opencode/skills/${m[1]}/scripts/${m[2]}`)
        .filter((v, i, a) => a.indexOf(v) === i);

      for (const ref of scriptRefs) {
        test(`${dir}/SKILL.md references existing script: ${ref}`, () => {
          const fullPath = join(REPO_ROOT, ref);
          assert.ok(existsSync(fullPath), `Script referenced in SKILL.md not found: ${ref}`);
        });
      }
    }
  });
});
