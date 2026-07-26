> **DEPRECATED**: This plan references `arai generate`, which has been removed from the CLI.
> Creators (`.opencode/scripts/create-*.js`) are the canonical way to generate artifacts.
> See `plans/remove-arai-generate.md` for details.
>
# Plan: Move Creator Artifacts from shared/ to .opencode/

## Context

The `shared/` directory should only contain **distributable artifacts** — things that `arai install` copies to other projects. The 15 *-creator skills and 16 create-*.js scripts are **internal tooling** for aramirez-ai only. They should live in `.opencode/` alongside the agents that use them.

## Current State

```
shared/
├── skills/           ← 15 creator skills + 12 distributable skills (MIXED)
│   ├── config-creator/     ← should move (internal)
│   ├── agent-creator/      ← should move (internal)
│   ├── branding/           ← stays (distributable)
│   ├── email/              ← stays (distributable)
│   └── ...
├── scripts/          ← 16 create scripts + 6 distributable scripts + lib/ (MIXED)
│   ├── create-agent.js     ← should move (internal)
│   ├── create-base.js      ← should move (internal, shared by all create-*.js)
│   ├── ci-validate.js      ← stays (distributable)
│   ├── mcp-email.js        ← stays (distributable)
│   └── ...
```

## Target State

```
.opencode/
├── agents/           ← (existing, unchanged)
├── skills/           ← creator skills MOVED here
│   ├── config-creator/SKILL.md
│   ├── agent-creator/SKILL.md
│   ├── ... (15 total)
│   └── harness-generator/SKILL.md  ← already here
├── scripts/          ← creator scripts MOVED here (NEW directory)
│   ├── create-base.js
│   ├── create-agent.js
│   ├── create-config.js
│   └── ... (16 total)

shared/
├── skills/           ← ONLY distributable skills (12 remaining)
│   ├── branding/
│   ├── email/
│   └── ...
├── scripts/          ← ONLY distributable scripts + lib/
│   ├── ci-validate.js
│   ├── mcp-email.js
│   ├── send-email.js
│   ├── youtube-transcript.js
│   ├── docgen-vault.js
│   ├── repos-sync.js
│   └── lib/           ← (unchanged)
```

## Why .opencode/scripts/ ?

- `.opencode/` is already the "local to aramirez-ai" directory
- Agent .md files live here, skills live here → scripts that those skills reference should also live here
- The path becomes shorter and clearer: `node .opencode/skills/agent-creator/scripts/create-agent.js` instead of `node shared/scripts/create-agent.js`
- opencode doesn't process `.opencode/scripts/` — it's just a directory convention we own

---

## Phase 1: Move Files

### 1A. Move 15 creator skills

```bash
# Move each creator skill from shared/skills/ to .opencode/skills/
for skill in config-creator permission-creator instructions-creator agent-creator \
  architecture-creator flow-creator skill-creator mcp-creator command-creator \
  script-creator prompt-creator rule-creator reference-creator plugin-creator tool-creator; do
  mv shared/skills/$skill .opencode/skills/$skill
done
```

### 1B. Move 16 creator scripts

```bash
# Create new directory
mkdir -p .opencode/scripts

# Move all create-*.js files
mv shared/scripts/create-base.js .opencode/scripts/
mv shared/scripts/create-agent.js .opencode/scripts/
mv shared/scripts/create-architecture.js .opencode/scripts/
mv shared/scripts/create-command.js .opencode/scripts/
mv shared/scripts/create-config.js .opencode/scripts/
mv shared/scripts/create-flow.js .opencode/scripts/
mv shared/scripts/create-instructions.js .opencode/scripts/
mv shared/scripts/create-mcp.js .opencode/scripts/
mv shared/scripts/create-permission.js .opencode/scripts/
mv shared/scripts/create-plugin.js .opencode/scripts/
mv shared/scripts/create-prompt.js .opencode/scripts/
mv shared/scripts/create-reference.js .opencode/scripts/
mv shared/scripts/create-rule.js .opencode/scripts/
mv shared/scripts/create-script.js .opencode/scripts/
mv shared/scripts/create-skill.js .opencode/scripts/
mv shared/scripts/create-tool.js .opencode/scripts/
```

