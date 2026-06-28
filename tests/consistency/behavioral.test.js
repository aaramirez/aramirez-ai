import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { REPO_ROOT, parseFrontmatter } from '../helpers.js';

const AGENTS_DIR = join(REPO_ROOT, 'platforms', 'opencode', 'agents');
const CONFIG_PATH = join(REPO_ROOT, 'platforms', 'opencode', 'opencode.json');

function getAgentFiles() {
  if (!existsSync(AGENTS_DIR)) return [];
  return readdirSync(AGENTS_DIR).filter(f => f.endsWith('.md')).sort();
}

function loadConfig() {
  return JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
}

describe('agent .md frontmatter structural validation (Phase 1e)', () => {
  const files = getAgentFiles();
  const config = loadConfig();

  test('has at least one agent .md file', () => {
    assert.ok(files.length > 0, 'No agent .md files found');
  });

  for (const file of files) {
    const agentName = file.replace(/\.md$/, '');
    const filePath = join(AGENTS_DIR, file);

    test(`${agentName}: has valid YAML frontmatter with required fields`, () => {
      const fm = parseFrontmatter(filePath);
      assert.ok(fm.description, `Missing "description" in ${file}`);
      assert.ok(fm.mode, `Missing "mode" in ${file}`);
      assert.ok(fm.model, `Missing "model" in ${file}`);
    });

    test(`${agentName}: mode is primary or subagent`, () => {
      const fm = parseFrontmatter(filePath);
      assert.ok(['primary', 'subagent'].includes(fm.mode),
        `mode must be "primary" or "subagent", got "${fm.mode}"`);
    });

    test(`${agentName}: model is opencode/big-pickle`, () => {
      const fm = parseFrontmatter(filePath);
      assert.equal(fm.model, 'opencode/big-pickle',
        `model must be "opencode/big-pickle", got "${fm.model}"`);
    });

    test(`${agentName}: permission object has valid edit and/or bash values`, () => {
      const fm = parseFrontmatter(filePath);
      const perm = fm.permission;
      assert.ok(perm, `Missing "permission" in ${file}`);
      const validValues = ['allow', 'deny'];
      if ('edit' in perm) {
        assert.ok(validValues.includes(perm.edit),
          `permission.edit must be "allow" or "deny", got "${perm.edit}"`);
      }
      if ('bash' in perm) {
        assert.ok(validValues.includes(perm.bash),
          `permission.bash must be "allow" or "deny", got "${perm.bash}"`);
      }
    });

    test(`${agentName}: has at least 3 body instruction items`, () => {
      const content = readFileSync(filePath, 'utf8');
      const body = content.replace(/^---[\s\S]+?---\n*/, '').trim();
      const bulletCount = (body.match(/^\d+\./gm) || []).length;
      assert.ok(bulletCount >= 3,
        `Agent ${file} has ${bulletCount} numbered instructions, need at least 3`);
    });
  }
});
