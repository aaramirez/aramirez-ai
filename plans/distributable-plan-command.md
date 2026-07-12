# Distributable /plan Command

## Objective

Make the `/plan` command available to all arai-generated projects by creating it as a distributable artifact in `shared/commands/`, registering it in opencode.json, and ensuring `arai list commands` reports it.

## Requirements

1. Create `shared/commands/plan.md` — distributable command file — priority: high
2. Register `/plan` in opencode.json `command` section — priority: high
3. Fix `listCommands()` to read from BOTH `.opencode/commands/` AND `shared/commands/` — priority: medium
4. Update `tests/shared/commands.test.js` to include `plan` in EXPECTED_COMMANDS — priority: high
5. Update `tests/commands/list.test.js` to assert `plan` is listed — priority: medium
6. Register `plan` in opencode.json `agent` section with proper `.md` file — priority: high

## Architecture

### Current State

| Artifact | Local (`.opencode/`) | Shared (`shared/`) | opencode.json |
|----------|---------------------|--------------------|---------------|
| `/plan` command | `.opencode/commands/plan.md` ✅ | ❌ Missing | ❌ Not registered |
| `plan` agent | ❌ No `.md` file | ❌ N/A | Registered (bare config, no path) |
| `plan-arai` agent | `.opencode/agents/plan-arai.md` ✅ | `shared/agents/plan-arai.md` ✅ | Registered with path ✅ |

### Target State

| Artifact | Local (`.opencode/`) | Shared (`shared/`) | opencode.json |
|----------|---------------------|--------------------|---------------|
| `/plan` command | ✅ | `shared/commands/plan.md` ✅ | `command.plan` registered ✅ |
| `plan` agent | `.opencode/agents/plan.md` ✅ | N/A | Registered with path ✅ |
| `plan-arai` agent | ✅ | ✅ | ✅ |

### Decisions

1. **Command in `shared/commands/plan.md`**: Copied from `.opencode/commands/plan.md` with minor formatting adjustments. The command content is generic enough for any project (not arai-specific).

2. **`plan` agent gets a `.md` file**: Create `.opencode/agents/plan.md` as a minimal planning agent (edit: deny, mode: primary). This fixes the bare config entry that currently has no instructions.

3. **`listCommands()` reads both dirs**: Currently only reads `.opencode/commands/`. Should also read `shared/commands/` for the arai repo itself, since some commands live in shared/.

4. **No changes to install flow**: Commands are already installed as a side effect of `arai install skill`. The `plan` command doesn't need a matching skill — it's a standalone command. When distributed via `arai init --template full`, commands from `shared/commands/` are already copied.

## File Changes

### New Files

| File | Purpose |
|------|---------|
| `shared/commands/plan.md` | Distributable `/plan` command |
| `.opencode/agents/plan.md` | Plan agent definition file |

### Modified Files

| File | Change |
|------|--------|
| `opencode.json` | Add `plan` to `command` section + add `path` to `plan` agent |
| `shared/scripts/lib/list.js` | Update `listCommands()` to read from `shared/commands/` too |
| `tests/shared/commands.test.js` | Add `'plan'` to `EXPECTED_COMMANDS` |
| `tests/commands/list.test.js` | Add assertion for `plan` in `arai list commands` output |

## TDD Flow

### Phase 1: Tests (MUST FAIL)

1. Add `'plan'` to `EXPECTED_COMMANDS` in `tests/shared/commands.test.js`
   - Test `plan.md exists in shared/commands/` → FAIL (file doesn't exist)

2. Add `plan` assertion to `tests/commands/list.test.js`
   - Test `arai list commands includes plan` → may PASS (reads from `.opencode/commands/`) or FAIL depending on `listCommands()` implementation

3. Add test in `tests/commands/command-templates.test.js` or new test file
   - Test `opencode.json command.plan exists with description and template` → FAIL (not registered)

### Phase 2: Implementation

1. Create `shared/commands/plan.md` (copy from `.opencode/commands/plan.md`)
2. Create `.opencode/agents/plan.md` (minimal plan agent)
3. Register `plan` in opencode.json `command` section
4. Add `path` to `plan` agent in opencode.json
5. Update `listCommands()` in `shared/scripts/lib/list.js`

### Phase 3: Refactor

- Verify all tests pass
- Verify `arai list commands` shows `plan`
- Verify `arai generate command plan` still works

## Verification

- [ ] `npm test` — all tests pass
- [ ] `arai list commands` — shows `/plan` with description
- [ ] `shared/commands/plan.md` exists with valid frontmatter
- [ ] `.opencode/agents/plan.md` exists with valid frontmatter
- [ ] `opencode.json` has `command.plan` entry
- [ ] `opencode.json` agent `plan` has `path` pointing to `.md` file
