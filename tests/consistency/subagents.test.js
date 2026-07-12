import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { REPO_ROOT } from '../helpers.js';

const AGENTS_DIR = join(REPO_ROOT, '.opencode', 'agents');

const REQUIRED_SUBAGENTS = [
  'config-creator.md',
  'permission-creator.md',
  'instructions-creator.md',
  'mcp-creator.md',
  'architecture-creator.md',
  'flow-creator.md',
  'plugin-creator.md',
  'tool-creator.md',
  'prompt-creator.md',
  'rule-creator.md',
  'reference-creator.md',
  'command-creator.md',
];

describe('subagent definitions', () => {
  test('all 12 subagent .md files exist', () => {
    const files = readdirSync(AGENTS_DIR);
    for (const name of REQUIRED_SUBAGENTS) {
      assert.ok(files.includes(name), `Missing subagent: ${name}`);
    }
  });

  for (const file of REQUIRED_SUBAGENTS) {
    test(`${file}: has valid frontmatter with mode: subagent`, () => {
      const path = join(AGENTS_DIR, file);
      assert.ok(statSync(path).isFile(), `File not found: ${file}`);

      const content = readFileSync(path, 'utf8');
      assert.match(content, /^---/, 'has frontmatter opening');
      assert.match(content, /description:/, 'has description');
      assert.match(content, /mode:\s*subagent/, 'mode is subagent');
    });

    test(`${file}: loads corresponding skill`, () => {
      const content = readFileSync(join(AGENTS_DIR, file), 'utf8');
      const skillName = file.replace('.md', '');
      assert.ok(
        content.includes(`skill("${skillName}")`) || content.includes(`skill('${skillName}')`) || content.includes(`skill \`${skillName}\``),
        `should reference skill "${skillName}"`
      );
    });

    test(`${file}: references corresponding create-*.js script`, () => {
      const content = readFileSync(join(AGENTS_DIR, file), 'utf8');
      const scriptName = file.replace('.md', '').replace('-creator', '');
      assert.ok(
        content.includes(`create-${scriptName}.js`),
        `should reference create-${scriptName}.js`
      );
    });
  }

  test('new-harness.md is primary mode', () => {
    const content = readFileSync(join(AGENTS_DIR, 'new-harness.md'), 'utf8');
    assert.match(content, /mode:\s*primary/, 'new-harness is primary');
  });

  test('plan-arai.md is primary mode', () => {
    const content = readFileSync(join(AGENTS_DIR, 'plan-arai.md'), 'utf8');
    assert.match(content, /mode:\s*primary/, 'plan-arai is primary');
  });
});
