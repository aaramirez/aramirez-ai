# Co-locate Scripts Within Skill Folders

## Objective

Reorganize `shared/skills/` so each skill bundles its own `scripts/` subdirectory, while preserving `shared/scripts/lib/` (arai CLI infrastructure) and handling standalone scripts (`ci-validate.js`, `repos-sync.js`).

---

## Current State Analysis

### Structure (today)

```
shared/
├── skills/           ← 14 skills, each with ONLY SKILL.md
│   ├── email/SKILL.md
│   ├── youtube/SKILL.md
│   └── ...
├── scripts/
│   ├── lib/                  ← arai CLI INTERNAL LIBRARY (8 files) — MUST STAY
│   │   ├── helpers.js        ← foundational utils (THE root dependency)
│   │   ├── install.js        ← install/uninstall logic
│   │   ├── scaffold.js       ← project scaffolding
│   │   ├── list.js           ← resource listing
│   │   ├── sync.js           ← config syncing
│   │   ├── status.js         ← status display + update
│   │   ├── agents-md.js      ← AGENTS.md generation
│   │   └── template-utils.js ← template loading + variable substitution
│   │
│   ├── send-email.js         ← SKILL SCRIPT (email)
│   ├── mcp-email.js          ← SKILL SCRIPT (email, MCP variant)
│   ├── youtube-transcript.js ← SKILL SCRIPT (youtube)
│   ├── ingest-content.js     ← SKILL SCRIPT (content-ingestion)
│   ├── extract-pdf.js        ← SKILL SCRIPT (pdf-extraction)
│   ├── create-brand.js       ← SKILL SCRIPT (branding)
│   ├── docgen-vault.js       ← SKILL SCRIPT (vault-pdf-export)
│   ├── kb-sync.js            ← SKILL SCRIPT (kb-management)
│   ├── ci-validate.js        ← STANDALONE (CI/CD validation, no skill owner)
│   ├── repos-sync.js         ← STANDALONE (repo management, no skill owner)
│   └── docgen/               ← SKILL SCRIPT (document-generation, 12 files)
│       ├── index.js, charts.js, build-deck.js, ...
│       └── (shared by vault-pdf-export via import)
├── prompts/           ← 1 file (commit-message.md)
├── rules/             ← 1 file (code-style.md)
├── commands/          ← 10 command .md files
└── agents/            ← agent .md files per skill
```

### Three Categories of Files in `shared/scripts/`

| Category | Files | Destination | Why |
|----------|-------|-------------|-----|
| **arai infrastructure** | `lib/` (8 files) | **STAYS in `shared/scripts/lib/`** | `bin/arai.js` imports via `../shared/scripts/lib/` — hardcoded path |
| **Skill scripts** (10 skills) | 10 files + `docgen/` (12) | **Moves to `shared/skills/<name>/scripts/`** | Co-locate with owning skill |
| **Standalone utilities** | `ci-validate.js`, `repos-sync.js` | **STAYS in `shared/scripts/`** | No owning skill; used by arai (`npm run validate`, `npm run repos`) |

### Critical: arai CLI Dependency on `shared/scripts/lib/`

```js
// bin/arai.js lines 7-12 — ALL imports from shared/scripts/lib/
import { VALID_TYPES, log, pkg } from '../shared/scripts/lib/helpers.js';
import { installPlatform, installSkill, ... } from '../shared/scripts/lib/install.js';
import { syncProject, skillsSync } from '../shared/scripts/lib/sync.js';
import { scaffoldProject, listTemplates } from '../shared/scripts/lib/scaffold.js';
import { listSkills, listAgents, listScripts, listCommands, listMcp } from '../shared/scripts/lib/list.js';
import { showStatus, doUpdate } from '../shared/scripts/lib/status.js';
```

**`lib/` CANNOT MOVE.** It is arai's private implementation. The import path `../shared/scripts/lib/` is hardcoded in `bin/arai.js`.

### Current Script Mapping (10 skills with scripts)

| Skill | `scripts:` in frontmatter | Actual file |
|-------|--------------------------|-------------|
| branding | `create-brand.js` | `shared/scripts/create-brand.js` |
| ci-validate | `ci-validate.js` | `shared/scripts/ci-validate.js` |
| content-ingestion | `ingest-content.js` | `shared/scripts/ingest-content.js` |
| document-generation | `docgen/` | `shared/scripts/docgen/` (12 files) |
| email | `send-email.js`, `mcp-email.js` | `shared/scripts/send-email.js`, `shared/scripts/mcp-email.js` |
| kb-management | `kb-sync.js` | `shared/scripts/kb-sync.js` |
| pdf-extraction | `extract-pdf.js` | `shared/scripts/extract-pdf.js` |
| repos-sync | `repos-sync.js` | `shared/scripts/repos-sync.js` |
| vault-pdf-export | `docgen-vault.js`, `docgen/` | `shared/scripts/docgen-vault.js`, `shared/scripts/docgen/` |
| youtube | `youtube-transcript.js` | `shared/scripts/youtube-transcript.js` |

