import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { REPO_ROOT } from '../helpers.js';

const SHARED_DIR = join(REPO_ROOT, 'shared');

describe('shared artifacts consistency', () => {
  it('every skill in shared/skills/ with scripts/ has scripts: in frontmatter', () => {
    const skillsDir = join(SHARED_DIR, 'skills');
    const skills = readdirSync(skillsDir).filter(f => existsSync(join(skillsDir, f, 'SKILL.md')));
    for (const skill of skills) {
      const content = readFileSync(join(skillsDir, skill, 'SKILL.md'), 'utf8');
      const hasScriptsDir = existsSync(join(skillsDir, skill, 'scripts'));
      if (hasScriptsDir) {
        assert.ok(content.includes('scripts:'), `${skill}/SKILL.md should have scripts: in frontmatter`);
      }
    }
  });

  it('every agent in shared/agents/ has valid frontmatter', () => {
    const agentsDir = join(SHARED_DIR, 'agents');
    if (!existsSync(agentsDir)) return;
    const agents = readdirSync(agentsDir).filter(f => f.endsWith('.md'));
    for (const agent of agents) {
      const content = readFileSync(join(agentsDir, agent), 'utf8');
      assert.ok(content.includes('description:'), `${agent} should have description:`);
      assert.ok(content.includes('mode:'), `${agent} should have mode:`);
      assert.ok(content.includes('model:'), `${agent} should have model:`);
      assert.ok(content.includes('permission:'), `${agent} should have permission:`);
    }
  });

  it('every command in shared/commands/ has valid frontmatter', () => {
    const commandsDir = join(SHARED_DIR, 'commands');
    if (!existsSync(commandsDir)) return;
    const commands = readdirSync(commandsDir).filter(f => f.endsWith('.md'));
    for (const cmd of commands) {
      const content = readFileSync(join(commandsDir, cmd), 'utf8');
      assert.ok(content.includes('description:'), `${cmd} should have description:`);
    }
  });

  it('no agent in shared/agents/ duplicates one in .opencode/agents/', () => {
    const sharedAgentsDir = join(SHARED_DIR, 'agents');
    const localAgentsDir = join(REPO_ROOT, '.opencode', 'agents');
    if (!existsSync(sharedAgentsDir) || !existsSync(localAgentsDir)) return;
    const sharedAgents = readdirSync(sharedAgentsDir).filter(f => f.endsWith('.md'));
    const localAgents = readdirSync(localAgentsDir).filter(f => f.endsWith('.md'));
    const expectedShared = ['docs.md', 'plan-arai.md', 'reviewer.md', 'tester.md'];
    for (const agent of sharedAgents) {
      if (expectedShared.includes(agent)) continue;
      assert.ok(!localAgents.includes(agent), `${agent} should not be in both shared/agents/ and .opencode/agents/`);
    }
  });

  it('every distributable package has all 4 layers', () => {
    const packages = [
      'content-ingestion', 'document-generation', 'email',
      'kb-management', 'youtube', 'vault-pdf-export',
      'branding', 'pdf-extraction'
    ];
    for (const pkg of packages) {
      assert.ok(existsSync(join(SHARED_DIR, 'skills', pkg, 'SKILL.md')), `${pkg} missing SKILL.md`);
      assert.ok(existsSync(join(SHARED_DIR, 'agents', `${pkg}.md`)), `${pkg} missing agent .md`);
    }
  });
});
