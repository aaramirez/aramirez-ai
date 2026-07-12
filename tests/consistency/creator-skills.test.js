import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { REPO_ROOT } from '../helpers.js';

const SKILLS_DIR = join(REPO_ROOT, '.opencode', 'skills');

const CREATOR_SKILLS = [
  'config-creator',
  'permission-creator',
  'instructions-creator',
  'agent-creator',
  'architecture-creator',
  'flow-creator',
  'skill-creator',
  'mcp-creator',
  'command-creator',
  'script-creator',
  'prompt-creator',
  'rule-creator',
  'reference-creator',
  'plugin-creator',
  'tool-creator',
];

describe('creator skills consistency', () => {
  test('all 15 creator skills are present', () => {
    const skills = readdirSync(SKILLS_DIR).filter(f =>
      statSync(join(SKILLS_DIR, f)).isDirectory()
    );
    for (const name of CREATOR_SKILLS) {
      assert.ok(skills.includes(name), `Missing creator skill: ${name}`);
    }
  });

  for (const name of CREATOR_SKILLS) {
    test(`${name}: SKILL.md exists with valid frontmatter`, () => {
      const skillPath = join(SKILLS_DIR, name, 'SKILL.md');
      assert.ok(statSync(skillPath).isFile(), `SKILL.md not found for ${name}`);

      const content = readFileSync(skillPath, 'utf8');
      const frontmatterName = content.match(/^name:\s*(.+)$/m)?.[1];
      assert.equal(frontmatterName?.trim(), name,
        `Frontmatter name mismatch for ${name}`);

      const desc = content.match(/^description:\s*(.+)$/m)?.[1];
      assert.ok(desc?.trim().length > 0, `Missing description for ${name}`);

      const license = content.match(/^license:\s*(.+)$/m)?.[1];
      assert.equal(license?.trim(), 'MIT', `License must be MIT for ${name}`);
    });

    test(`${name}: references companion script in .opencode/scripts/`, () => {
      const content = readFileSync(join(SKILLS_DIR, name, 'SKILL.md'), 'utf8');
      assert.ok(content.includes('.opencode/scripts/'),
        `SKILL.md should reference a script in .opencode/scripts/`);
    });
  }
});
