import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpDir, cleanup, runArai, REPO_ROOT } from '../helpers.js';

describe('installSkill() full package', () => {
  it('installs skill + scripts (existing behavior)', () => {
    const project = tmpDir();
    try {
      runArai(['init', project, '--template', 'minimal']);
      const result = runArai(['install', 'skill', 'email', '--project', project]);
      assert.equal(result.exitCode, 0);
      assert.ok(existsSync(join(project, '.opencode', 'skills', 'email', 'SKILL.md')));
      assert.ok(existsSync(join(project, '.opencode', 'scripts', 'send-email.js')));
    } finally {
      cleanup(project);
    }
  });

  it('copies agent when shared/agents/<skill-name>.md exists', () => {
    const project = tmpDir();
    const skillName = 'test-pkg-skill';
    const agentFile = join(REPO_ROOT, 'shared', 'agents', `${skillName}.md`);
    const skillDir = join(REPO_ROOT, 'shared', 'skills', skillName);
    try {
      mkdirSync(skillDir, { recursive: true });
      writeFileSync(join(skillDir, 'SKILL.md'), `---\nname: ${skillName}\ndescription: Test skill\nlicense: MIT\n---\n\n# Test\n`);
      writeFileSync(agentFile, '---\ndescription: Test agent\nmode: subagent\npermission:\n  edit: deny\n---\n\nTest agent.\n');

      runArai(['init', project, '--template', 'minimal']);
      const result = runArai(['install', 'skill', skillName, '--project', project]);
      assert.equal(result.exitCode, 0);

      const agentDst = join(project, '.opencode', 'agents', `${skillName}.md`);
      assert.ok(existsSync(agentDst), 'agent file should be copied');
    } finally {
      if (existsSync(agentFile)) rmSync(agentFile);
      if (existsSync(skillDir)) rmSync(skillDir, { recursive: true });
      cleanup(project);
    }
  });

  it('registers agent in opencode.json', () => {
    const project = tmpDir();
    const skillName = 'test-reg-skill';
    const agentFile = join(REPO_ROOT, 'shared', 'agents', `${skillName}.md`);
    const skillDir = join(REPO_ROOT, 'shared', 'skills', skillName);
    try {
      mkdirSync(skillDir, { recursive: true });
      writeFileSync(join(skillDir, 'SKILL.md'), `---\nname: ${skillName}\ndescription: Test skill\nlicense: MIT\n---\n\n# Test\n`);
      writeFileSync(agentFile, '---\ndescription: Test agent\nmode: subagent\npermission:\n  edit: deny\n---\n\nTest agent.\n');

      runArai(['init', project, '--template', 'minimal']);
      runArai(['install', 'skill', skillName, '--project', project]);

      const config = JSON.parse(readFileSync(join(project, 'opencode.json'), 'utf8'));
      assert.ok(config.agent?.[skillName], 'agent should be registered in opencode.json');
    } finally {
      if (existsSync(agentFile)) rmSync(agentFile);
      if (existsSync(skillDir)) rmSync(skillDir, { recursive: true });
      cleanup(project);
    }
  });

  it('copies command when shared/commands/<skill-name>.md exists', () => {
    const project = tmpDir();
    const skillName = 'test-cmd-skill';
    const commandFile = join(REPO_ROOT, 'shared', 'commands', `${skillName}.md`);
    const skillDir = join(REPO_ROOT, 'shared', 'skills', skillName);
    try {
      mkdirSync(skillDir, { recursive: true });
      writeFileSync(join(skillDir, 'SKILL.md'), `---\nname: ${skillName}\ndescription: Test skill\nlicense: MIT\n---\n\n# Test\n`);
      writeFileSync(commandFile, '---\ndescription: Test command\n---\n\nRun test.\n');

      runArai(['init', project, '--template', 'minimal']);
      const result = runArai(['install', 'skill', skillName, '--project', project]);
      assert.equal(result.exitCode, 0);

      const commandDst = join(project, '.opencode', 'commands', `${skillName}.md`);
      assert.ok(existsSync(commandDst), 'command file should be copied');
    } finally {
      if (existsSync(commandFile)) rmSync(commandFile);
      if (existsSync(skillDir)) rmSync(skillDir, { recursive: true });
      cleanup(project);
    }
  });

  it('does not fail if no agent or command exists', () => {
    const project = tmpDir();
    try {
      runArai(['init', project, '--template', 'minimal']);
      const result = runArai(['install', 'skill', 'git', '--project', project]);
      assert.equal(result.exitCode, 0);
      assert.ok(existsSync(join(project, '.opencode', 'skills', 'git', 'SKILL.md')));
    } finally {
      cleanup(project);
    }
  });
});
