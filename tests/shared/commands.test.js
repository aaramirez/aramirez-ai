import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { REPO_ROOT } from '../helpers.js';

const COMMANDS_DIR = join(REPO_ROOT, 'shared', 'commands');

const EXPECTED_COMMANDS = [
  'ingest',
  'generate',
  'send-email',
  'kb',
  'youtube-cmd',
  'export-pdf',
  'plan',
  'getrepo',
  'updaterepos',
];

describe('shared commands', () => {
  for (const name of EXPECTED_COMMANDS) {
    it(`${name}.md exists in shared/commands/`, () => {
      assert.ok(existsSync(join(COMMANDS_DIR, `${name}.md`)), `${name}.md should exist`);
    });
  }

  it('all commands have valid frontmatter (description)', () => {
    for (const name of EXPECTED_COMMANDS) {
      const file = join(COMMANDS_DIR, `${name}.md`);
      if (!existsSync(file)) continue;
      const content = readFileSync(file, 'utf8');
      const fmMatch = content.match(/^---\n([\s\S]+?)\n---/);
      assert.ok(fmMatch, `${name}.md should have frontmatter`);
      const fm = fmMatch[1];
      assert.ok(fm.includes('description:'), `${name}.md should have description`);
    }
  });

  it('all commands have actionable content', () => {
    for (const name of EXPECTED_COMMANDS) {
      const file = join(COMMANDS_DIR, `${name}.md`);
      if (!existsSync(file)) continue;
      const content = readFileSync(file, 'utf8');
      const body = content.replace(/^---\n[\s\S]+?\n---\n?/, '').trim();
      assert.ok(body.length > 20, `${name}.md should have meaningful content`);
    }
  });
});
