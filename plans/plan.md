# aramirez-ai — Restructuring Plan

## Goal

Consolidate all CLI commands into a single **action-first** pattern: `arai <verb> [type] [name]`.

## Target CLI Contract

```
arai init <dir>                    # scaffold project
arai install [type] [name]         # install platform or component
arai uninstall [type] [name]       # uninstall platform or component
arai sync [type] [name]            # sync project or component (skill only for now)
arai status                        # show status
arai update                        # pull + install
arai list <resource>               # skills, agents, scripts, templates, commands, mcp
arai generate <type> [name]        # skill, agent, script, command, brand
arai generate kb [dir]              # special: create obsidian vault
```

All commands share `--project <dir>` (default `.`) where applicable.

## What changes

| Command | Status | Action |
|---------|--------|--------|
| `install [type] [name]` | ✓ stays | — |
| `uninstall [type] [name]` | ✓ stays | — |
| `sync` | ✗ modify | Add `[type] [name]`, add `--project` |
| `sync skill <name>` | ✗ new | Replaces `skills sync --skill <name>` |
| `sync skill` (no name) | ✗ new | Replaces `skills sync` (sync all) |
| `list templates` | ✓ stays | — |
| `template list` | ✗ remove | Duplicate of `list templates` |
| `skills sync` | ✗ remove | Replaced by `sync skill` |
| `generate kb [dir]` | ✗ changed | Moved from `kb install` to `generate kb` — kb is a generator, not an installable component |

## Step-by-step

### Step 1: Update tests (TDD — write first, they will fail)

- **1a** `tests/commands/skills-sync.test.js` — change all calls from `skills sync` to `sync skill`; replace `--skill <name>` flag with positional `[name]`
- **1b** `tests/commands/template.test.js` — delete file (duplicate of `list.test.js`)

### Step 2: Modify `bin/arai.js`

- **2a** Remove `template` command group (lines 1156–1163)
- **2b** Remove `skills` command group (lines 1165–1178)
- **2c** Rewrite `sync` command to accept `[type] [name]` + `--project`
- **2d** Add `projectRoot` parameter to `syncProject()`

### Step 3: Update docs

- **3a** `AGENTS.md` — replace `skills sync` / `template list` entries
- **3b** `shared/templates/partials/AGENTS.md` — same changes
- **3c** `README.md` — same changes
- **3d** `PLAN.md` — update New CLI Contract section

### Step 4: Verify

- **4a** `npm test` — all 126 pass

## Progress

| Step | Status |
|------|--------|
| 1a  skills-sync.test.js | [✓] |
| 1b  template.test.js | [✓] |
| 2a  remove template group | [✓] |
| 2b  remove skills group | [✓] |
| 2c  rewrite sync command | [✓] |
| 2d  syncProject param | [✓] |
| 3a  AGENTS.md | [✓] |
| 3b  template partial AGENTS.md | [✓] |
| 3c  README.md | [✓] |
| 3d  PLAN.md | [✓] |
| 4a  npm test | [✓] |
