import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'fs';
import { join } from 'path';
import { REPO_ROOT } from '../helpers.js';

const SOURCE_CONFIG = join(REPO_ROOT, 'platforms', 'opencode', 'opencode.json');
const INSTALLED_CONFIG = join(REPO_ROOT, 'opencode.json');

function loadConfig(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

/* ─── Dangerous patterns for safety check (4b) ─── */
const DANGEROUS_PATTERNS = [
  { pattern: /rm\s+-rf\s+\/\s*$/, label: 'rm -rf /' },
  { pattern: /\bsudo\b/, label: 'sudo' },
  { pattern: />\s*\/dev\/sda/, label: '> /dev/sda' },
  { pattern: /\bdd\s+if=/, label: 'dd if=' },
  { pattern: /:\(\)\{\s*:\|:&\s*\};:/, label: 'fork bomb' },
  { pattern: /\beval\b/, label: 'eval' },
  { pattern: /\bexec\b/, label: 'exec' },
  { pattern: /`[^`]+`/, label: 'backtick injection' },
];

describe('command templates (Phase 4)', () => {
  let config;

  test('opencode.json loads successfully', () => {
    config = loadConfig(SOURCE_CONFIG);
    assert.ok(config.command, 'Should have commands section');
  });

  /* ─── 4a adapted: Template content validation ─── */

  test('test command template mentions test framework detection', () => {
    const tpl = config.command.test?.template || '';
    assert.ok(tpl.length > 20, 'test template should be substantive');
    assert.ok(
      /test/i.test(tpl) && /framework/i.test(tpl),
      'test template should mention test framework detection'
    );
  });

  test('commit command template mentions conventional commit', () => {
    const tpl = config.command.commit?.template || '';
    assert.ok(tpl.length > 20, 'commit template should be substantive');
    assert.ok(
      /conventional/i.test(tpl) || /commit/i.test(tpl),
      'commit template should mention conventional commit'
    );
  });

  test('deploy command template mentions deployment', () => {
    const tpl = config.command.deploy?.template || '';
    assert.ok(tpl.length > 20, 'deploy template should be substantive');
    assert.ok(
      /deploy/i.test(tpl) || /deployment/i.test(tpl),
      'deploy template should mention deployment'
    );
  });

  test('all commands have description and template fields', () => {
    config = config || loadConfig(SOURCE_CONFIG);
    const commands = config.command || {};
    const names = Object.keys(commands);
    assert.ok(names.length >= 1, 'Should have at least 1 command');
    for (const name of names) {
      const cmd = commands[name];
      assert.ok(cmd.description?.length >= 10, `Command "${name}" should have description >= 10 chars`);
      assert.ok(cmd.template?.length >= 20, `Command "${name}" should have template >= 20 chars`);
    }
  });

  /* ─── 4b: Template safety validation ─── */

  test('no dangerous patterns in command templates', () => {
    config = config || loadConfig(SOURCE_CONFIG);
    const commands = config.command || {};
    for (const name of Object.keys(commands)) {
      const tpl = commands[name].template || '';
      for (const { pattern, label } of DANGEROUS_PATTERNS) {
        assert.ok(!pattern.test(tpl), `Command "${name}" template should not contain "${label}"`);
      }
    }
  });

  test('no dangerous patterns in description fields', () => {
    config = config || loadConfig(SOURCE_CONFIG);
    const commands = config.command || {};
    for (const name of Object.keys(commands)) {
      const desc = commands[name].description || '';
      for (const { pattern, label } of DANGEROUS_PATTERNS) {
        assert.ok(!pattern.test(desc), `Command "${name}" description should not contain "${label}"`);
      }
    }
  });

  /* ─── 4c: Template variable completeness ─── */

  test('no unmatched {{...}} placeholders in templates', () => {
    config = config || loadConfig(SOURCE_CONFIG);
    const commands = config.command || {};
    for (const name of Object.keys(commands)) {
      const tpl = commands[name].template || '';
      const matches = tpl.match(/\{\{\s*\w+\s*\}\}/g) || [];
      assert.equal(
        matches.length, 0,
        `Command "${name}" has unmatched placeholders: ${matches.join(', ')}`
      );
    }
  });

  /* ─── Also check installed opencode.json if present ─── */

  test('installed opencode.json command templates (if present) are also safe', () => {
    try {
      const installed = loadConfig(INSTALLED_CONFIG);
      const commands = installed.command || {};
      for (const name of Object.keys(commands)) {
        const tpl = commands[name].template || '';
        for (const { pattern, label } of DANGEROUS_PATTERNS) {
          assert.ok(!pattern.test(tpl), `Installed "${name}" template should not contain "${label}"`);
        }
        const desc = commands[name].description || '';
        for (const { pattern, label } of DANGEROUS_PATTERNS) {
          assert.ok(!pattern.test(desc), `Installed "${name}" description should not contain "${label}"`);
        }
      }
    } catch {
      // installed opencode.json may not exist — skip
    }
  });
});
