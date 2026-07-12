import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { REPO_ROOT } from '../helpers.js';

const SKILLS_DIR = join(REPO_ROOT, 'shared', 'skills');

const EXPECTED_SCRIPTS = {
  branding: 'create-brand.js',
  'content-ingestion': 'ingest-content.js',
  'kb-management': 'kb-sync.js',
  'pdf-extraction': 'extract-pdf.js',
};

describe('skill frontmatter scripts declarations', () => {
  for (const [skill, script] of Object.entries(EXPECTED_SCRIPTS)) {
    it(`${skill} SKILL.md has scripts: [${script}]`, () => {
      const file = join(SKILLS_DIR, skill, 'SKILL.md');
      assert.ok(existsSync(file), `${skill}/SKILL.md should exist`);
      const content = readFileSync(file, 'utf8');
      assert.ok(content.includes('scripts:'), `${skill} should have scripts: in frontmatter`);
      assert.ok(content.includes(script), `${skill} should reference ${script}`);
    });
  }
});
