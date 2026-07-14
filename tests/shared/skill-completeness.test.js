import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { REPO_ROOT } from '../helpers.js';

const SKILLS_DIR = join(REPO_ROOT, 'shared', 'skills');

const ALL_SKILLS = [
  'branding', 'ci-validate', 'code-review', 'content-ingestion',
  'document-generation', 'email', 'git', 'google-workspace',
  'kb-management', 'm365', 'pdf-extraction', 'repos-sync',
  'vault-pdf-export', 'youtube',
];

const SKILLS_WITH_SCRIPTS = {
  'branding': ['create-brand.js'],
  'content-ingestion': ['ingest-content.js'],
  'document-generation': ['docgen/'],
  'email': ['send-email.js', 'mcp-email.js'],
  'kb-management': ['kb-sync.js'],
  'pdf-extraction': ['extract-pdf.js'],
  'vault-pdf-export': ['docgen-vault.js'],
  'youtube': ['youtube-transcript.js'],
};

describe('shared skills completeness', () => {
  for (const name of ALL_SKILLS) {
    it(`${name}/SKILL.md exists`, () => {
      const file = join(SKILLS_DIR, name, 'SKILL.md');
      assert.ok(existsSync(file), `${name}/SKILL.md should exist`);
    });

    it(`${name}/SKILL.md has valid frontmatter`, () => {
      const file = join(SKILLS_DIR, name, 'SKILL.md');
      if (!existsSync(file)) return;
      const content = readFileSync(file, 'utf8');
      const fmMatch = content.match(/^---\n([\s\S]+?)\n---/);
      assert.ok(fmMatch, `${name} should have frontmatter`);
      const fm = fmMatch[1];
      assert.ok(fm.includes('name:'), `${name} should have name`);
      assert.ok(fm.includes('description:'), `${name} should have description`);
      assert.ok(fm.includes('license:'), `${name} should have license`);
    });
  }

  for (const [name, scripts] of Object.entries(SKILLS_WITH_SCRIPTS)) {
    for (const script of scripts) {
      it(`${name} has script ${script}`, () => {
        const path = join(SKILLS_DIR, name, 'scripts', script);
        if (script.endsWith('/')) {
          assert.ok(existsSync(path), `${name}/scripts/${script} should exist`);
        } else {
          assert.ok(existsSync(path), `${name}/scripts/${script} should exist`);
        }
      });
    }
  }
});