**4 skills without scripts**: `code-review`, `git`, `google-workspace`, `m365`

---

## Target State

### New Structure

```
shared/
├── skills/
│   ├── email/
│   │   ├── SKILL.md
│   │   └── scripts/
│   │       ├── send-email.js
│   │       └── mcp-email.js
│   ├── youtube/
│   │   ├── SKILL.md
│   │   └── scripts/
│   │       └── youtube-transcript.js
│   ├── document-generation/
│   │   ├── SKILL.md
│   │   └── scripts/
│   │       └── docgen/           ← owned here
│   │           ├── index.js, charts.js, build-deck.js, ...
│   │           └── (12 files)
│   ├── vault-pdf-export/
│   │   ├── SKILL.md
│   │   └── scripts/
│   │       └── docgen-vault.js
│   ├── branding/
│   │   ├── SKILL.md
│   │   └── scripts/
│   │       └── create-brand.js
│   ├── code-review/
│   │   └── SKILL.md              ← no scripts (instruction-only)
│   ├── git/
│   │   └── SKILL.md              ← no scripts (instruction-only)
│   └── ... (same pattern for all 14)
│
├── scripts/
│   ├── lib/                      ← arai CLI library (UNTOUCHED)
│   │   ├── helpers.js, install.js, scaffold.js, ...
│   │   └── (8 files)
│   ├── ci-validate.js            ← standalone (no skill owner)
│   └── repos-sync.js             ← standalone (no skill owner)
│
├── prompts/                       ← unchanged
├── rules/                         ← unchanged
├── commands/                      ← unchanged
└── agents/                        ← unchanged
```

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **`lib/` stays** | `shared/scripts/lib/` untouched | `bin/arai.js` imports via hardcoded `../shared/scripts/lib/` |
| **Skill scripts** | Move to `shared/skills/<name>/scripts/` | Co-located — self-contained distributable unit |
| **`docgen/` ownership** | Lives in `document-generation/scripts/docgen/` | Primary owner is document-generation |
| **`vault-pdf-export` uses `docgen/`** | Frontmatter references `../document-generation/scripts/docgen/` | Explicit cross-skill dependency, no duplication |
| **Standalone scripts** | `ci-validate.js`, `repos-sync.js` stay in `shared/scripts/` | No owning skill; used by npm scripts and arai directly |
| **`shared/scripts/` NOT fully deleted** | Keeps `lib/` + 2 standalone files | arai depends on lib/; npm scripts depend on standalone files |
| **Install logic** | `install.js` reads scripts from skill dir, not flat dir | Matches new structure |
| **Prompts/rules** | Stay in `shared/prompts/` and `shared/rules/` | Only 1 file each — not worth co-locating yet |

---

## Requirements

1. Move 10 skill scripts from `shared/scripts/` into `shared/skills/<name>/scripts/` — priority: **high**
2. Update 10 SKILL.md frontmatter `scripts:` paths to local `scripts/` subdirectory — priority: **high**
3. Update `install.js` (`installSkillScripts()`) to read from `shared/skills/<name>/scripts/` — priority: **high**
4. Handle `docgen/` cross-skill dependency (`vault-pdf-export` → `document-generation`) — priority: **high**
5. Keep `shared/scripts/lib/` untouched (arai depends on it) — priority: **high**
6. Keep `ci-validate.js` and `repos-sync.js` in `shared/scripts/` — priority: **medium**
7. Update `package.json` npm scripts that reference `shared/scripts/` paths — priority: **high**
8. Update `opencode.json` references and MCP config — priority: **high**
9. Update `agents-md.js` `buildScriptsTable()` — priority: **medium**
10. Update all tests (6 files) with `shared/scripts/` paths — priority: **high**
11. Update `AGENTS.md` architecture description — priority: **high**
12. Update `README.md` documentation (tables, CLI examples, docgen section) — priority: **high**
13. Update tutorials (16 files in `tutoriales-arai/`) — priority: **medium**
14. Update `.opencode/skills/` definitions that reference `shared/scripts/` — priority: **medium**
15. Add validation in `ci-validate.js` for co-located scripts — priority: **low**

---

## Architecture Changes

### Files to Modify

