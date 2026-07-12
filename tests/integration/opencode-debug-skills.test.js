import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'child_process';

const CREATOR_SKILLS = [
  'agent-creator',
  'architecture-creator',
  'command-creator',
  'config-creator',
  'flow-creator',
  'harness-generator',
  'instructions-creator',
  'mcp-creator',
  'permission-creator',
  'plugin-creator',
  'prompt-creator',
  'reference-creator',
  'rule-creator',
  'script-creator',
  'skill-creator',
  'tool-creator',
];

function debugSkills() {
  const result = spawnSync('opencode', ['debug', 'skill'], {
    encoding: 'utf8',
    stdio: 'pipe',
    timeout: 30000,
  });
  return {
    stdout: (result.stdout || '').trim(),
    stderr: (result.stderr || '').trim(),
    exitCode: result.status ?? 1,
  };
}

describe('opencode debug skill validation', { timeout: 60000 }, () => {
  let skills;

  test('opencode debug skill loads successfully', () => {
    const result = debugSkills();
    assert.equal(result.exitCode, 0, `opencode debug skill failed:\n${result.stderr || result.stdout}`);
    skills = JSON.parse(result.stdout);
    assert.ok(Array.isArray(skills), 'output is an array');
  });

  test('all 16 creator skills are discovered', () => {
    if (!skills) {
      const result = debugSkills();
      skills = JSON.parse(result.stdout);
    }
    const names = skills.map(s => s.name);
    for (const name of CREATOR_SKILLS) {
      assert.ok(names.includes(name), `Missing creator skill: ${name}`);
    }
  });

  for (const name of CREATOR_SKILLS) {
    test(`${name}: has non-empty content`, () => {
      if (!skills) {
        const result = debugSkills();
        skills = JSON.parse(result.stdout);
      }
      const skill = skills.find(s => s.name === name);
      assert.ok(skill, `Skill ${name} not found`);
      assert.ok(skill.content && skill.content.length > 0, `${name} has non-empty content`);
      assert.ok(skill.location && skill.location.length > 0, `${name} has a location`);
    });
  }
});
