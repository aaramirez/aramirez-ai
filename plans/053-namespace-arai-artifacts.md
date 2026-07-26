# Plan 053: Namespace Organization for Arai-Specific Artifacts (DEFERRED)

## Objective

Evaluate and implement namespace organization for arai-specific agents and commands to separate them from universal distributable artifacts.

## Status: DEFERRED

## Context

The user asked about organizing arai-specific artifacts:
- **Option A**: `.opencode/agents/arai/` and `.opencode/commands/arai/`
- **Option B**: `.opencode/arai/agents/` and `.opencode/arai/commands/`

## Research Findings

### How opencode discovers agents vs commands

**Agents:**
- Can have explicit `path` property in opencode.json: `"path": ".opencode/agents/plan-arai.md"`
- This means nested directories WORK - just change the path

**Commands:**
- Defined INLINE in opencode.json with `description` and `template`
- NO `path` property - they're not auto-discovered from files
- This means nested directories DON'T HELP - commands must stay in config

### Current state after Plan 052

- Distributable: 11 skills, 10 agents, 9 commands (commit, deploy, test, plan, etc.)
- Internal (excluded from full template): plan-arai agent, repos-sync/vault-pdf-export/ci-validate skills, getrepo/updaterepos/export-pdf commands

## Architecture Analysis

### Option A: `.opencode/agents/arai/` and `.opencode/commands/arai/`

**Agents (WORKS):**
```json
"plan-arai": {
  "path": ".opencode/agents/arai/plan-arai.md"
}
```
- Just change the path in config
- Clear separation from distributable agents

**Commands (DOESN'T WORK):**
```json
"getrepo": {
  "template": "..."  // Still inline, no path
}
```
- Commands must stay inline in opencode.json
- Putting .md files in subdirectory doesn't help
- Files would exist but not be used

### Option B: `.opencode/arai/agents/` and `.opencode/arai/commands/`

**Agents (WORKS):**
```json
"plan-arai": {
  "path": ".opencode/arai/agents/plan-arai.md"
}
```

**Commands (WORKS):**
- Same as Option A - commands stay inline

**Problems:**
- Breaks standard opencode directory structure
- Confusing: `.opencode/arai/agents/` vs `.opencode/agents/arai/`
- Non-standard layout may confuse future tooling

### Recommendation: Hybrid approach

Since commands MUST stay inline in opencode.json anyway, the namespace only helps with:
1. **File organization** - keeping arai-specific .md files in a clear location
2. **Agent discovery** - using the `path` property

**Best option: Option A with clarification**
- `.opencode/agents/arai/` for arai-specific agents (plan-arai, new-harness, etc.)
- `.opencode/commands/` stays flat (commands are inline anyway)
- Add comment in AGENTS.md explaining the organization

## Requirements

1. Determine which agents are "arai-specific" vs "distributable" — priority: high
2. Move arai-specific agents to `.opencode/agents/arai/` — priority: high
3. Update opencode.json paths for moved agents — priority: high
4. Update scaffold.js to install to new location — priority: high
5. Update tests for new paths — priority: medium
6. Document the namespace convention — priority: medium

## File Changes

### Files to Modify

- `opencode.json` — Update agent paths for arai-specific agents
- `shared/templates/partials/opencode.json` — Same
- `shared/scripts/lib/scaffold.js` — Update agent install path
- `tests/commands/init-harness.test.js` — Update path assertions

### Files to Move

- `.opencode/agents/plan-arai.md` → `.opencode/agents/arai/plan-arai.md`
- `.opencode/agents/new-harness.md` → `.opencode/agents/arai/new-harness.md`
- All *-creator agents → `.opencode/agents/arai/`

## TDD Flow

1. Write test asserting arai agents are in `.opencode/agents/arai/` → FAIL
2. Move agents and update config → PASS

## Verification

- [ ] `node --test tests/commands/init-harness.test.js` passes
- [ ] `arai init /tmp/test --template full` puts arai agents in `.opencode/agents/arai/`
- [ ] opencode can find agents at new path
