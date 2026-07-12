import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { REPO_ROOT } from '../helpers.js';

describe('documentation consistency', () => {
  it('AGENTS.md mentions all 10 shared agents', () => {
    const file = join(REPO_ROOT, 'AGENTS.md');
    const content = readFileSync(file, 'utf8');
    const agents = ['content-ingestion', 'document-generation', 'email', 'kb-management', 'youtube', 'vault-pdf-export'];
    for (const agent of agents) {
      assert.ok(content.includes(agent), `AGENTS.md should mention ${agent}`);
    }
  });

  it('AGENTS.md mentions distributable package pattern', () => {
    const file = join(REPO_ROOT, 'AGENTS.md');
    const content = readFileSync(file, 'utf8');
    assert.ok(content.includes('Distributable Package') || content.includes('distributable package'),
      'AGENTS.md should mention distributable package pattern');
  });

  it('README.md lists all 14 skills', () => {
    const file = join(REPO_ROOT, 'README.md');
    const content = readFileSync(file, 'utf8');
    const skills = ['branding', 'code-review', 'content-ingestion', 'document-generation', 'email', 'git', 'google-workspace', 'kb-management', 'm365', 'pdf-extraction', 'vault-pdf-export', 'youtube', 'ci-validate', 'repos-sync'];
    for (const skill of skills) {
      assert.ok(content.includes(skill), `README.md should list skill ${skill}`);
    }
  });

  it('README.md lists all 9 scripts', () => {
    const file = join(REPO_ROOT, 'README.md');
    const content = readFileSync(file, 'utf8');
    const scripts = ['create-brand.js', 'ingest-content.js', 'kb-sync.js', 'extract-pdf.js', 'ci-validate.js', 'repos-sync.js', 'send-email.js', 'mcp-email.js', 'youtube-transcript.js'];
    for (const script of scripts) {
      assert.ok(content.includes(script), `README.md should list script ${script}`);
    }
  });

  it('README.md lists all 10 agents', () => {
    const file = join(REPO_ROOT, 'README.md');
    const content = readFileSync(file, 'utf8');
    const agents = ['content-ingestion', 'document-generation', 'email', 'kb-management', 'youtube', 'vault-pdf-export'];
    for (const agent of agents) {
      assert.ok(content.includes(agent), `README.md should list agent ${agent}`);
    }
  });

  it('README.md lists all 9 commands', () => {
    const file = join(REPO_ROOT, 'README.md');
    const content = readFileSync(file, 'utf8');
    const commands = ['ingest', 'generate', 'send-email', 'kb', 'youtube-cmd', 'export-pdf'];
    for (const cmd of commands) {
      assert.ok(content.includes(cmd), `README.md should list command ${cmd}`);
    }
  });

  it('README.md architecture section matches actual structure', () => {
    const file = join(REPO_ROOT, 'README.md');
    const content = readFileSync(file, 'utf8');
    assert.ok(content.includes('shared/skills'), 'README.md should mention shared/skills');
    assert.ok(content.includes('shared/scripts'), 'README.md should mention shared/scripts');
    assert.ok(content.includes('shared/agents'), 'README.md should mention shared/agents');
    assert.ok(content.includes('shared/commands'), 'README.md should mention shared/commands');
  });

  it('distribution-pattern skill exists', () => {
    assert.ok(existsSync(join(REPO_ROOT, '.opencode', 'skills', 'distribution-pattern', 'SKILL.md')),
      'distribution-pattern skill should exist');
  });
});