---

## Phase 2: Update References in Agent .md Files

**12 files** in `.opencode/agents/` — each references `node shared/scripts/create-*.js`

Change: `shared/scripts/` → `.opencode/scripts/`

| File | Line | Old | New |
|------|------|-----|-----|
| `.opencode/agents/config-creator.md` | 22 | `node shared/scripts/create-config.js` | `node .opencode/skills/config-creator/scripts/create-config.js` |
| `.opencode/agents/permission-creator.md` | ~22 | `node shared/scripts/create-permission.js` | `node .opencode/skills/permission-creator/scripts/create-permission.js` |
| `.opencode/agents/instructions-creator.md` | ~22 | `node shared/scripts/create-instructions.js` | `node .opencode/skills/instructions-creator/scripts/create-instructions.js` |
| `.opencode/agents/mcp-creator.md` | ~22 | `node shared/scripts/create-mcp.js` | `node .opencode/skills/mcp-creator/scripts/create-mcp.js` |
| `.opencode/agents/architecture-creator.md` | ~22 | `node shared/scripts/create-architecture.js` | `node .opencode/skills/architecture-creator/scripts/create-architecture.js` |
| `.opencode/agents/flow-creator.md` | ~22 | `node shared/scripts/create-flow.js` | `node .opencode/skills/flow-creator/scripts/create-flow.js` |
| `.opencode/agents/plugin-creator.md` | ~22 | `node shared/scripts/create-plugin.js` | `node .opencode/skills/plugin-creator/scripts/create-plugin.js` |
| `.opencode/agents/tool-creator.md` | ~22 | `node shared/scripts/create-tool.js` | `node .opencode/skills/tool-creator/scripts/create-tool.js` |
| `.opencode/agents/prompt-creator.md` | ~22 | `node shared/scripts/create-prompt.js` | `node .opencode/skills/prompt-creator/scripts/create-prompt.js` |
| `.opencode/agents/rule-creator.md` | ~22 | `node shared/scripts/create-rule.js` | `node .opencode/skills/rule-creator/scripts/create-rule.js` |
| `.opencode/agents/reference-creator.md` | ~22 | `node shared/scripts/create-reference.js` | `node .opencode/skills/reference-creator/scripts/create-reference.js` |
| `.opencode/agents/command-creator.md` | ~22 | `node shared/scripts/create-command.js` | `node .opencode/skills/command-creator/scripts/create-command.js` |

### 2B. Fix stale reference in new-harness.md

`new-harness.md` line 63 references `shared/scripts/harness-generator.js` which was **deleted** in the previous session. Remove or update that section (harness generation now uses individual create-*.js scripts, not a monolithic generator).

---

## Phase 3: Update SKILL.md Content References

Each creator skill's SKILL.md has:
- `scripts:` frontmatter field — just filenames (`create-config.js`), **no path change needed**
- **Content body** — references `shared/scripts/create-*.js` in examples → must change to `.opencode/scripts/create-*.js`

**15 creator skills** with `shared/scripts/` references in content (49 total matches):

