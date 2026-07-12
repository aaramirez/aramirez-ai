import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { runArai, tmpDir, cleanup, assertFile, assertDir, assertExitCode, REPO_ROOT } from '../helpers.js';

describe('installPlatform sources from shared/', () => {
  let dir;

  afterEach(() => {
    if (dir) cleanup(dir);
  });

  test('installPlatform copies agents from shared/agents/, not .opencode/agents/', () => {
    dir = tmpDir();
    runArai(['install', '--project', dir]);

    const installedAgents = readdirSync(join(dir, '.opencode', 'agents'))
      .filter(f => f.endsWith('.md'))
      .map(f => f.replace('.md', ''));

    const sharedAgents = readdirSync(join(REPO_ROOT, 'shared', 'agents'))
      .filter(f => f.endsWith('.md'))
      .map(f => f.replace('.md', ''));

    for (const name of installedAgents) {
      assert.ok(sharedAgents.includes(name),
        `Agent "${name}" should come from shared/agents/, not .opencode/agents/`);
    }
  });

  test('installPlatform does NOT copy creator agents', () => {
    dir = tmpDir();
    runArai(['install', '--project', dir]);

    const installedAgents = readdirSync(join(dir, '.opencode', 'agents'))
      .filter(f => f.endsWith('.md'))
      .map(f => f.replace('.md', ''));

    const creatorAgents = [
      'agent-creator', 'architecture-creator', 'command-creator',
      'config-creator', 'flow-creator', 'instructions-creator',
      'mcp-creator', 'permission-creator', 'plugin-creator',
      'prompt-creator', 'reference-creator', 'rule-creator',
      'script-creator', 'skill-creator', 'tool-creator', 'new-harness',
    ];

    for (const name of creatorAgents) {
      assert.ok(!installedAgents.includes(name),
        `Creator agent "${name}" should NOT be installed in external projects`);
    }
  });

  test('installPlatform copies commands from shared/commands/, not .opencode/commands/', () => {
    dir = tmpDir();
    runArai(['install', '--project', dir]);

    const installedCommands = readdirSync(join(dir, '.opencode', 'commands'))
      .filter(f => f.endsWith('.md'))
      .map(f => f.replace('.md', ''));

    const sharedCommands = readdirSync(join(REPO_ROOT, 'shared', 'commands'))
      .filter(f => f.endsWith('.md'))
      .map(f => f.replace('.md', ''));

    for (const name of installedCommands) {
      assert.ok(sharedCommands.includes(name),
        `Command "${name}" should come from shared/commands/, not .opencode/commands/`);
    }
  });

  test('installPlatform opencode.json does NOT have engram MCP', () => {
    dir = tmpDir();
    runArai(['install', '--project', dir]);

    const config = JSON.parse(readFileSync(join(dir, 'opencode.json'), 'utf8'));
    assert.ok(!config.mcp?.engram, 'opencode.json should NOT have engram MCP');
  });

  test('installPlatform opencode.json does NOT have context7 MCP', () => {
    dir = tmpDir();
    runArai(['install', '--project', dir]);

    const config = JSON.parse(readFileSync(join(dir, 'opencode.json'), 'utf8'));
    assert.ok(!config.mcp?.context7, 'opencode.json should NOT have context7 MCP');
  });

  test('installPlatform opencode.json does NOT have skills.paths', () => {
    dir = tmpDir();
    runArai(['install', '--project', dir]);

    const config = JSON.parse(readFileSync(join(dir, 'opencode.json'), 'utf8'));
    assert.ok(!config.skills?.paths, 'opencode.json should NOT have skills.paths');
  });

  test('installPlatform opencode.json has exactly the agents from the partial', () => {
    dir = tmpDir();
    runArai(['install', '--project', dir]);

    const partial = JSON.parse(readFileSync(join(REPO_ROOT, 'shared', 'templates', 'partials', 'opencode.json'), 'utf8'));
    const installed = JSON.parse(readFileSync(join(dir, 'opencode.json'), 'utf8'));

    const partialAgents = Object.keys(partial.agent || {}).sort();
    const installedAgents = Object.keys(installed.agent || {}).sort();

    assert.deepEqual(installedAgents, partialAgents,
      'Installed agents should match the partial exactly');
  });

  test('installPlatform opencode.json has exactly the commands from the partial', () => {
    dir = tmpDir();
    runArai(['install', '--project', dir]);

    const partial = JSON.parse(readFileSync(join(REPO_ROOT, 'shared', 'templates', 'partials', 'opencode.json'), 'utf8'));
    const installed = JSON.parse(readFileSync(join(dir, 'opencode.json'), 'utf8'));

    const partialCommands = Object.keys(partial.command || {}).sort();
    const installedCommands = Object.keys(installed.command || {}).sort();

    assert.deepEqual(installedCommands, partialCommands,
      'Installed commands should match the partial exactly');
  });
});
