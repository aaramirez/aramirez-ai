# Plan 051: Install & Sync File Protection

## Objective

Add multi-tier file protection to `arai install`, `arai sync`, and `arai init` so that user-modified or project-specific files (AGENTS.md, repos.json, opencode.json, etc.) are never silently overwritten.

## Context

The `test-ai` repo implemented a three-tier protection system in `quiz/cli/install.js`:
1. **EXCLUDE** — files never traversed/copied at all
2. **PROTECTED** — skip unless `--force`
3. **ALWAYS_PROTECTED** — never skip even with `--force`

aramirez-ai has no such system. Currently:
- `installPlatform` overwrites `opencode.json` unconditionally (line 124)
- `syncProject` overwrites `opencode.json` unconditionally (line 38)
- `skillsSync` overwrites SKILL.md unconditionally (line 65)
- `scaffoldProject` overwrites AGENTS.md unconditionally (line 294)
- No mechanism to skip already-customized files

## Requirements

1. Define `SKIP_IF_EXISTS` list for files that should not be overwritten if already present in destination — priority: high
2. Add `--force` flag to `arai install`, `arai sync`, and `arai init` to override `SKIP_IF_EXISTS` — priority: high
3. Protect `opencode.json` from silent overwrite in install/sync — priority: high
4. Protect `AGENTS.md` from silent overwrite in init — priority: high
5. Protect `repos.json` from overwrite in all operations — priority: high
6. Protect SKILL.md from overwrite in `arai sync skill` — priority: medium
7. Skip internal-only files during sync (creator agents, lib/, etc.) — priority: medium
8. Add verbose/dry-run output showing which files are skipped — priority: medium
9. Write tests before implementation — priority: high

## Architecture

### Protection Categories

**SKIP_IF_EXISTS** — files that are skipped if they already exist at destination, overridable with `--force`:

| File | Why | Operations |
|------|-----|------------|
| `opencode.json` | User may have custom agents/MCP/plugins | install, sync |
| `AGENTS.md` | User may have custom instructions | init |
| `repos.json` | User-specific repo references | init |
| `package.json` | User may have added deps | init |
| `.gitignore` | User may have added entries | init (already merged) |
| `.opencode/skills/*/SKILL.md` | User may have local edits | sync skill |
| `.opencode/brand.json` | User may have custom branding | init |

**EXCLUDE_FROM_SYNC** — internal files that should never be synced to projects:

| Path | Why |
|------|-----|
| `.opencode/agents/*-creator.md` | Internal tooling, not for external projects |
| `.opencode/agents/plan-arai.md` | Internal |
| `.opencode/agents/new-harness.md` | Internal |
| `.opencode/agents/docs.md` | Internal (only shared version should be copied) |
| `.opencode/agents/reviewer.md` | Internal (only shared version should be copied) |
| `.opencode/agents/tester.md` | Internal (only shared version should be copied) |
| `.opencode/scripts/lib/` | Internal helper library |
| `.opencode/skills/distribution-pattern/` | Internal skill |
| `.opencode/skills/customize-opencode/` | Internal skill |
| `.opencode/skills/harness-generator/` | Internal skill |

### Files to Create

- `shared/scripts/lib/protection.js` — protection constants and helper functions
- `tests/commands/install-protection.test.js` — tests for protection logic

### Files to Modify

- `shared/scripts/lib/install.js` — add `--force` support, use protection checks
- `shared/scripts/lib/sync.js` — add protection checks, exclude internal files
- `shared/scripts/lib/scaffold.js` — add `--force` support for init
- `bin/arai.js` — add `--force` flag to install/sync/init commands

## Detailed Changes

### 1. `shared/scripts/lib/protection.js` (NEW)

```javascript
// Files that should NOT be overwritten if they exist at destination
// Overridable with --force
const SKIP_IF_EXISTS = [
  'opencode.json',
  'AGENTS.md',
  'repos.json',
  'package.json',
  '.gitignore',
];

// Paths that should never be synced from repo-level .opencode/ to project .opencode/
const EXCLUDE_FROM_SYNC = [
  // Creator agents — internal tooling
  'agent-creator.md',
  'architecture-creator.md',
  'command-creator.md',
  'config-creator.md',
  'flow-creator.md',
  'instructions-creator.md',
  'mcp-creator.md',
  'permission-creator.md',
  'plugin-creator.md',
  'prompt-creator.md',
  'reference-creator.md',
  'rule-creator.md',
  'script-creator.md',
  'skill-creator.md',
  'tool-creator.md',
  'new-harness.md',
  'plan-arai.md',
];

// Skills that are internal to aramirez-ai and should not be synced
const EXCLUDE_SKILLS_FROM_SYNC = [
  'distribution-pattern',
  'customize-opencode',
  'harness-generator',
];

function shouldSkip(relPath, force) {
  if (force) return false;
  return SKIP_IF_EXISTS.some(p => relPath === p || relPath.endsWith('/' + p));
}

function isExcludedFromSync(filename) {
  return EXCLUDE_FROM_SYNC.includes(filename);
}

function isExcludedSkill(name) {
  return EXCLUDE_SKILLS_FROM_SYNC.includes(name);
}

export { SKIP_IF_EXISTS, EXCLUDE_FROM_SYNC, EXCLUDE_SKILLS_FROM_SYNC, shouldSkip, isExcludedFromSync, isExcludedSkill };
```

