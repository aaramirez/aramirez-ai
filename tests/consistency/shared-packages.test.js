import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
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

  it('skill frontmatter scripts exist in co-located scripts/', () => {
    const skillsDir = join(SHARED_DIR, 'skills');
    const skills = readdirSync(skillsDir).filter(f => existsSync(join(skillsDir, f, 'SKILL.md')));
    for (const skill of skills) {
      const content = readFileSync(join(skillsDir, skill, 'SKILL.md'), 'utf8');
      const scriptsMatch = content.match(/scripts:\s*\n\s*-\s*(.+\.js)/);
      if (scriptsMatch) {
        const script = scriptsMatch[1].trim();
        if (script.startsWith('../')) continue;
        assert.ok(existsSync(join(skillsDir, skill, 'scripts', script)),
          `${skill} references ${script} but it doesn't exist in skill scripts/`);
      }
    }
  });

  it('skills with scripts field have co-located scripts/ directory', () => {
    const skillsDir = join(SHARED_DIR, 'skills');
    const skills = readdirSync(skillsDir).filter(f => existsSync(join(skillsDir, f, 'SKILL.md')));
    for (const skill of skills) {
      const content = readFileSync(join(skillsDir, skill, 'SKILL.md'), 'utf8');
      const hasScripts = /scripts:\s*\n\s*-/.test(content);
      if (hasScripts) {
        const scriptsDir = join(skillsDir, skill, 'scripts');
        assert.ok(existsSync(scriptsDir), `${skill} has scripts: in frontmatter but no scripts/ dir`);
      }
    }
  });

  it('all frontmatter scripts resolve to files in skill local scripts/', () => {
    const skillsDir = join(SHARED_DIR, 'skills');
    const skills = readdirSync(skillsDir).filter(f => existsSync(join(skillsDir, f, 'SKILL.md')));
    for (const skill of skills) {
      const content = readFileSync(join(skillsDir, skill, 'SKILL.md'), 'utf8');
      const scriptLines = content.match(/scripts:\s*\n((?:\s*-\s*.+\n?)*)/);
      if (!scriptLines) continue;
      const scripts = scriptLines[1].match(/-\s+(.+)/g)?.map(s => s.replace(/-\s+/, '').trim()) || [];
      for (const script of scripts) {
        if (script.startsWith('../')) continue;
        const path = join(skillsDir, skill, 'scripts', script);
        assert.ok(existsSync(path), `${skill}: ${script} not found in local scripts/`);
      }
    }
  });

  it('shared/scripts/lib/ still exists (arai infrastructure)', () => {
    assert.ok(existsSync(join(SHARED_DIR, 'scripts', 'lib')),
      'shared/scripts/lib/ must exist — arai CLI depends on it');
    const libFiles = ['helpers.js', 'install.js', 'scaffold.js', 'list.js', 'sync.js', 'status.js', 'agents-md.js', 'template-utils.js'];
    for (const f of libFiles) {
      assert.ok(existsSync(join(SHARED_DIR, 'scripts', 'lib', f)),
        `shared/scripts/lib/${f} must exist`);
    }
  });

  it('standalone scripts remain in shared/scripts/', () => {
    assert.ok(existsSync(join(SHARED_DIR, 'scripts', 'ci-validate.js')),
      'ci-validate.js must remain in shared/scripts/ (standalone)');
    assert.ok(existsSync(join(SHARED_DIR, 'scripts', 'repos-sync.js')),
      'repos-sync.js must remain in shared/scripts/ (standalone)');
  });
});

function readdir(dir) {
  try {
    return readdirSync(dir);
  } catch {
    return [];
  }
}