#### Core Logic (arai CLI)

| File | Change |
|------|--------|
| `shared/scripts/lib/install.js` | `installSkillScripts()`: read from `shared/skills/<name>/scripts/` instead of `shared/scripts/` |
| `shared/scripts/lib/list.js` | `listScripts()`: scan `shared/skills/*/scripts/` instead of `shared/scripts/` |
| `shared/scripts/lib/agents-md.js` | `buildScriptsTable()`: scan `shared/skills/*/scripts/` instead of `shared/scripts/` |
| `shared/scripts/lib/scaffold.js` | Log message: update string from `shared/scripts/` |
| `shared/scripts/ci-validate.js` | Update check: `shared/scripts/` → validate skill-local scripts; add co-location check |

#### Configuration

| File | Change |
|------|--------|
| `package.json` | Update ~12 npm scripts: `shared/scripts/send-email.js` → `shared/skills/email/scripts/send-email.js`, etc. |
| `opencode.json` | Update email agent template (line 139), MCP server command (line 192), reference path (line 265) |

#### SKILL.md Files (10 files)

| File | Change |
|------|--------|
| `shared/skills/branding/SKILL.md` | `scripts: [create-brand.js]` → `scripts: [scripts/create-brand.js]` |
| `shared/skills/ci-validate/SKILL.md` | `scripts: [ci-validate.js]` → stays (ci-validate is standalone, not in skill dir) |
| `shared/skills/content-ingestion/SKILL.md` | `scripts: [ingest-content.js]` → `scripts: [scripts/ingest-content.js]` |
| `shared/skills/document-generation/SKILL.md` | `scripts: [docgen/]` → `scripts: [scripts/docgen/]` |
| `shared/skills/email/SKILL.md` | `scripts: [send-email.js, mcp-email.js]` → `scripts: [scripts/send-email.js, scripts/mcp-email.js]` |
| `shared/skills/kb-management/SKILL.md` | `scripts: [kb-sync.js]` → `scripts: [scripts/kb-sync.js]` |
| `shared/skills/pdf-extraction/SKILL.md` | `scripts: [extract-pdf.js]` → `scripts: [scripts/extract-pdf.js]` |
| `shared/skills/repos-sync/SKILL.md` | `scripts: [repos-sync.js]` → stays (repos-sync is standalone) |
| `shared/skills/vault-pdf-export/SKILL.md` | `scripts: [docgen-vault.js, docgen/]` → `scripts: [scripts/docgen-vault.js, ../document-generation/scripts/docgen/]` |
| `shared/skills/youtube/SKILL.md` | `scripts: [youtube-transcript.js]` → `scripts: [scripts/youtube-transcript.js]` |

#### Documentation

| File | Change |
|------|--------|
| `AGENTS.md` | Line 50: `shared/scripts/` description — update to reflect new structure |
| `README.md` | Lines 45, 100, 272, 434-441, 528, 568-587, 610-613, 742-748, 787-793 — all `shared/scripts/` references |
| `.opencode/skills/distribution-pattern/SKILL.md` | Line 32: `shared/scripts/` description |
| `.opencode/skills/reference-creator/SKILL.md` | Lines 21, 45: reference path examples |
| 16 tutorial files in `tutoriales-arai/` | CLI usage examples referencing `shared/scripts/` paths |

#### Tests (6 files)

| File | Change |
|------|--------|
| `tests/commands/init-harness.test.js` | Lines 123-145, 200-203: assertions about `shared/scripts/` structure |
| `tests/commands/templates.test.js` | Lines 123-221: import paths from `shared/scripts/docgen/` |
| `tests/consistency/docs-consistency.test.js` | Line 64: assertion that README mentions `shared/scripts` |
| `tests/consistency/eliminated-skills.test.js` | Lines 12-15: negative assertions about deleted scripts |
| `tests/consistency/shared-packages.test.js` | Lines 34-43: frontmatter scripts match actual scripts |
| `tests/integration/outcome-init.test.js` | Line 210: negative assertion about `shared/scripts` |

### Files to Create

| File | Purpose |
|------|---------|
| `shared/skills/branding/scripts/` | Co-located scripts dir |
| `shared/skills/content-ingestion/scripts/` | Co-located scripts dir |
| `shared/skills/document-generation/scripts/` | Co-located scripts dir (contains docgen/) |
| `shared/skills/email/scripts/` | Co-located scripts dir |
| `shared/skills/kb-management/scripts/` | Co-located scripts dir |
| `shared/skills/pdf-extraction/scripts/` | Co-located scripts dir |
| `shared/skills/vault-pdf-export/scripts/` | Co-located scripts dir |
| `shared/skills/youtube/scripts/` | Co-located scripts dir |

