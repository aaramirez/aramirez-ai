import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'fs';
import { join } from 'path';
import { REPO_ROOT } from '../helpers.js';

describe('eliminated artifacts', () => {
  const ELIMINATED = [
    { path: 'shared/skills/harness-creator/SKILL.md', name: 'harness-creator skill' },
    { path: 'shared/skills/subagent-creator/SKILL.md', name: 'subagent-creator skill' },
    { path: 'shared/skills/specialized-agent-creator/SKILL.md', name: 'specialized-agent-creator skill' },
    { path: 'shared/scripts/harness-generator.js', name: 'harness-generator.js' },
    { path: 'shared/scripts/create-subagent.js', name: 'create-subagent.js' },
    { path: 'shared/scripts/create-specialized-agent.js', name: 'create-specialized-agent.js' },
  ];

  for (const { path, name } of ELIMINATED) {
    test(`${name} no longer exists`, () => {
      assert.ok(!existsSync(join(REPO_ROOT, path)), `${name} should be deleted`);
    });
  }
});
