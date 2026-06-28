import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { REPO_ROOT } from '../helpers.js';

const SKILLS_DIR = join(REPO_ROOT, 'shared', 'skills');

function getSkills() {
  return readdirSync(SKILLS_DIR).filter(f =>
    statSync(join(SKILLS_DIR, f)).isDirectory()
  ).sort();
}

describe('shared/skills/ consistency', () => {
  const skills = getSkills();

  test('has at least one skill', () => {
    assert.ok(skills.length > 0, 'No skills found in shared/skills/');
  });

  for (const name of skills) {
    test(`${name}: frontmatter name matches directory name`, () => {
      const content = readFileSync(join(SKILLS_DIR, name, 'SKILL.md'), 'utf8');
      const frontmatterName = content.match(/^name:\s*(.+)$/m)?.[1];
      assert.ok(frontmatterName, `Skill ${name} has no name: in frontmatter`);
      assert.equal(frontmatterName.trim(), name,
        `Frontmatter name "${frontmatterName}" does not match directory "${name}"`);
    });

    test(`${name}: has description in frontmatter`, () => {
      const content = readFileSync(join(SKILLS_DIR, name, 'SKILL.md'), 'utf8');
      const desc = content.match(/^description:\s*(.+)$/m)?.[1];
      assert.ok(desc, `Skill ${name} has no description in frontmatter`);
      assert.ok(desc.trim().length > 0, `Skill ${name} has empty description`);
    });

    test(`${name}: has license MIT in frontmatter`, () => {
      const content = readFileSync(join(SKILLS_DIR, name, 'SKILL.md'), 'utf8');
      const license = content.match(/^license:\s*(.+)$/m)?.[1];
      assert.equal(license?.trim(), 'MIT', `Skill ${name} license is not MIT`);
    });

    test(`${name}: does not contain inline [[wikilinks]]`, () => {
      const content = readFileSync(join(SKILLS_DIR, name, 'SKILL.md'), 'utf8');
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        let searchFrom = 0;
        while (true) {
          const openIdx = line.indexOf('[[', searchFrom);
          if (openIdx === -1) break;
          const closeIdx = line.indexOf(']]', openIdx);
          if (closeIdx === -1) break;
          // Check if wrapped in backticks: `[[wikilinks]]`
          const preChar = openIdx > 0 ? line[openIdx - 1] : '';
          const postChar = closeIdx + 2 < line.length ? line[closeIdx + 2] : '';
          if (preChar !== '`' && postChar !== '`') {
            assert.ok(false,
              `Line ${i + 1}: inline [[wikilink]] not inside backticks: "${line.trim()}"`);
          }
          searchFrom = closeIdx + 2;
        }
      }
    });
  }
});
