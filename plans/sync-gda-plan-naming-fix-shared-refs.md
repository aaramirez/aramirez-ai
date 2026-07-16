# Sync gda-ai Plan Naming + Fix shared/ References in Copied Artifacts

## Objective

Sincronizar los cambios del plan 015 de gda-ai (nomenclatura de planes + fix ci-validate) y resolver la inconsistencia donde los archivos copiados a `.opencode/` todavía referencian `shared/`.

## Requirements

1. **Plan naming convention** — priority: high
   - Add `plans/XXX-nombre-fecha-YYYY-MM-DD.md` format to `/plan` command
   - Update `plan-arai` agent Phase 4 with naming convention
   - Update `opencode.json` plan command template
   - Add plan naming rule to `code-style.md`

2. **ci-validate.js fix** — priority: high
   - Change all `shared/` references to `.opencode/` for project validation
   - Add plan name validation regex
   - Make script work in both contexts (aramirez-ai as source AND as installed project)

3. **Fix shared/ references in copied artifacts** — priority: high
   - When `arai init` copies scripts/commands to `.opencode/`, rewrite `shared/` paths to `.opencode/`
   - Commands (`getrepo.md`, `updaterepos.md`) reference `node shared/scripts/` → should be `node .opencode/scripts/`
   - Scripts have usage comments with `shared/scripts/` → should be `.opencode/scripts/`

## Architecture

### Problem Analysis

**Issue 1 (gda-ai sync):** The `/plan` command in aramirez-ai doesn't have the naming convention from gda-ai plan 015.

**Issue 2 (shared/ refs):** Files in `shared/` have hardcoded `shared/` paths. When `arai init --template full` copies them to `.opencode/`, the paths are broken because:
- `shared/commands/getrepo.md` → copied to `.opencode/commands/getrepo.md` but still says `node shared/scripts/getrepo.js`
- `shared/scripts/*.js` → copied to `.opencode/scripts/*.js` but usage comments say `node shared/scripts/`
- `shared/scripts/ci-validate.js` → checks for `shared/` directories which don't exist in installed projects

### Solution Approach

**For Issue 1:** Update source files in `shared/` with gda-ai changes.

**For Issue 2:** Add path rewriting in `scaffold.js` during copy. When copying files from `shared/` to `.opencode/`, replace `shared/` references with `.opencode/` in the content.

### Files to Create
None.

### Files to Modify

| File | Change |
|------|--------|
| `shared/commands/plan.md` | Add naming convention section |
| `shared/agents/plan-arai.md` | Update Phase 4 with naming convention |
| `opencode.json` | Update plan command template with auto-number |
| `shared/rules/code-style.md` | Add plan naming rule |
| `shared/scripts/ci-validate.js` | Fix shared/ → .opencode/, add plan validation |
| `shared/scripts/lib/scaffold.js` | Add `rewriteSharedRefs()` function during copy |
| `shared/commands/getrepo.md` | Update `shared/scripts/` → `.opencode/scripts/` |
| `shared/commands/updaterepos.md` | Update `shared/scripts/` → `.opencode/scripts/` |

## TDD Flow

### Phase 1: Write Failing Tests

1. **Test: plan naming convention exists**
   - `shared/commands/plan.md` contains "XXX-nombre-fecha-YYYY-MM-DD"
   - `opencode.json` plan template contains `<auto-number>`

2. **Test: ci-validate checks .opencode/ not shared/**
   - `shared/scripts/ci-validate.js` does NOT contain `shared/skills/` or `shared/scripts/` as required checks
   - Contains `.opencode/skills/` and `.opencode/scripts/` checks

3. **Test: copied artifacts don't reference shared/**
   - After `arai init --template full`, verify no `.opencode/commands/*.md` contains `shared/scripts/`
   - After `arai init --template full`, verify no `.opencode/scripts/*.js` contains `node shared/scripts/`

### Phase 2: Implement

1. Update `shared/commands/plan.md` with naming convention
2. Update `shared/agents/plan-arai.md` Phase 4
3. Update `opencode.json` plan command template
4. Update `shared/rules/code-style.md` with plan naming rule
5. Update `shared/scripts/ci-validate.js` (fix refs + add plan validation)
6. Add `rewriteSharedRefs()` in `scaffold.js`
7. Update command files to use `.opencode/` paths

### Phase 3: Verify

- All tests pass
- `arai init /tmp/test-plan --template full` succeeds
- `ls /tmp/test-plan/.opencode/commands/` shows no `shared/` references
- `node /tmp/test-plan/.opencode/scripts/ci-validate.js --dir /tmp/test-plan` passes

## Verification

```bash
# Run tests
npm test

# Manual verification
arai init /tmp/verify-naming --template full

# Check no shared/ references in installed commands
grep -r "shared/" /tmp/verify-naming/.opencode/commands/ || echo "PASS: no shared/ refs"

# Check no shared/ references in installed scripts (usage comments)
grep -r "node shared/" /tmp/verify-naming/.opencode/scripts/ || echo "PASS: no shared/ refs"

# Check ci-validate works
node /tmp/verify-naming/.opencode/scripts/ci-validate.js --dir /tmp/verify-naming

# Check plan naming convention
grep -c "XXX-nombre-fecha" /tmp/verify-naming/.opencode/commands/plan.md
```
