import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { REPO_ROOT } from '../helpers.js';

const SHARED = join(REPO_ROOT, 'shared');

describe('shared cross-reference integrity', () => {
  const skillsDir = join(SHARED, 'skills');
  const agentsDir = join(SHARED, 'agents');
  const commandsDir = join(SHARED, 'commands');

  const skillDirs = existsSync(skillsDir)
    ? readdirSync(skillsDir).filter(d =>
        existsSync(join(skillsDir, d, 'SKILL.md'))
      )
    : [];

  const agentFiles = existsSync(agentsDir)
    ? readdirSync(agentsDir).filter(f => f.endsWith('.md'))
    : [];

  const commandFiles = existsSync(commandsDir)
    ? readdirSync(commandsDir).filter(f => f.endsWith('.md'))
    : [];

  const agentNames = agentFiles.map(f => f.replace(/\.md$/, ''));
  const commandNames = commandFiles.map(f => f.replace(/\.md$/, ''));

  describe('full packages have all 4 layers', () => {
    const fullPackages = [
      { skill: 'content-ingestion', agent: 'content-ingestion', command: 'ingest' },
      { skill: 'document-generation', agent: 'document-generation', command: 'generate' },
      { skill: 'email', agent: 'email', command: 'send-email' },
      { skill: 'kb-management', agent: 'kb-management', command: 'kb' },
      { skill: 'youtube', agent: 'youtube', command: 'youtube-cmd' },
      { skill: 'vault-pdf-export', agent: 'vault-pdf-export', command: 'export-pdf' },
    ];

    for (const pkg of fullPackages) {
      test(`${pkg.skill} has SKILL.md`, () => {
        assert.ok(existsSync(join(skillsDir, pkg.skill, 'SKILL.md')),
          `${pkg.skill}/SKILL.md missing`);
      });

      test(`${pkg.skill} has agent .md`, () => {
        assert.ok(existsSync(join(agentsDir, `${pkg.agent}.md`)),
          `${pkg.agent}.md missing`);
      });

      test(`${pkg.skill} has command .md`, () => {
        assert.ok(existsSync(join(commandsDir, `${pkg.command}.md`)),
          `${pkg.command}.md missing`);
      });
    }
  });

  describe('utility packages have skill + agent', () => {
    const utilityPackages = ['branding', 'pdf-extraction'];

    for (const pkg of utilityPackages) {
      test(`${pkg} has SKILL.md`, () => {
        assert.ok(existsSync(join(skillsDir, pkg, 'SKILL.md')),
          `${pkg}/SKILL.md missing`);
      });

      test(`${pkg} has agent .md`, () => {
        assert.ok(existsSync(join(agentsDir, `${pkg}.md`)),
          `${pkg}.md missing`);
      });
    }
  });

  describe('standalone skills have SKILL.md', () => {
    const standaloneSkills = ['ci-validate', 'code-review', 'git', 'google-workspace', 'm365', 'repos-sync'];

    for (const skill of standaloneSkills) {
      test(`${skill} has SKILL.md`, () => {
        assert.ok(existsSync(join(skillsDir, skill, 'SKILL.md')),
          `${skill}/SKILL.md missing`);
      });
    }
  });

  describe('agent names match skill names', () => {
    const builtInAgents = ['docs', 'build', 'plan', 'plan-arai', 'reviewer', 'tester', 'new-harness'];
    const creatorAgents = skillDirs.filter(s => s.endsWith('-creator'));

    for (const agentName of agentNames) {
      if (builtInAgents.includes(agentName) || creatorAgents.includes(agentName)) continue;

      test(`agent "${agentName}" has matching skill`, () => {
        assert.ok(
          skillDirs.includes(agentName),
          `Agent ${agentName} has no matching skill directory`
        );
      });
    }
  });

  describe('skill scripts references resolve', () => {
    for (const skill of skillDirs) {
      const skillMd = join(skillsDir, skill, 'SKILL.md');
      const content = readFileSync(skillMd, 'utf8');

      const scriptRefs = [...content.matchAll(/\.opencode\/skills\/([a-z0-9-]+)\/scripts\/([a-z0-9-]+\.js)/g)]
        .map(m => ({
          refSkill: m[1],
          script: m[2],
        }));

      for (const ref of scriptRefs) {
        test(`${skill}/SKILL.md references script ${ref.script} exists in shared`, () => {
          const sharedPath = join(skillsDir, ref.refSkill, 'scripts', ref.script);
          assert.ok(existsSync(sharedPath),
            `Script not found in shared: ${ref.refSkill}/scripts/${ref.script}`);
        });
      }
    }
  });

  describe('command template references are valid', () => {
    for (const cmd of commandNames) {
      const cmdMd = join(commandsDir, `${cmd}.md`);
      const content = readFileSync(cmdMd, 'utf8');

      const scriptRefs = [...content.matchAll(/\.opencode\/scripts\/([a-z0-9-]+\.js)/g)]
        .map(m => `.opencode/scripts/${m[1]}`);

      for (const ref of scriptRefs) {
        test(`command "${cmd}" references existing script: ${ref}`, () => {
          const fullPath = join(REPO_ROOT, ref);
          assert.ok(existsSync(fullPath), `Script not found: ${ref}`);
        });
      }
    }
  });
});
