import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { shouldSkip, isExcludedFromSync, isExcludedSkill, SKIP_IF_EXISTS, EXCLUDE_FROM_SYNC, EXCLUDE_SKILLS_FROM_SYNC } from '../../shared/scripts/lib/protection.js';

describe('SKIP_IF_EXISTS constants', () => {
  it('includes opencode.json', () => {
    assert.ok(SKIP_IF_EXISTS.includes('opencode.json'));
  });

  it('includes AGENTS.md', () => {
    assert.ok(SKIP_IF_EXISTS.includes('AGENTS.md'));
  });

  it('includes repos.json', () => {
    assert.ok(SKIP_IF_EXISTS.includes('repos.json'));
  });

  it('includes package.json', () => {
    assert.ok(SKIP_IF_EXISTS.includes('package.json'));
  });

  it('includes .gitignore', () => {
    assert.ok(SKIP_IF_EXISTS.includes('.gitignore'));
  });
});

describe('shouldSkip', () => {
  it('returns true for opencode.json when force=false', () => {
    assert.ok(shouldSkip('opencode.json', false));
  });

  it('returns false for opencode.json when force=true', () => {
    assert.ok(!shouldSkip('opencode.json', true));
  });

  it('returns true for AGENTS.md when force=false', () => {
    assert.ok(shouldSkip('AGENTS.md', false));
  });

  it('returns false for AGENTS.md when force=true', () => {
    assert.ok(!shouldSkip('AGENTS.md', true));
  });

  it('returns true for repos.json when force=false', () => {
    assert.ok(shouldSkip('repos.json', false));
  });

  it('returns false for repos.json when force=true', () => {
    assert.ok(!shouldSkip('repos.json', true));
  });

  it('returns false for unknown files', () => {
    assert.ok(!shouldSkip('some-skill.md', false));
  });

  it('returns false for unknown files even without force', () => {
    assert.ok(!shouldSkip('some-skill.md', false));
  });

  it('matches nested paths like .opencode/skills/foo/SKILL.md', () => {
    assert.ok(!shouldSkip('.opencode/skills/foo/SKILL.md', false));
  });
});

describe('EXCLUDE_FROM_SYNC', () => {
  it('excludes agent-creator.md', () => {
    assert.ok(isExcludedFromSync('agent-creator.md'));
  });

  it('excludes architecture-creator.md', () => {
    assert.ok(isExcludedFromSync('architecture-creator.md'));
  });

  it('excludes config-creator.md', () => {
    assert.ok(isExcludedFromSync('config-creator.md'));
  });

  it('excludes new-harness.md', () => {
    assert.ok(isExcludedFromSync('new-harness.md'));
  });

  it('excludes plan.md (repo-level)', () => {
    assert.ok(isExcludedFromSync('plan.md'));
  });

  it('does NOT exclude reviewer.md (distributable)', () => {
    assert.ok(!isExcludedFromSync('reviewer.md'));
  });

  it('does NOT exclude tester.md (distributable)', () => {
    assert.ok(!isExcludedFromSync('tester.md'));
  });

  it('does NOT exclude docs.md (distributable)', () => {
    assert.ok(!isExcludedFromSync('docs.md'));
  });

  it('does NOT exclude plan-arai.md (distributable)', () => {
    assert.ok(!isExcludedFromSync('plan-arai.md'));
  });
});

describe('EXCLUDE_SKILLS_FROM_SYNC', () => {
  it('excludes distribution-pattern', () => {
    assert.ok(isExcludedSkill('distribution-pattern'));
  });

  it('excludes customize-opencode', () => {
    assert.ok(isExcludedSkill('customize-opencode'));
  });

  it('excludes harness-generator', () => {
    assert.ok(isExcludedSkill('harness-generator'));
  });

  it('does NOT exclude git (distributable)', () => {
    assert.ok(!isExcludedSkill('git'));
  });

  it('does NOT exclude code-review (distributable)', () => {
    assert.ok(!isExcludedSkill('code-review'));
  });

  it('does NOT exclude ci-validate (distributable)', () => {
    assert.ok(!isExcludedSkill('ci-validate'));
  });
});
