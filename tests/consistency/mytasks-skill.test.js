import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { REPO_ROOT, parseFrontmatter, validateSchema } from '../helpers.js';

const SKILL_PATH = join(REPO_ROOT, '.opencode', 'skills', 'mytasks', 'SKILL.md');
const COMMANDS_DIR = join(REPO_ROOT, '.opencode', 'commands');
const AGENTS_PATH = join(REPO_ROOT, 'AGENTS.md');

const COMMANDS = ['mytasks-list', 'mytasks-create', 'mytasks-update', 'mytasks-followup', 'mytasks-note'];

const SKILL_SCHEMA = {
  required: ['name', 'description', 'license'],
  properties: {
    name: { pattern: '^[a-z][a-z0-9-]*$', maxLength: 64 },
    description: { type: 'string', minLength: 10, maxLength: 200 },
    license: { type: 'string' },
  },
};

describe('mytasks skill consistency', () => {
  test('SKILL.md exists with valid frontmatter', () => {
    assert.ok(existsSync(SKILL_PATH), `SKILL.md not found: ${SKILL_PATH}`);
    const fm = parseFrontmatter(SKILL_PATH);
    const result = validateSchema(fm, SKILL_SCHEMA, 'mytasks');
    assert.ok(result.valid, `Schema errors:\n${result.errors.join('\n')}`);
    assert.equal(fm.name, 'mytasks');
  });

  test('SKILL.md references the wrapper script', () => {
    const content = readFileSync(SKILL_PATH, 'utf8');
    assert.ok(content.includes('.opencode/scripts/mytasks.js'),
      'SKILL.md should reference .opencode/scripts/mytasks.js');
  });

  for (const name of COMMANDS) {
    test(`command ${name}.md exists with description`, () => {
      const cmdPath = join(COMMANDS_DIR, `${name}.md`);
      assert.ok(existsSync(cmdPath), `Command not found: ${cmdPath}`);
      const content = readFileSync(cmdPath, 'utf8');
      const fm = parseFrontmatter(cmdPath);
      assert.ok(fm.description && fm.description.length > 0, 'Missing description frontmatter');
      assert.ok(content.includes('$ARGUMENTS'), 'Command body should use $ARGUMENTS');
      assert.ok(content.includes('.opencode/scripts/mytasks.js'),
        'Command should reference the wrapper script');
    });
  }
});

describe('AGENTS.md documentation', () => {
  test('documents the mytasks skill', () => {
    const content = readFileSync(AGENTS_PATH, 'utf8');
    assert.ok(content.includes('mytasks'), 'AGENTS.md should mention the mytasks skill');
    assert.ok(content.includes('.opencode/scripts/mytasks.js'),
      'AGENTS.md should list the mytasks.js script');
  });

  test('documents the mytasks commands', () => {
    const content = readFileSync(AGENTS_PATH, 'utf8');
    for (const name of COMMANDS) {
      assert.ok(content.includes(name), `AGENTS.md should mention /${name}`);
    }
  });
});
