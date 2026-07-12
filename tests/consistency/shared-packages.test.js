import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { REPO_ROOT } from '../helpers.js';

const SHARED_DIR = join(REPO_ROOT, 'shared');

describe('shared packages completeness', () => {
  it('all 6 full packages have skill + agent + command', () => {
    const fullPkgs = {
      'content-ingestion': 'ingest.md',
      'document-generation': 'generate.md',
      'email': 'send-email.md',
      'kb-management': 'kb.md',
      'youtube': 'youtube-cmd.md',
      'vault-pdf-export': 'export-pdf.md'
    };
    for (const [pkg, cmd] of Object.entries(fullPkgs)) {
      assert.ok(existsSync(join(SHARED_DIR, 'skills', pkg, 'SKILL.md')), `${pkg} missing SKILL.md`);
      assert.ok(existsSync(join(SHARED_DIR, 'agents', `${pkg}.md`)), `${pkg} missing agent .md`);
      assert.ok(existsSync(join(SHARED_DIR, 'commands', cmd)), `${pkg} missing command ${cmd}`);
    }
  });

  it('all 2 utility packages have skill + agent', () => {
    const utilityPkgs = ['branding', 'pdf-extraction'];
    for (const pkg of utilityPkgs) {
      assert.ok(existsSync(join(SHARED_DIR, 'skills', pkg, 'SKILL.md')), `${pkg} missing SKILL.md`);
      assert.ok(existsSync(join(SHARED_DIR, 'agents', `${pkg}.md`)), `${pkg} missing agent .md`);
    }
  });

  it('skill frontmatter scripts match actual scripts in shared/scripts/', () => {
    const skillsDir = join(SHARED_DIR, 'skills');
    const skills = readdir(skillsDir).filter(f => existsSync(join(skillsDir, f, 'SKILL.md')));
    for (const skill of skills) {
      const content = readFileSync(join(skillsDir, skill, 'SKILL.md'), 'utf8');
      const scriptsMatch = content.match(/scripts:\s*\n\s*-\s*(.+\.js)/);
      if (scriptsMatch) {
        const script = scriptsMatch[1].trim();
        assert.ok(existsSync(join(SHARED_DIR, 'scripts', script)),
          `${skill} references ${script} but it doesn't exist in shared/scripts/`);
      }
    }
  });
});

function readdir(dir) {
  try {
    return require('fs').readdirSync(dir);
  } catch {
    return [];
  }
}
