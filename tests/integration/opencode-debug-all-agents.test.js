import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { REPO_ROOT, runOpencode } from '../helpers.js';

if (!process.env.TEST_OPENCODE) {
  console.log('TEST_OPENCODE not set — skipping (opencode integration tests are slow)');
  process.exit(0);
}

const AGENTS_DIR = join(REPO_ROOT, '.opencode', 'agents');

const agentNames = existsSync(AGENTS_DIR)
  ? readdirSync(AGENTS_DIR)
      .filter(f => f.endsWith('.md'))
      .map(f => f.replace(/\.md$/, ''))
  : [];

if (agentNames.length === 0) {
  console.log('No agent .md files found — skipping');
  process.exit(0);
}

describe('opencode debug agent — all agents', { timeout: agentNames.length * 15000 + 5000 }, () => {
  for (const name of agentNames) {
    test(`agent "${name}" loads without errors`, { timeout: 15000 }, () => {
      const result = runOpencode(['debug', 'agent', name]);
      assert.equal(result.exitCode, 0, `opencode debug agent ${name} failed:\n${result.stderr}`);

      let parsed;
      try {
        parsed = JSON.parse(result.stdout);
      } catch {
        assert.fail(`Output is not valid JSON:\n${result.stdout.slice(0, 500)}`);
      }

      assert.equal(parsed.name, name, 'name field should match');
      assert.ok(parsed.description, 'should have description');
      assert.ok(parsed.mode, 'should have mode');
      assert.ok(
        ['primary', 'subagent'].includes(parsed.mode),
        `mode should be primary or subagent, got: ${parsed.mode}`
      );
      assert.ok(parsed.tools, 'should have tools');
    });
  }
});
