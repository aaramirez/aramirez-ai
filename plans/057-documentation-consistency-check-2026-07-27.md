# Consistency Check: .opencode vs shared vs Documentation

## Objective

Audit and fix inconsistencies between `.opencode/` (internal harness), `shared/` (distributable artifacts), `opencode.json` (runtime config), `AGENTS.md`, and `README.md`. Move lean to `shared/` for distribution.

## Current State Analysis

### Lean (Plan 024) — Currently in Wrong Location

| File | Current Location | Should Be |
|------|-----------------|-----------|
| `lean/SKILL.md` | `.opencode/skills/lean/` | `shared/skills/lean/` |
| `lean.md` (agent) | `.opencode/agents/lean.md` | `shared/agents/lean.md` |
| `lean-expert.md` | `.opencode/agents/lean-expert.md` | `shared/agents/lean-expert.md` |
| `lean.md` (command) | MISSING | `shared/commands/lean.md` |

**Why:** `.opencode/` is the internal harness. `shared/` is for distributable components installed via `arai install`. Lean must be in `shared/` so other projects can use it.

### AGENTS

| Source | Count | Status |
|--------|-------|--------|
| `.opencode/agents/` | 23 files | Internal harness agents |
| `shared/agents/` | 12 files | Distributable agents |
| `opencode.json` | 24 agents | Runtime config |

**Inconsistencies:**
- `README.md` lists removed agents (arch-*, pmo-*, quiz-admin, etc.) — stale docs
- After moving lean to `shared/`, `.opencode/agents/lean.md` and `lean-expert.md` should be removed (installed from `shared/`)

### SKILLS

| Source | Count | Status |
|--------|-------|--------|
| `.opencode/skills/` | 18 dirs | Creator skills (internal) |
| `shared/skills/` | 14 dirs | Distributable skills |

**Correct by design** — no overlap. After moving lean:
- `.opencode/skills/lean/` → removed (was incorrectly placed)
- `shared/skills/lean/` → new distributable skill

### COMMANDS

| Source | Count | Status |
|--------|-------|--------|
| `.opencode/commands/` | 7 files | Internal commands |
| `shared/commands/` | 12 files | Distributable commands |
| `opencode.json` | 8 commands | Runtime config |

**Inconsistencies:**
- `opencode.json` has `email` command — no `.md` file exists
- `opencode.json` has `lean` command — no `.md` file exists (should be in `shared/commands/`)

### SCRIPTS

| Source | Count | Status |
|--------|-------|--------|
| `.opencode/scripts/` | 5 files | Internal scripts |
| `shared/scripts/` | 4 files + lib/ | Distributable scripts |

**Correct by design.**

## Requirements

1. Move lean skill from `.opencode/skills/lean/` to `shared/skills/lean/` — priority: high
2. Move lean agent from `.opencode/agents/lean.md` to `shared/agents/lean.md` — priority: high
3. Move lean-expert from `.opencode/agents/lean-expert.md` to `shared/agents/lean-expert.md` — priority: high
4. Create lean command in `shared/commands/lean.md` — priority: high
5. Remove `.opencode/` copies of lean files (they come from `shared/` after install) — priority: high
6. Create missing `.opencode/commands/email.md` — priority: high
7. Fix `README.md` — remove stale agent refs, restore full skills table — priority: high
8. Verify `AGENTS.md` matches `opencode.json` — priority: medium

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Lean location | `shared/` | Distributable via `arai install`, not internal to harness |
| `.opencode/lean` copies | Remove | After `arai install skill lean`, files are copied to target project |
| `lean-expert` location | `shared/agents/` | Subagent travels with the lean skill package |
| `email` command | Create `.opencode/commands/email.md` | Registered in opencode.json, needs backing file |
| KB path in SKILL.md | Keep `../kb/` | Relative to project root, works after install |

## Files to Create

| File | Description |
|------|-------------|
| `shared/skills/lean/SKILL.md` | Lean KB navigation guide (moved from .opencode) |
| `shared/agents/lean.md` | Lean primary agent (moved from .opencode) |
| `shared/agents/lean-expert.md` | Lean expert subagent (moved from .opencode) |
| `shared/commands/lean.md` | `/lean` command template |
| `.opencode/commands/email.md` | `/email` command template |

## Files to Remove

| File | Reason |
|------|--------|
| `.opencode/skills/lean/SKILL.md` | Moved to shared/ |
| `.opencode/agents/lean.md` | Moved to shared/ |
| `.opencode/agents/lean-expert.md` | Moved to shared/ |

## Files to Modify

| File | Changes |
|------|---------|
| `README.md` | Remove stale agents (arch-*, pmo-*, quiz-admin, etc.), restore full skills table, fix commands |
| `AGENTS.md` | Verify matches opencode.json (already correct) |

## Verification

- [ ] `shared/skills/lean/SKILL.md` exists with correct frontmatter
- [ ] `shared/agents/lean.md` exists with correct frontmatter
- [ ] `shared/agents/lean-expert.md` exists with correct frontmatter
- [ ] `shared/commands/lean.md` exists
- [ ] `.opencode/skills/lean/` removed
- [ ] `.opencode/agents/lean.md` removed
- [ ] `.opencode/agents/lean-expert.md` removed
- [ ] `.opencode/commands/email.md` exists
- [ ] Every agent in `opencode.json` has a `.md` file (except `build`)
- [ ] Every command in `opencode.json` has a `.md` file
- [ ] `README.md` agents table matches `opencode.json`
- [ ] `README.md` skills table lists all 15 distributable skills (14 + lean)
- [ ] `README.md` commands table matches `opencode.json`
- [ ] `npm test` passes
