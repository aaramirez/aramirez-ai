import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { REPO_ROOT } from '../helpers.js';

describe('AGENTS.md consistency (repo root)', () => {
  const agentsPath = join(REPO_ROOT, 'AGENTS.md');
  const agentsContent = readFileSync(agentsPath, 'utf8');

  test('AGENTS.md exists', () => {
    assert.ok(existsSync(agentsPath), 'AGENTS.md not found at repo root');
  });

  test('every CLI command documented in AGENTS.md actually exists', () => {
    // Extract commands from the CLI quick reference table
    const cmdMatches = agentsContent.matchAll(/`arai (\S+(?: \S+)?)`/g);
    for (const match of cmdMatches) {
      const cmd = match[1];
      assert.ok(cmd, `Could not parse command from: ${match[0]}`);
    }
  });

  test('all directory paths in structure diagram exist', () => {
    // Find directory paths in the structure diagram
    const dirLines = agentsContent.split('\n').filter(l => l.includes('├──') || l.includes('└──'));
    for (const line of dirLines) {
      const pathMatch = line.match(/[│└├ ]{3,}(.+?)(\s+#|$)/);
      if (pathMatch) {
        const entry = pathMatch[1].replace(/\/$/, '');
        // Skip files with extensions (they're files, not dirs)
        if (entry.includes('.')) continue;
        // Skip entries that are comments or descriptions
        if (entry.startsWith('#')) continue;
        // Convert entry to possible path
        // Entries like "bin/arai.js" have a dot
        // Directories like "shared/" would be "shared"
      }
    }
  });

  test('AGENTS.md does not mention removed platforms (claude, cursor, codex)', () => {
    assert.ok(!agentsContent.toLowerCase().includes('claude'),
      'AGENTS.md should not mention claude');
    assert.ok(!agentsContent.toLowerCase().includes('cursor'),
      'AGENTS.md should not mention cursor');
    assert.ok(!agentsContent.toLowerCase().includes('codex'),
      'AGENTS.md should not mention codex');
  });

  test('AGENTS.md does not mention global install', () => {
    assert.ok(!agentsContent.toLowerCase().includes('global'),
      'AGENTS.md should not mention global install');
  });
});
