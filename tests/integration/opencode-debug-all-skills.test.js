import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { REPO_ROOT, runOpencode } from '../helpers.js';

if (!process.env.TEST_OPENCODE) {
  console.log('TEST_OPENCODE not set — skipping (opencode integration tests are slow)');
  process.exit(0);
}

const SKILLS_DIR = join(REPO_ROOT, '.opencode', 'skills');

const skillDirs = existsSync(SKILLS_DIR)
  ? readdirSync(SKILLS_DIR).filter(d =>
      statSync(join(SKILLS_DIR, d)).isDirectory() &&
      existsSync(join(SKILLS_DIR, d, 'SKILL.md'))
    )
  : [];

if (skillDirs.length === 0) {
  console.log('No skills found — skipping');
  process.exit(0);
}

describe('opencode debug skill — all skills', { timeout: 30000 }, () => {
  let allSkills;

  test('debug skill returns valid list', { timeout: 15000 }, () => {
    const result = runOpencode(['debug', 'skill']);
    assert.equal(result.exitCode, 0, `opencode debug skill failed:\n${result.stderr}`);

    try {
      allSkills = JSON.parse(result.stdout);
    } catch {
      assert.fail(`Output is not valid JSON:\n${result.stdout.slice(0, 500)}`);
    }

    assert.ok(Array.isArray(allSkills), 'should return an array');
  });

  for (const dir of skillDirs) {
    test(`skill "${dir}" is loaded by opencode`, () => {
      const found = allSkills.find(s => s.name === dir);
      assert.ok(found, `skill "${dir}" not found in opencode debug skill output`);
      assert.ok(found.description, 'skill should have description');
      assert.ok(found.location, 'skill should have location');
    });
  }
});
