# Plan 052: Full Template Audit & Cleanup

## Objective

Audit the full template installation, remove internal artifacts that shouldn't be installed in external projects, and fix ambiguous items to be clearly distributable or excluded.

## Context

The full template (`arai init --template full`) currently installs EVERYTHING from `shared/` via wildcard `["*"]`. This includes 15 internal artifacts that are specific to the aramirez-ai repo and shouldn't be installed in external projects:

**Internal artifacts being incorrectly installed:**
- 3 skills: `repos-sync`, `vault-pdf-export`, `ci-validate` (arai-specific implementation)
- 1 agent: `plan-arai` (arai planning mode)
- 3 commands: `getrepo`, `updaterepos`, `export-pdf` (arai repo management)
- 4 scripts: `repos-sync.js`, `getrepo.js`, `updaterepos.js`, `ci-validate.js`
- 1 plugin: `custom-logo.tsx` (aramirez-ai branding)
- 1 TUI config: `tui.json` (points to arai plugin)

**Namespace idea assessment:**
The user suggested `.opencode/agents/arai/` or `.opencode/arai/agents/` for namespacing. This is **not recommended** because:
1. It breaks opencode's standard flat discovery convention
2. Every agent would need explicit `path` config
3. The real fix is simpler: don't install internal artifacts at all
4. Distributable artifacts should stay in standard locations

## Requirements

1. Remove INTERNAL skills from full template — priority: high
2. Remove INTERNAL agents from full template — priority: high
3. Remove INTERNAL commands from full template — priority: high
4. Remove INTERNAL scripts from full template — priority: high
5. Remove INTERNAL plugin and TUI config from full template — priority: high
6. Fix AMBIGUOUS items (ci-validate, code-style, plan command) — priority: medium
7. Update template.json to exclude internal items — priority: high
8. Update EXCLUDE_FROM_SYNC in protection.js — priority: medium
9. Write tests to verify internal items are not installed — priority: high

## Architecture

### What stays (DISTRIBUTABLE — 48 items)

**Skills (11):** git, code-review, email, content-ingestion, pdf-extraction, youtube, document-generation, branding, google-workspace, m365, kb-management

**Agents (10):** reviewer, tester, docs, branding, content-ingestion, document-generation, email, kb-management, pdf-extraction, youtube

**Commands (9):** commit, deploy, test, plan, generate, ingest, kb, send-email, youtube-cmd

**Scripts (15):** send-email.js, mcp-email.js, ingest-content.js, create-brand.js, kb-sync.js, extract-pdf.js, youtube-transcript.js, docgen/* (12 files — but these are in skills, not top-level)

**Prompts (1):** commit-message.md

**Rules (1):** code-style.md (needs fix to remove arai-specific section)

**Template partials (8):** opencode.json, AGENTS.md, package.json, repos.json, brand.json, .gitignore, logo.svg, logo-white.svg

### What gets removed (INTERNAL — 15 items)

**Skills (3):** repos-sync, vault-pdf-export, ci-validate

**Agents (1):** plan-arai

**Commands (3):** getrepo, updaterepos, export-pdf

**Scripts (4):** repos-sync.js, getrepo.js, updaterepos.js, ci-validate.js

**Plugins (1):** custom-logo.tsx

**TUI (1):** tui.json

### What needs fixing (AMBIGUOUS — 3 items)

1. **`plan` command** — has arai-specific naming convention (Spanish labels). Fix to use universal English conventions.
2. **`code-style.md` rule** — has arai-specific plan naming section. Remove that section.
3. **`vault-pdf-export` agent** — depends on internal skill. Remove agent too.

### Files to Modify

- `shared/templates/full/template.json` — change wildcards to explicit lists
- `shared/skills/code-style/SKILL.md` or `shared/rules/code-style.md` — remove arai-specific section
- `shared/commands/plan.md` — fix naming convention to English
- `tests/commands/init-harness.test.js` — update tests for new file counts

### Files to Create

- `tests/commands/install-protection.test.js` — add tests for internal exclusion

## Detailed Changes

### 1. `shared/templates/full/template.json` (MODIFY)

Change from wildcards to explicit lists:

```json
{
  "name": "full",
  "description": "Full AI agent structure: distributable skills, scripts, opencode platform, branding, assets",
  "version": "1.1.0",
  "include": {
    "skills": [
      "git", "code-review", "email", "content-ingestion", "pdf-extraction",
      "youtube", "document-generation", "branding", "google-workspace",
      "m365", "kb-management"
    ],
    "scripts": [
      "ci-validate.js"
    ],
    "prompts": ["*"],
    "rules": ["*"],
    "agents": [
      "reviewer", "tester", "docs", "branding", "content-ingestion",
      "document-generation", "email", "kb-management", "pdf-extraction", "youtube"
    ],
    "commands": [
      "commit", "deploy", "test", "plan", "generate", "ingest",
      "kb", "send-email", "youtube-cmd"
    ],
    "plugins": [],
    "tui": false,
    "platforms": ["opencode"],
    "package_json": true,
    "repos_json": false,
    "branding": true,
    "assets": true
  }
}
```

Note: `ci-validate.js` is kept because the concept is universal even if the current implementation has arai-specific checks. It can be refactored later.

### 2. `shared/rules/code-style.md` (MODIFY)

Remove the arai-specific plan naming section. Keep only universal code style conventions.

### 3. `shared/commands/plan.md` (MODIFY)

Change Spanish naming convention to English:
- `plans/XXX-nombre-fecha-YYYY-MM-DD.md` → `plans/XXX-name-YYYY-MM-DD.md`
- Remove arai-specific labels

### 4. `tests/commands/init-harness.test.js` (MODIFY)

Update expected file counts and directory listings to match the new reduced set.

## TDD Flow

1. Write tests verifying internal items are NOT in full template output → FAIL
2. Update template.json to exclude internal items → PASS
3. Fix ambiguous items → still PASS

## Verification

- [ ] `node --test tests/commands/init-harness.test.js` passes
- [ ] `node --test tests/commands/init.test.js` passes
- [ ] `node --test tests/commands/install-protection.test.js` passes
- [ ] Manual: `arai init /tmp/test --template full` does NOT include repos-sync, vault-pdf-export, plan-arai, getrepo, updaterepos, export-pdf, custom-logo.tsx
- [ ] Manual: `arai init /tmp/test --template full` DOES include all 11 distributable skills
- [ ] AGENTS.md updated if needed
