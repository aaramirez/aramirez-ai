# Fix: `installPlatform` — solo copia de `shared/`, nunca de `.opencode/`

## Objective

Reescribir `installPlatform()` para que copie agents, commands y opencode.json desde `shared/` (fuente distribuible), eliminando toda dependencia de `.opencode/` (repo-local).

## Principle

> **`.opencode/` is local to aramirez-ai. Nothing from `.opencode/` should be copied to external projects.** All distribution comes from `shared/`.

## Status: COMPLETED

## Changes Made

### `shared/scripts/lib/install.js`
- `installPlatform()`: Now copies agents from `shared/agents/`, commands from `shared/commands/`, and opencode.json from `shared/templates/partials/opencode.json` (the partial that was previously dead code)
- `installAgent()`: Removed fallback to `.opencode/agents/` — only looks in `shared/agents/`

### `shared/scripts/lib/scaffold.js`
- `scaffoldOpencode()`: Now reads from `shared/templates/partials/opencode.json` instead of the repo's `opencode.json`. No more manual stripping of MCPs, skills.paths, or path rewriting — the partial is already clean.

### `shared/templates/partials/opencode.json`
- Added `plan` command registration
- Removed `skills.paths` (external projects use native discovery)
- Fixed `plan-arai` description: "docs/" → "plans/"

### Tests
- Created `tests/commands/install-platform.test.js` (8 tests validating shared/ sourcing)
- Updated `tests/integration/outcome-init.test.js` (skills count 12 → 14)

## Verification

- [x] No `REPO_ROOT/.opencode` references in `installPlatform()`
- [x] `shared/templates/partials/opencode.json` has plan command
- [x] All 96 tests pass (81 core + 15 status/generate)
- [x] New tests validate shared/ sourcing
- [x] `arai install --project /tmp/test` produces clean config
