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

  test('all entries in structure diagram correspond to existing files/dirs', () => {
    const diagramLines = agentsContent.split('\n')
      .filter(l => /[├└]──/.test(l));
    const errors = [];
    const pathStack = [];
    const INDENT_UNIT = 4;

    for (const line of diagramLines) {
      // Count leading box-drawing chars + spaces before ├ or └
      const indentMatch = line.match(/^([│\s]*)/);
      const indent = indentMatch ? indentMatch[1].length : 0;
      const depth = Math.floor(indent / INDENT_UNIT);

      const entryMatch = line.match(/[├└]──\s+(.+?)(?:\s{2,}|$)/);
      if (!entryMatch) continue;
      const entry = entryMatch[1].replace(/\/$/, '').trim();
      if (entry.startsWith('#') || !entry) continue;

      pathStack[depth] = entry;
      const relPath = pathStack.slice(0, depth + 1).join('/');
      const fullPath = join(REPO_ROOT, relPath);
      if (!existsSync(fullPath)) {
        errors.push(`Structure diagram entry does not exist: "${relPath}"`);
      }
    }
    assert.ok(errors.length === 0, errors.join('\n'));
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
    assert.ok(!agentsContent.toLowerCase().includes('global install'),
      'AGENTS.md should not mention global install');
    assert.ok(!agentsContent.toLowerCase().includes('npm install -g'),
      'AGENTS.md should not mention npm install -g');
  });
});