| Skill | Matches | Change |
|-------|---------|--------|
| agent-creator | 6 | `shared/scripts/create-agent.js` → `.opencode/skills/agent-creator/scripts/create-agent.js` |
| config-creator | 3 | `shared/scripts/create-config.js` → `.opencode/skills/config-creator/scripts/create-config.js` |
| permission-creator | 3 | `shared/scripts/create-permission.js` → `.opencode/skills/permission-creator/scripts/create-permission.js` |
| instructions-creator | 3 | `shared/scripts/create-instructions.js` → `.opencode/skills/instructions-creator/scripts/create-instructions.js` |
| architecture-creator | 1 | `shared/scripts/create-architecture.js` → `.opencode/skills/architecture-creator/scripts/create-architecture.js` |
| flow-creator | 1 | `shared/scripts/create-flow.js` → `.opencode/skills/flow-creator/scripts/create-flow.js` |
| mcp-creator | 1 | `shared/scripts/create-mcp.js` → `.opencode/skills/mcp-creator/scripts/create-mcp.js` |
| command-creator | 1 | `shared/scripts/create-command.js` → `.opencode/skills/command-creator/scripts/create-command.js` |
| plugin-creator | 1 | `shared/scripts/create-plugin.js` → `.opencode/skills/plugin-creator/scripts/create-plugin.js` |
| tool-creator | 1 | `shared/scripts/create-tool.js` → `.opencode/skills/tool-creator/scripts/create-tool.js` |
| prompt-creator | 1 | `shared/scripts/create-prompt.js` → `.opencode/skills/prompt-creator/scripts/create-prompt.js` |
| rule-creator | 1 | `shared/scripts/create-rule.js` → `.opencode/skills/rule-creator/scripts/create-rule.js` |
| reference-creator | 1 | `shared/scripts/create-reference.js` → `.opencode/skills/reference-creator/scripts/create-reference.js` |
| skill-creator | 1 | `shared/scripts/create-skill.js` → `.opencode/skills/skill-creator/scripts/create-skill.js` |
| script-creator | 1 | `shared/scripts/create-script.js` → `.opencode/skills/script-creator/scripts/create-script.js` |

**DO NOT touch** these non-creator skills that also reference `shared/scripts/`:
- `email/SKILL.md` — references `send-email.js`, `mcp-email.js` (distributable, stays)
- `youtube/SKILL.md` — references `youtube-transcript.js` (distributable, stays)
- `vault-pdf-export/SKILL.md` — references `docgen-vault.js` (distributable, stays)
- `document-generation/SKILL.md` — references `docgen/build-*.js` (distributable, stays)

---

## Phase 4: Update Test Files

### 4A. `tests/consistency/creator-skills.test.js`

- Line 7: `SKILLS_DIR` changes from `shared/skills` → `.opencode/skills`
- Line 54-57: Reference assertion changes from `shared/scripts/` → `.opencode/scripts/`

### 4B. `tests/consistency/subagents.test.js`

- Line 52-58: Script reference assertion — update path from `shared/scripts/` → `.opencode/scripts/`

### 4C. `tests/commands/create-scripts.test.js`

- Line 7: `SCRIPTS_DIR` changes from `shared/scripts` → `.opencode/scripts`

### 4D. `tests/integration/harness-generation.test.js`

- Line 9: `SCRIPTS_DIR` changes from `shared/scripts` → `.opencode/scripts`

### 4E. `tests/consistency/updated-skills.test.js`

- Lines 9, 19, 24: Paths change from `shared/skills/agent-creator/SKILL.md` → `.opencode/skills/agent-creator/SKILL.md`

### 4F. `tests/consistency/skills.test.js`

- This test scans ALL skills in `shared/skills/` — after the move, creator skills won't be there. Need to verify this test still makes sense (it should only test distributable skills now).

### 4G. `tests/consistency/eliminated-skills.test.js`