### Files to Move (NOT delete — moved to skill dirs)

| Source | Destination |
|--------|-------------|
| `shared/scripts/send-email.js` | `shared/skills/email/scripts/send-email.js` |
| `shared/scripts/mcp-email.js` | `shared/skills/email/scripts/mcp-email.js` |
| `shared/scripts/ingest-content.js` | `shared/skills/content-ingestion/scripts/ingest-content.js` |
| `shared/scripts/create-brand.js` | `shared/skills/branding/scripts/create-brand.js` |
| `shared/scripts/kb-sync.js` | `shared/skills/kb-management/scripts/kb-sync.js` |
| `shared/scripts/extract-pdf.js` | `shared/skills/pdf-extraction/scripts/extract-pdf.js` |
| `shared/scripts/docgen-vault.js` | `shared/skills/vault-pdf-export/scripts/docgen-vault.js` |
| `shared/scripts/youtube-transcript.js` | `shared/skills/youtube/scripts/youtube-transcript.js` |
| `shared/scripts/docgen/` (12 files) | `shared/skills/document-generation/scripts/docgen/` |

### Files That STAY in `shared/scripts/` (NOT moved)

| File | Reason |
|------|--------|
| `shared/scripts/lib/*` (8 files) | arai CLI internal library — `bin/arai.js` imports via hardcoded path |
| `shared/scripts/ci-validate.js` | Standalone CI utility — no skill owner, used by `npm run validate` |
| `shared/scripts/repos-sync.js` | Standalone repo utility — no skill owner, used by `npm run repos` |

---

## TDD Flow

### Step 1: Write Tests (RED)

Add failing tests to `tests/consistency/shared-packages.test.js`:

```js
// Test: each skill with scripts: field has local scripts/ dir
test('skills with scripts field have co-located scripts/ directory', () => {
  for (const skill of skillsWithScripts) {
    const scriptsDir = join(SKILLS_DIR, skill, 'scripts');
    assert.ok(existsSync(scriptsDir), `${skill} should have scripts/ dir`);
  }
});

// Test: all frontmatter scripts resolve to local files
test('all frontmatter scripts resolve in skill local scripts/', () => {
  for (const [skill, scripts] of Object.entries(skillScripts)) {
    for (const script of scripts) {
      // Skip cross-skill references (../document-generation/...)
      if (script.startsWith('../')) continue;
      const path = join(SKILLS_DIR, skill, 'scripts', script);
      assert.ok(existsSync(path), `${skill}: ${script} not found locally`);
    }
  }
});

// Test: lib/ still exists (arai depends on it)
test('shared/scripts/lib/ still exists (arai infrastructure)', () => {
  assertDir(join(SHARED_DIR, 'scripts', 'lib'));
});
```

### Step 2: Move Skill Scripts (GREEN)

1. Create `shared/skills/<name>/scripts/` for 8 skills
2. Move 9 script files + docgen/ directory
3. Leave `lib/`, `ci-validate.js`, `repos-sync.js` in place

### Step 3: Update SKILL.md Frontmatter (GREEN)

Update `scripts:` field in 8 SKILL.md files (see table above).

### Step 4: Update arai Core Logic (GREEN)

| File | Function | Change |
|------|----------|--------|
| `install.js` | `installSkillScripts()` | Resolve scripts from `shared/skills/<name>/scripts/` |
| `list.js` | `listScripts()` | Scan `shared/skills/*/scripts/` instead of `shared/scripts/` |
| `agents-md.js` | `buildScriptsTable()` | Scan `shared/skills/*/scripts/` |
| `scaffold.js` | `resolveScripts()` | Resolve from skill dirs |

### Step 5: Update package.json (GREEN)

Update npm script paths for skill scripts:

```json
"email": "node shared/skills/email/scripts/send-email.js",
"docgen:deck": "node shared/skills/document-generation/scripts/docgen/build-deck.js",
"docgen:report": "node shared/skills/document-generation/scripts/docgen/build-report.js",
...
```

### Step 6: Update opencode.json (GREEN)

- Email agent template: `shared/scripts/send-email.js` → `shared/skills/email/scripts/send-email.js`
- MCP email server: `shared/scripts/mcp-email.js` → `shared/skills/email/scripts/mcp-email.js`
- Reference path: `../shared/scripts` → `../shared/skills` (or remove if not needed)

### Step 7: Update Tests (GREEN)

Update 6 test files (see table above).

### Step 8: Update Documentation (GREEN)

