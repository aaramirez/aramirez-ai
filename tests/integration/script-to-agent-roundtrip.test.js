import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'child_process';
import { mkdtempSync, rmSync, readFileSync, copyFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { REPO_ROOT } from '../helpers.js';

const CREATE_AGENT = join(REPO_ROOT, '.opencode', 'scripts', 'create-agent.js');
const AGENTS_DIR = join(REPO_ROOT, '.opencode', 'agents');
const CONFIG_PATH = join(REPO_ROOT, 'opencode.json');

function runScript(args = []) {
  const result = spawnSync('node', [CREATE_AGENT, ...args], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    stdio: 'pipe',
  });
  return {
    stdout: (result.stdout || '').trim(),
    stderr: (result.stderr || '').trim(),
    exitCode: result.status ?? 1,
  };
}

function debugAgent(name) {
  const result = spawnSync('opencode', ['debug', 'agent', name], {
    encoding: 'utf8',
    stdio: 'pipe',
    timeout: 30000,
  });
  return {
    stdout: (result.stdout || '').trim(),
    stderr: (result.stderr || '').trim(),
    exitCode: result.status ?? 1,
  };
}

describe('create-agent to opencode debug roundtrip', { timeout: 60000 }, () => {
  let tempDir;
  const AGENT_NAME = 'roundtrip-test';

  test('setup', () => {
    tempDir = mkdtempSync(join(tmpdir(), 'roundtrip-'));
  });

  test('create-agent generates valid .md file', () => {
    const out = join(tempDir, `${AGENT_NAME}.md`);
    const result = runScript([
      '--name', AGENT_NAME,
      '--preset', 'reviewer',
      '--output', out,
    ]);
    assert.equal(result.exitCode, 0, `create-agent failed: ${result.stderr}`);
    const content = readFileSync(out, 'utf8');
    assert.match(content, /mode:\s*subagent/, 'file has subagent mode');
    assert.match(content, /edit:\s*deny/, 'file has edit: deny');
  });

  test('generated file has valid frontmatter', () => {
    const out = join(tempDir, `${AGENT_NAME}.md`);
    const content = readFileSync(out, 'utf8');
    assert.match(content, /^---/, 'has frontmatter opening');
    assert.match(content, /description:/, 'has description');
    assert.match(content, /mode:\s*subagent/, 'mode is subagent');
    assert.match(content, /permission:/, 'has permissions');
  });

  test('generated file can be loaded by opencode', () => {
    const src = join(tempDir, `${AGENT_NAME}.md`);
    const dest = join(AGENTS_DIR, `${AGENT_NAME}.md`);
    copyFileSync(src, dest);

    const config = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
    const origAgent = config.agent[AGENT_NAME];
    config.agent[AGENT_NAME] = {
      description: 'Roundtrip test agent',
      mode: 'subagent',
      path: `.opencode/agents/${AGENT_NAME}.md`,
    };
    writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + '\n');

    try {
      const result = debugAgent(AGENT_NAME);
      assert.equal(result.exitCode, 0, `opencode debug agent failed:\n${result.stderr || result.stdout}`);
      const agent = JSON.parse(result.stdout);
      assert.equal(agent.name, AGENT_NAME, 'name matches');
      assert.equal(agent.mode, 'subagent', 'mode is subagent');
      assert.ok(agent.prompt, 'has prompt');
      assert.ok(agent.tools, 'has tools');
    } finally {
      try { rmSync(dest); } catch {}
      const restored = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
      if (origAgent) {
        restored.agent[AGENT_NAME] = origAgent;
      } else {
        delete restored.agent[AGENT_NAME];
      }
      writeFileSync(CONFIG_PATH, JSON.stringify(restored, null, 2) + '\n');
    }
  });

  test('cleanup', () => {
    if (tempDir) rmSync(tempDir, { recursive: true, force: true });
  });
});
