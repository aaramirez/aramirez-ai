# Add getrepo and updaterepos commands to .opencode + update docs

## Objective

Add the `getrepo` and `updaterepos` commands to `.opencode/` (self-contained, no shared/ dependencies), register them in `opencode.json`, and update all documentation.

## Requirements

1. Copy `shared/scripts/getrepo.js` → `.opencode/scripts/getrepo.js` — priority: high
2. Copy `shared/scripts/updaterepos.js` → `.opencode/scripts/updaterepos.js` — priority: high
3. Create `.opencode/commands/getrepo.md` referencing `.opencode/scripts/` — priority: high
4. Create `.opencode/commands/updaterepos.md` referencing `.opencode/scripts/` — priority: high
5. Register both commands in `opencode.json` referencing `.opencode/scripts/` — priority: high
6. Update README.md opencode commands table — priority: high
7. Update README.md scripts section — priority: medium
8. Update README.md shared/ description counts — priority: medium
9. Update AGENTS.md available scripts table — priority: medium
10. Add tests validating the new commands and scripts — priority: high

## Architecture

### Constraint

**`.opencode/` must be self-contained** — no references to `shared/` paths. Scripts must be in `.opencode/scripts/`, commands must reference `.opencode/scripts/`.

### Source files (already exist in `shared/`)

| File | Lines | Description |
|------|-------|-------------|
| `shared/commands/getrepo.md` | 13 | Command template (source for adaptation) |
| `shared/commands/updaterepos.md` | 10 | Command template (source for adaptation) |
| `shared/scripts/getrepo.js` | 147 | CLI: add repo to repos.json + clone |
| `shared/scripts/updaterepos.js` | 122 | CLI: git pull --ff-only all repos |

### New files (4)

| File | Source | Notes |
|------|--------|-------|
| `.opencode/scripts/getrepo.js` | `shared/scripts/getrepo.js` | Copy as-is — ROOT calculation (`__dirname/../..`) works from `.opencode/scripts/` |
| `.opencode/scripts/updaterepos.js` | `shared/scripts/updaterepos.js` | Copy as-is — ROOT calculation works identically |
| `.opencode/commands/getrepo.md` | `shared/commands/getrepo.md` | Adapt: `shared/scripts/` → `.opencode/scripts/` |
| `.opencode/commands/updaterepos.md` | `shared/commands/updaterepos.md` | Adapt: `shared/scripts/` → `.opencode/scripts/` |

### Modified files (5)

| File | Change |
|------|--------|
| `opencode.json` | Add `getrepo` and `updaterepos` to `command` section (reference `.opencode/scripts/`) |
| `README.md` | Add commands to opencode commands table, scripts to .opencode/scripts/ table, update counts |
| `AGENTS.md` | Add getrepo.js and updaterepos.js to available scripts table |
| `tests/commands/command-templates.test.js` | Add template validation tests for new commands |
| `tests/shared/commands.test.js` | Add 'getrepo' and 'updaterepos' to EXPECTED_COMMANDS |

### Key decisions

1. **Scripts copied as-is**: The `ROOT = join(__dirname, '..', '..')` calculation works from both `shared/scripts/` and `.opencode/scripts/` (both 2 levels deep from project root). No code changes needed in the scripts.

2. **Commands adapted**: The `.md` command files change `shared/scripts/` → `.opencode/scripts/` in the `node` command references.

3. **opencode.json templates adapted**: Same path change from `shared/scripts/` → `.opencode/scripts/`.

4. **Shared/ retains originals**: The files in `shared/` stay as-is — they're the distributable source. `.opencode/` has its own self-contained copies.

## TDD Flow

### Step 1: Write tests → FAIL

1. Add `getrepo` and `updaterepos` to `EXPECTED_COMMANDS` in `tests/shared/commands.test.js`
2. Add template validation tests in `tests/commands/command-templates.test.js`
3. Run tests → FAIL (commands/scripts not in .opencode/ yet)

### Step 2: Implement → PASS

1. Copy scripts to `.opencode/scripts/`
2. Create commands in `.opencode/commands/` (with adapted paths)
3. Register in `opencode.json`
4. Update README.md and AGENTS.md
5. Run tests → PASS

### Step 3: Refactor → still PASS

- Verify no regressions
- Full suite passes

## Verification

- [ ] `.opencode/scripts/getrepo.js` exists and runs
- [ ] `.opencode/scripts/updaterepos.js` exists and runs
- [ ] `.opencode/commands/getrepo.md` references `.opencode/scripts/` (not `shared/`)
- [ ] `.opencode/commands/updaterepos.md` references `.opencode/scripts/` (not `shared/`)
- [ ] `opencode.json` command templates reference `.opencode/scripts/`
- [ ] `node --test tests/shared/commands.test.js` — PASS
- [ ] `node --test tests/commands/command-templates.test.js` — PASS
- [ ] `npm test` — all tests PASS