- `AGENTS.md`: Update architecture section
- `README.md`: Update tables, CLI examples, docgen section
- 16 tutorials: Update CLI usage examples
- `.opencode/skills/distribution-pattern/SKILL.md`: Update pattern description
- `.opencode/skills/reference-creator/SKILL.md`: Update examples

### Step 9: Refactor — Still GREEN

- Run full test suite
- `grep -rn "shared/scripts" --include="*.js" --include="*.md" --include="*.json"` — verify no stale references (except lib/, ci-validate.js, repos-sync.js)
- Manual smoke test: `arai init`, `arai install skill email`, `arai list scripts`

---

## Verification

### Automated

- [ ] `npm test` — all tests pass (0 failures)
- [ ] `grep -rn "shared/scripts" --include="*.js" shared/` — only `lib/`, `ci-validate.js`, `repos-sync.js` remain
- [ ] `grep -rn "shared/scripts" --include="*.md" shared/` — zero matches (skills use local paths now)
- [ ] `grep -rn "shared/scripts" tests/` — only `lib/`, `ci-validate.js`, `repos-sync.js` references remain

### arai CLI Smoke Tests

- [ ] `arai init test-proj --template full` — generated project has `.opencode/scripts/` with all scripts
- [ ] `arai init test-proj2 --template minimal` — minimal project works
- [ ] `arai install skill email --project test3` — scripts copied to `.opencode/scripts/`
- [ ] `arai install skill vault-pdf-export --project test4` — docgen/ resolved from document-generation
- [ ] `arai install skill document-generation --project test5` — docgen/ copied correctly
- [ ] `arai list scripts` — lists scripts from skill dirs
- [ ] `arai list skills` — lists all 14 skills with descriptions
- [ ] `arai uninstall skill email --project test3` — clean removal

### OpenCode CLI Smoke Tests

- [ ] `opencode` in a generated project — skills discoverable, scripts runnable
- [ ] Agent loads skill correctly (e.g., `@email` agent can reference `send-email.js`)
- [ ] MCP email server starts: `node shared/skills/email/scripts/mcp-email.js --help`
- [ ] `node shared/skills/youtube/scripts/youtube-transcript.js --help` — standalone execution works
- [ ] `node shared/skills/document-generation/scripts/docgen/build-deck.js --help` — docgen works

### Structure Validation

- [ ] Each of 8 skill dirs contains `SKILL.md` + `scripts/` subdirectory
- [ ] 4 instruction-only skills (`code-review`, `git`, `google-workspace`, `m365`) have no `scripts/` dir
- [ ] `shared/scripts/lib/` contains all 8 original files (untouched)
- [ ] `shared/scripts/ci-validate.js` and `repos-sync.js` still in place
- [ ] `docgen/` (12 files) lives in `document-generation/scripts/docgen/`
- [ ] `vault-pdf-export/scripts/docgen-vault.js` exists and imports from `../document-generation/scripts/docgen/`

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| `bin/arai.js` breaks if `lib/` moves | **Critical** | `lib/` does NOT move — verified by import analysis |
| `vault-pdf-export` docgen cross-reference breaks | High | Test `arai install skill vault-pdf-export` explicitly |
| `package.json` npm scripts point to wrong paths | High | Update all ~12 npm scripts; test `npm run docgen:deck` |
| `opencode.json` MCP server can't find script | High | Update email MCP command path; test MCP startup |
| Tests with hardcoded `shared/scripts/` paths | Medium | Grep + fix all 6 test files before merge |
| `agents-md.js` / `list.js` scan breaks | Medium | Test `arai init` and `arai list scripts` |
| Tutorial examples become stale | Low | Batch update 16 tutorial files |
| `ci-validate.js` checks wrong paths | Low | Update its own structural checks |

---

## Migration Order

1. **Create** all `scripts/` subdirectories (non-breaking)
2. **Move** skill scripts to skill dirs (atomic per skill)
3. **Update** SKILL.md frontmatter (atomic per skill)
4. **Update** `install.js` — new script resolution logic
5. **Update** `list.js` — scan skill dirs
6. **Update** `agents-md.js` — scan skill dirs
7. **Update** `scaffold.js` — log message
8. **Update** `ci-validate.js` — structural checks
9. **Update** `package.json` — npm script paths
10. **Update** `opencode.json` — email MCP + references
11. **Update** 6 test files
12. **Update** `AGENTS.md` + `README.md`
13. **Update** 16 tutorial files
14. **Update** 2 `.opencode/skills/` definitions
15. **Run** full test suite
16. **Smoke test** arai CLI commands
17. **Smoke test** opencode integration
18. **Commit**
