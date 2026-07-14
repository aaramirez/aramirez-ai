import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { REPO_ROOT } from '../helpers.js';

const SKILLS_DIR = join(REPO_ROOT, 'shared', 'skills');

const EXPECTED_SKILLS = ['ci-validate', 'repos-sync'];

describe('shared skills completeness', () => {
  for (const name of EXPECTED_SKILLS) {
    it(`${name}/SKILL.md exists`, () => {
      const file = join(SKILLS_DIR, name, 'SKILL.md');
      assert.ok(existsSync(file), `${name}/SKILL.md should exist`);
    });
  }

  it('ci-validate has valid frontmatter', () => {
    const file = join(SKILLS_DIR, 'ci-validate', 'SKILL.md');
    if (!existsSync(file)) return;
    const content = readFileSync(file, 'utf8');
    const fmMatch = content.match(/^---\n([\s\S]+?)\n---/);
    assert.ok(fmMatch, 'ci-validate should have frontmatter');
    const fm = fmMatch[1];
    assert.ok(fm.includes('name:'), 'should have name');
    assert.ok(fm.includes('description:'), 'should have description');
  });

  it('repos-sync has valid frontmatter', () => {
    const file = join(SKILLS_DIR, 'repos-sync', 'SKILL.md');
    if (!existsSync(file)) return;
    const content = readFileSync(file, 'utf8');
    const fmMatch = content.match(/^---\n([\s\S]+?)\n---/);
    assert.ok(fmMatch, 'repos-sync should have frontmatter');
    const fm = fmMatch[1];
    assert.ok(fm.includes('name:'), 'should have name');
    assert.ok(fm.includes('description:'), 'should have description');
  });

  it('ci-validate references ci-validate.js', () => {
    const file = join(SKILLS_DIR, 'ci-validate', 'SKILL.md');
    if (!existsSync(file)) return;
    const content = readFileSync(file, 'utf8').toLowerCase();
    assert.ok(content.includes('ci-validate.js'), 'should reference ci-validate.js');
  });

  it('repos-sync references repos-sync.js', () => {
    const file = join(SKILLS_DIR, 'repos-sync', 'SKILL.md');
    if (!existsSync(file)) return;
    const content = readFileSync(file, 'utf8').toLowerCase();
    assert.ok(content.includes('repos-sync.js'), 'should reference repos-sync.js');
  });
});
