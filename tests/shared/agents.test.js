import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { REPO_ROOT } from '../helpers.js';

const AGENTS_DIR = join(REPO_ROOT, 'shared', 'agents');

const EXPECTED_AGENTS = [
  'content-ingestion',
  'document-generation',
  'email',
  'kb-management',
  'youtube',
  'vault-pdf-export',
];

describe('shared agents', () => {
  for (const name of EXPECTED_AGENTS) {
    it(`${name}.md exists in shared/agents/`, () => {
      assert.ok(existsSync(join(AGENTS_DIR, `${name}.md`)), `${name}.md should exist`);
    });
  }

  it('all agents have valid frontmatter (description, mode, permission)', () => {
    for (const name of EXPECTED_AGENTS) {
      const file = join(AGENTS_DIR, `${name}.md`);
      if (!existsSync(file)) continue;
      const content = readFileSync(file, 'utf8');
      const fmMatch = content.match(/^---\n([\s\S]+?)\n---/);
      assert.ok(fmMatch, `${name}.md should have frontmatter`);
      const fm = fmMatch[1];
      assert.ok(fm.includes('description:'), `${name}.md should have description`);
      assert.ok(fm.includes('mode:'), `${name}.md should have mode`);
      assert.ok(fm.includes('permission:'), `${name}.md should have permission`);
    }
  });

  it('all agents reference their skill', () => {
    for (const name of EXPECTED_AGENTS) {
      const file = join(AGENTS_DIR, `${name}.md`);
      if (!existsSync(file)) continue;
      const content = readFileSync(file, 'utf8').toLowerCase();
      assert.ok(
        content.includes(name.toLowerCase()) || content.includes('skill'),
        `${name}.md should reference its skill`
      );
    }
  });

  it('no duplicate agents in shared/agents/ and .opencode/agents/', () => {
    const sharedDir = join(REPO_ROOT, 'shared', 'agents');
    const opencodeDir = join(REPO_ROOT, '.opencode', 'agents');
    for (const name of EXPECTED_AGENTS) {
      const sharedExists = existsSync(join(sharedDir, `${name}.md`));
      const opencodeExists = existsSync(join(opencodeDir, `${name}.md`));
      if (sharedExists && opencodeExists) {
        const sharedContent = readFileSync(join(sharedDir, `${name}.md`), 'utf8');
        const opencodeContent = readFileSync(join(opencodeDir, `${name}.md`), 'utf8');
        assert.notEqual(sharedContent, opencodeContent, `${name}.md should not be identical in shared/ and .opencode/`);
      }
    }
  });
});