### 2. `shared/scripts/lib/install.js` (MODIFY)

- Import `shouldSkip` from `./protection.js`
- Add `force` parameter to `installPlatform(projectRoot, { force } = {})`
- Before writing `opencode.json` (line 124): check `shouldSkip('opencode.json', force)`
- Before calling `updateAgentsMd`: check `shouldSkip('AGENTS.md', force)`
- Pass `force` through `installSkill`, `installAgent`, etc.
- Log skipped files with reason

### 3. `shared/scripts/lib/sync.js` (MODIFY)

- Import `shouldSkip`, `isExcludedFromSync`, `isExcludedSkill` from `./protection.js`
- In `syncProject`:
  - Filter out EXCLUDE_FROM_SYNC agents before copying
  - Check `shouldSkip('opencode.json', force)` before overwriting config
- In `skillsSync`:
  - Skip skills in EXCLUDE_SKILLS_FROM_SYNC
  - Check `shouldSkip` for SKILL.md before overwriting
- Add `force` parameter to both functions

### 4. `shared/scripts/lib/scaffold.js` (MODIFY)

- Import `shouldSkip` from `./protection.js`
- In `scaffoldProject`:
  - Check `shouldSkip('AGENTS.md', force)` before writing AGENTS.md
  - Check `shouldSkip('opencode.json', force)` before writing opencode.json
  - Check `shouldSkip('repos.json', force)` before writing repos.json
- Add `force` parameter to `scaffoldProject`

### 5. `bin/arai.js` (MODIFY)

- Add `--force` option to `install`, `sync`, and `init` commands
- Pass `force` flag to underlying functions

## TDD Flow

### Tests First

1. **`tests/commands/install-protection.test.js`**:
   - `shouldSkip` returns true for opencode.json when force=false
   - `shouldSkip` returns false for opencode.json when force=true
   - `shouldSkip` returns true for AGENTS.md when force=false
   - `shouldSkip` returns false for AGENTS.md when force=true
   - `isExcludedFromSync` returns true for creator agents
   - `isExcludedFromSync` returns false for distributable agents
   - `isExcludedSkill` returns true for internal skills
   - `isExcludedSkill` returns false for distributable skills

2. **Integration tests in `tests/commands/install.test.js`**:
   - `arai install` does NOT overwrite existing opencode.json
   - `arai install --force` DOES overwrite existing opencode.json
   - `arai install skill` does NOT overwrite existing SKILL.md
   - `arai install skill --force` DOES overwrite existing SKILL.md

3. **Integration tests in `tests/commands/skills-sync.test.js`**:
   - `arai sync` does NOT overwrite existing opencode.json
   - `arai sync --force` DOES overwrite
   - `arai sync` skips creator agents
   - `arai sync skill` does NOT overwrite existing SKILL.md

4. **Integration tests in `tests/commands/init.test.js`**:
   - `arai init` on existing project does NOT overwrite AGENTS.md
   - `arai init --force` DOES overwrite AGENTS.md

### Implementation

1. Create `protection.js` with constants and helpers
2. Update `install.js` to use protection checks
3. Update `sync.js` to use protection checks and exclusions
4. Update `scaffold.js` to use protection checks
5. Update `bin/arai.js` to add `--force` flag

### Refactor

- Ensure all tests still pass after cleanup

## Verification

- [ ] `node --test tests/commands/install-protection.test.js` passes
- [ ] `node --test tests/commands/install.test.js` passes
- [ ] `node --test tests/commands/install-platform.test.js` passes
- [ ] `node --test tests/commands/skills-sync.test.js` passes
- [ ] `node --test tests/commands/init.test.js` passes
- [ ] `node --test tests/commands/init-harness.test.js` passes
- [ ] `node --test tests/integration/lifecycle.test.js` passes
- [ ] Manual: `arai install` in a project with custom opencode.json does NOT overwrite it
- [ ] Manual: `arai install --force` DOES overwrite it
- [ ] Manual: `arai sync` skips creator agents in destination
- [ ] AGENTS.md updated if needed

## Risk Assessment

- **Low risk**: Protection is additive — existing behavior preserved when `--force` is used
- **Edge case**: Projects installed before this change will have opencode.json protected on next sync (desired behavior)
- **Migration**: No migration needed — protection activates based on file existence at destination