- No changes needed (already tests that eliminated skills DON'T exist in shared/)

### 4H. `tests/consistency/platforms.test.js`

- Line 39-42: Validates `opencode.json` skills paths include `../shared/skills` — still valid (distributable skills remain there)

### 4I. `tests/commands/create-agent-consolidated.test.js`

- Line 9: References `create-agent.js` — needs path update to `.opencode/scripts/`

### 4J. `tests/commands/init-harness.test.js`

- Lines 139-148: Tests that `arai init` creates `create-base.js` and `create-agent.js` in `shared/scripts/`
  - **Option A**: Update to check `.opencode/scripts/` (if init copies from new location)
  - **Option B**: Remove these tests (if init no longer copies creator scripts to new projects)
  - **Recommendation**: Option B — creator scripts are internal to aramirez-ai, new projects don't need them

### 4K. `tests/commands/install.test.js`

- Line 98, 180: Tests `arai install script <name>` copies to/from `shared/scripts/`
  - Still valid for distributable scripts (ci-validate, mcp-email, etc.)
  - No change needed

### 4L. `tests/commands/generate.test.js`

- Line 52: Tests `arai generate script <name>` creates `shared/scripts/<name>.js`
  - Still valid for distributable scripts
  - No change needed

### 4M. `tests/integration/docgen-cross-harness.test.js`

- Line 43: Tests `shared/scripts/docgen/` has all 12 scripts
  - No change needed (docgen stays in shared/scripts/)

### 4N. `tests/integration/outcome-init.test.js`

- Lines 119-126: Lists expected full template skills — currently includes creator skills AND deleted ones (`harness-creator`, `specialized-agent-creator`, `subagent-creator`)
  - Remove all *-creator skills from expected list (they're no longer in `shared/skills/`)
  - Remove deleted skills (`harness-creator`, `specialized-agent-creator`, `subagent-creator`)
  - Only distributable skills should remain: `branding`, `code-review`, `content-ingestion`, `document-generation`, `email`, `git`, `google-workspace`, `kb-management`, `m365`, `pdf-extraction`, `vault-pdf-export`, `youtube`

### 4J. `tests/integration/opencode-debug-validation.test.js`

- Line 60-63: Validates harness-generator skill — no change needed (already in .opencode/skills/)

---

## Phase 5: Update opencode.json

**File:** `opencode.json`

The `skills.paths` already includes `.opencode/skills` as the first entry. After moving creator skills there, they'll be found automatically. No change needed to skills paths.

BUT: check if any agent entries reference script paths. They don't (agents are defined by .md files). ✅ No change needed.

---

## Phase 6: Update Documentation

### 6A. `AGENTS.md`

| Line | Section | Change |
|------|---------|--------|
| 83 | Skills list | Update: creator skills now live in `.opencode/skills/` not `shared/skills/` |
| 97-108 | "Harness Creator Scripts" | Change `shared/scripts/` → `.opencode/scripts/` in all examples |
| 167-174 | Install behavior table | Update script source path |

### 6B. `README.md`

| Section | Change |
|---------|--------|
| Skills table (~line 420-437) | Remove creator skills from shared/skills list, note they're in .opencode/skills/ |
| Scripts table (~line 451-471) | Remove create-*.js from shared/scripts list, note they're in .opencode/scripts/ |
| Stale refs | Remove references to deleted: create-subagent.js, create-specialized-agent.js, harness-generator.js |

### 6C. `shared/scripts/ci-validate.js`

- Line 63: `shared/skills/` directory check — still valid (distributable skills remain)
- Lines 192-203: Creator scripts TODO guard — update path to `.opencode/scripts/`

### 6D. `bin/arai.js`

- Line 116: `'Create a new skill in shared/skills/<name>/SKILL.md'` — still valid for distributable skills

### 6E. `.opencode/skills/harness-generator/SKILL.md`

- Lines 214, 217: Fix dangling references to `harness-creator` and `subagent-creator` (these are deleted, not moved)
- Lines 215-216, 218: Update paths from `../../../shared/skills/` → `../../skills/` (since harness-generator is now in .opencode/skills/ alongside the creator skills)

### 6F. Tutoriales (stale references)

These files reference **deleted** artifacts (not just moved). They need updating too:
- `tutoriales-arai/06-Skills/04-creator-skills.md`
- `tutoriales-arai/05-Harness/02-creator-scripts.md`
- `tutoriales-arai/05-Harness/03-harness-generator.md`
- `tutoriales-arai/05-Harness/04-ciclo-completo.md`
- `tutoriales-arai/04-Agentes/06-uso-creators.md`
- `tutoriales-arai/04-Agentes/03-agentes-especializados.md`
- `tutoriales-arai/11-Casos-de-uso/04-crear-harness-completo.md`
- `tutoriales-arai/00-Introduccion/02-como-extender.md`

### 6G. Curso IA (stale references)

- `curso-ia/Módulo 6 — Harness en OpenCode/` — multiple files reference `create-specialized-agent.js`

---

## Phase 7: Update Plan Files (optional, historical)

These are historical plans — low priority but could be updated for consistency:
- `plans/architecture-cleanup.md`
- `plans/creator-skills-cleanup.md`
- `plans/harness-course-plan.md`

---

## Phase 8: Scaffold Impact (arai init)

The `shared/scripts/lib/scaffold.js` copies files from `shared/` to new projects:
- Skills: `shared/skills/<name>/SKILL.md` → `.opencode/skills/<name>/SKILL.md`
- Scripts: `shared/scripts/<name>.js` → `shared/scripts/<name>.js`

**After moving creator artifacts out of `shared/`:**
- `"skills": ["*"]` wildcard copies only distributable skills (correct ✅)
- `"scripts": ["*"]` wildcard copies only distributable scripts (correct ✅)
- Creator skills/scripts are NOT copied to new projects (correct — they're internal ✅)

**No changes needed to scaffold.js** — the move naturally excludes creator artifacts from new projects.

The `full` template (`shared/templates/full/template.json`) currently has `"scripts": ["*"]`. After the move, this will only include: ci-validate.js, mcp-email.js, send-email.js, youtube-transcript.js, docgen-vault.js, repos-sync.js, lib/. The create-*.js scripts won't be included — which is correct.

---

## Execution Order

1. **Move files** (Phase 1) — git mv for clean history
2. **Update agent .md files** (Phase 2) — 12 files + new-harness.md stale fix
3. **Update SKILL.md content** (Phase 3) — grep + replace in 15 creator skills
4. **Update tests** (Phase 4) — 10+ test files
5. **Update documentation** (Phase 6A-6E) — AGENTS.md, README.md, harness-generator SKILL.md, ci-validate.js
6. **Update tutorials** (Phase 6F-6G) — stale reference cleanup
7. **Run tests** — `node --test tests/consistency/*.test.js tests/commands/*.test.js`
8. **Verify no dangling references** — grep for old paths
9. **Commit**

---

## Verification

```bash
# 1. Verify creator skills are in .opencode/skills/
ls .opencode/skills/ | grep -c creator  # should be 15

# 2. Verify creator scripts are in .opencode/scripts/
ls .opencode/scripts/ | grep -c create  # should be 16

# 3. Verify shared/skills/ only has distributable skills
ls shared/skills/  # should NOT contain *-creator dirs

# 4. Verify shared/scripts/ only has distributable scripts
ls shared/scripts/  # should NOT contain create-*.js

# 5. Run all tests
node --test tests/consistency/*.test.js tests/commands/*.test.js

# 6. Verify no dangling references
grep -r "shared/scripts/create-" tests/ .opencode/ --include="*.js" --include="*.md"
# should return NOTHING

grep -r "shared/skills/.*creator" tests/ .opencode/ --include="*.js" --include="*.md"
# should return NOTHING (except maybe plans/ historical files)
```

---

## Risk Assessment

- **Low risk**: Moving files is straightforward, git mv preserves history
- **Medium risk**: Tests may have hardcoded paths — caught by running tests
- **Scaffold impact**: `arai init` naturally stops copying creator artifacts to new projects (correct behavior)
- **Tutorials/curso-ia**: Many stale references to deleted artifacts — documentation-only, not functional
- **harness-generator SKILL.md**: Has dangling links to deleted skills — must fix

## Expected Final State

```
.opencode/
├── agents/        ← 17 agent .md files (unchanged)
├── skills/        ← 16 skills (15 creator + 1 harness-generator)
└── scripts/       ← 16 create-*.js + create-base.js (NEW)

shared/
├── skills/        ← 12 distributable skills (was 27)
├── scripts/       ← 6 distributable scripts + lib/ (was 22 + lib/)
├── agents/        ← unchanged
├── prompts/       ← unchanged
├── rules/         ← unchanged
└── templates/     ← unchanged
```
