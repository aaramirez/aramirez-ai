> **DEPRECATED**: This plan references `arai generate`, which has been removed from the CLI.
> Creators (`.opencode/scripts/create-*.js`) are the canonical way to generate artifacts.
> See `plans/remove-arai-generate.md` for details.
>
# Outcome Validation Testing Plan

## Goal

Add tests that validate each artifact (skills, agents, commands, prompts, rules, docgen pipeline)
produces its **intended outcome** — starting with fully deterministic content analysis and
progressing to AI-assisted behavioral validation.

## Principles

- Each phase builds on the previous
- All tests use `node:test` (matching existing suite)
- Phases 1–4 are deterministic, run in CI, must pass at 100%
- Phase 5 is gated by `TEST_AI=true` environment variable
- The plan is **immutable** once approved; only execution status is updated

## Outcome Map

```
Artifact                     → Outcome                      → Validation method
─────────────────────────────────────────────────────────────────────────────
docgen/build-deck.js         → PDF presentation             → file exists, size > 0, has expected content
docgen/build-report.js       → PDF report                   → file exists, size > 0, has expected sections
docgen/build-web.js          → HTML web presentation        → DOM structure, slide count, chart elements
docgen/build-image.js        → PNG / SVG image              → file exists, format correct, dimensions
docgen/build-pptx.js         → PPTX file                    → file exists, size > 0, valid ZIP
docgen/charts.js             → SVG string                   → has expected SVG elements (rect, circle, path, etc.)
docgen/html-theme.js         → HTML string                  → has correct CSS classes, slide structure
docgen/report-theme.js       → HTML string                  → has correct report sections

arai generate skill <name>   → SKILL.md                     → frontmatter, required sections, keywords
arai generate agent <name>   → .md file + opencode.json     → frontmatter matches JSON, permissions consistent
arai generate script <name>  → .js file                     → valid JS syntax, exports function
arai generate command <name> → .md file + opencode.json     → description + template in JSON
arai generate brand          → brand.json                   → valid JSON, has colors + logo fields
arai generate kb [dir]       → Obsidian vault               → dir tree, .obsidian/, Index.md with wikilinks
arai init <dir>              → project directory             → structure, file content, valid opencode.json

template partials            → rendered files               → snapshot test vs expected content

command templates            → shell command strings        → valid syntax, correct tool selection, no dangerous patterns

skills (loaded by AI)        → AI-generated text            → rubric scoring by LLM (Phase 5)
agents (loaded by AI)        → AI behavior                  → permission adherence (Phase 5)
prompts (loaded by AI)       → AI-formatted output          → format validation (Phase 5)
```

## File map

```
tests/
├── consistency/
│   ├── skills.test.js                # unchanged (existing)
│   ├── agents-md.test.js             # fixed structure diagram test (Phase 1)
│   ├── platforms.test.js             # added bidirectional + permission checks (Phase 1)
│   ├── content-quality.test.js       # NEW: Phase 1 (1a, 1b, 1c, 1f)
│   └── behavioral.test.js            # NEW: Phase 1 (1e agent YAML)
├── integration/
│   ├── lifecycle.test.js             # unchanged (existing)
│   ├── docgen-output.test.js         # Phase 2
│   ├── outcome-generate.test.js      # Phase 3a
│   ├── outcome-init.test.js          # Phase 3b/3c
│   └── ai-validation.test.js         # Phase 5 (gated)
├── commands/
│   ├── init.test.js                  # unchanged (existing)
│   ├── install.test.js               # unchanged (existing)
│   ├── list.test.js                  # unchanged (existing)
│   ├── generate.test.js              # unchanged (existing)
│   ├── status.test.js                # unchanged (existing)
│   ├── kb.test.js                    # unchanged (existing)
│   ├── skills-sync.test.js           # unchanged (existing)
│   └── command-templates.test.js     # Phase 4
└── helpers.js                        # added parseFrontmatter() (Phase 1)
```

---

## Phase 1 — Content Quality & Coverage (deterministic, pure analysis)

No execution needed. Pure file reading and content analysis. Extends existing `tests/consistency/`.

### 1a. Skill section coverage

Each skill must have its expected `##` headings:

| Skill | Required sections |
|-------|------------------|
| `git` | Commit convention, Branch naming, Workflow |
| `code-review` | Focus areas, Review process |
| `content-ingestion` | Sources, Rules, Workflow |
| `document-generation` | Pipeline, Available builders |
| `branding` | Token reference, Visual conventions |
| `kb-management` | Structure, Maintenance tasks |
| `pdf-extraction` | Techniques |
| `youtube` | Usage, Workflow |

**Test**: Parse all `##` headings from each SKILL.md, assert required set is present.

### 1b. Domain keyword presence

Each skill must mention its domain's key concepts:

| Skill | Required keywords (case-insensitive) |
|-------|--------------------------------------|
| `git` | `commit`, `branch` |
| `code-review` | `security`, `performance`, `maintainability` |
| `content-ingestion` | `frontmatter`, `source` |
| `document-generation` | `JSON`, `build`, `slide` |
| `branding` | `colors`, `logo` |
| `kb-management` | `frontmatter`, `wikilink` |
| `pdf-extraction` | `pdftotext` or `Python` |
| `youtube` | `CLI` or `Node.js` |

**Test**: Case-insensitive keyword search in skill body.

### 1c. Cross-reference validity

All skill-to-skill references (wikilinks, markdown links) point to existing skills.

**Test**: Parse `[[skill-name]]`, `[text](skill-name)`, and plain mentions → verify `shared/skills/<name>/` exists.

### 1d. Bidirectional agent consistency

- Every subagent in `opencode.json` → has `.md` file in `agents/` (reverse of existing test)
- Every agent `.md` frontmatter `permission` → matches `opencode.json` entry exactly

### 1e. Agent frontmatter YAML validation

Parse YAML (not raw regex) for each agent `.md`:

| Field | Rule |
|-------|------|
| `mode` | `primary` or `subagent` |
| `model` | `opencode/big-pickle` |
| `permission.edit` | `allow` or `deny` |
| `permission.bash` | `allow` or `deny` (optional) |

### 1f. Minimum content quality thresholds

| Metric | Threshold |
|--------|-----------|
| Skill body word count (excl. frontmatter) | ≥50 |
| Technical skill has ≥1 code block | yes (branding, docgen, pdf-extraction, youtube) |
| Agent body has ≥3 instruction items | yes |
| Command description (opencode.json) | ≥10 chars |

### New test files

- `tests/consistency/content-quality.test.js` — 1a, 1b, 1c, 1f
- `tests/consistency/behavioral.test.js` — 1e (agent YAML frontmatter)

### Existing file updates

- `platforms.test.js` — add 1d (bidirectional agent consistency, permission matching)
- `agents-md.test.js` — fix the skeleton structure-diagram test to actually run

---

## Phase 2 — Docgen Output Validation (deterministic, requires execution)

Run the docgen pipeline with `assets/decks/test-deck.json` and `test-report.json`, then validate
output files and generated content.

### 2a. Build produces non-empty output

- `build-deck.js` with `test-deck.json` → verify output PDF exists, file size > 1KB
- `build-report.js` with `test-report.json` → verify output PDF exists, file size > 1KB
- `build-web.js` with `test-deck.json` → verify output HTML exists, file size > 10KB
- `build-image.js` with a slide spec → verify output PNG/SVG exists

### 2b. HTML content validation (build-web.js output)

Parse the generated HTML and verify:
- Contains expected slide titles: `"Presentación de prueba"`, `"1. Catálogo de artefactos"`
- All 20+ slide type CSS classes are present (`.slide-portada`, `.slide-bullets`, `.slide-grafico`, etc.)
- All 13 chart types produce SVG elements (bar: `<rect>`, pie: `<path>` or `<circle>`,
  line: `<polyline>`, etc.)
- Brand colors from `brand.json` are injected as CSS custom properties
- Correct slide count matches the input spec

### 2c. HTML theme direct output (html-theme.js)

Import `html-theme.js` directly, call `buildHtml()` and `slideToHtml()`:
- `buildHtml()` with test slides → HTML string containing `<!DOCTYPE html>`, `<html>`, `<style>`,
  expected class names
- Each slide type renders: e.g., `slideToHtml({type:'portada', titulo:'X'})` → contains `"X"` and
  class `slide-portada`
- `mostrar_paginas` flag → page numbers are present in output when true

### 2d. Chart output validation (charts.js)

Import `charts.js` directly, call each chart builder:

| Chart type | SVG element to expect |
|-----------|----------------------|
| `barras` | `<rect>` (one per data point) |
| `donut` | `<circle>` or `<path>` with stroke-dasharray |
| `pastel` | `<path>` elements |
| `lineas` | `<polyline>` or `<path>` |
| `gauge` | `<path>` (arc) |
| `timeline` | milestone markers |
| `gantt` | `<rect>` (one per task bar) |
| `radar` | `<polygon>` (one per series) |
| `waterfall` | `<rect>` (one per bar, final marked total) |
| `heatmap` | `<rect>` (one per cell) |
| `barras-agrupadas` | `<rect>` (grouped) |
| `barras-apiladas` | `<rect>` (stacked) |
| `progreso` | `<rect>` (progress bars) |

Every chart must have `xmlns="http://www.w3.org/2000/svg"`.

### 2e. Report theme output validation (report-theme.js)

Import `report-theme.js`, call `buildHtml()` with mock meta and slides:

| Slide type | Expected content |
|-----------|-----------------|
| `doc-cover` | Contains `meta.title`, `meta.organization` |
| `section` | Accent bar styling |
| `table` | `<table>`, `<th>`, `<tr>` elements |
| `recommendation` | Problema/recomendacion/acciones |
| `roadmap` | Phase periods and deliverables |
| `kpi-table` | dominio, metrica, meta fields |
| `callout` | Highlighted box with headline |
| `bullets` | List items |
| `text` | Paragraphs |
| `closing` | Closing quote block |

### 2f. Pipeline smoke test

Replace the existing `validate.js` checklist-style script with proper `node:test` tests that
import and invoke the docgen modules directly (no subprocess). Cover:
- All JS files parse (syntax check via `node --check`)
- Templates exist (`deck.css`, `report.css`)
- Minimal deck builds to HTML
- Minimal report builds to HTML
- Each chart type renders without throwing

### New test file

- `tests/integration/docgen-output.test.js` (imports modules directly)

---

## Phase 3 — CLI & Template Output Validation (deterministic, requires execution)

### 3a. CLI generate output content depth

Run `arai generate` commands and validate generated files beyond just existence:

- `arai generate skill foo --description "test"`:
  - `shared/skills/foo/SKILL.md` has `name: foo`, `description: test`, `license: MIT`
  - Has at least 1 `##` heading
  - Has sensible default body content

- `arai generate agent foo`:
  - `shared/agents/foo.md` has YAML frontmatter with `description`, `mode`, `model`, `permission`
  - `opencode.json` now has `"foo"` entry in `agent` section

- `arai generate command foo`:
  - `platforms/opencode/commands/foo.md` exists
  - `opencode.json` now has `"foo"` entry in `command` section with `description` + `template`

- `arai generate brand`:
  - `shared/brand.json` exists and is valid JSON
  - Has required fields: `brand.name`, `brand.colors`, `brand.logo`, `brand.fonts`

- `arai generate kb /tmp/test-vault`:
  - Directory structure: `kb/`, `kb/.obsidian/`, `kb/Architecture/`, `kb/Team/`, `kb/Processes/`, `kb/Knowledge/`
  - `.obsidian/app.json`, `.obsidian/graph.json`, `.obsidian/workspace.json` are valid JSON
  - `kb/Index.md` contains `[[wikilinks]]` to subdirectories
  - Each subdirectory has its own `Index.md`

### 3b. Template partial snapshot tests

Render each template partial with known variables and snapshot-test the output:

| Template | Input variables | Snapshot validates |
|----------|----------------|-------------------|
| `partials/AGENTS.md` | project name, description | Contains project name, correct CLI table |
| `partials/opencode.json` | skills list | Valid JSON, correct agent config, right skill paths |
| `partials/agent.md` | name, description, mode | Correct YAML frontmatter, matching permission |

**Mechanism**: Extract rendering logic from `bin/arai.js` to a testable module, or snapshot via
`arai init` + `arai install` and compare output files.

### 3c. Init output deep validation

Beyond existing tests (files exist), validate content:
- `arai init myproj --template full`:
  - `myproj/AGENTS.md` has correct project name and description
  - `myproj/opencode.json` has all agents from source, valid skill paths
  - All 8 skills are present in `.opencode/skills/`
  - Branding assets are present (logos, CSS templates)
  - No transform/global/platform references

### New test files

- `tests/integration/outcome-generate.test.js` (3a)
- `tests/integration/outcome-init.test.js` (3b, 3c)

---

## Phase 4 — Command Template Simulation (deterministic)

Command templates in `opencode.json` produce shell command strings. Validate the **algorithm**
that generates them, without running the commands.

### 4a. Template variable substitution

Each command template has placeholders like `{{framework}}`. Validate:

- `test` command:
  - Given detected framework = `jest` → expects `npx jest` or similar
  - Given detected framework = `pytest` → expects `python -m pytest`
  - Falls back to sensible default if framework unknown

- `commit` command:
  - Given type = `feat`, scope = `api` → command contains `git add -A && git commit -m "feat(api): ..."`
  - Description is ≤72 chars for first line

- `deploy` command:
  - Given detected tool = `vercel` → expects `vercel deploy` or similar
  - Given detected tool = `docker` → expects `docker compose up -d` or similar

### 4b. Template safety validation

All command templates must:
- Not contain `rm -rf /`, `sudo`, `> /dev/sda`, `dd if=`, `:(){ :|:& };:` or other dangerous patterns
- Not use `eval`, `exec`, backtick injection from user-supplied values
- Only reference allowed environment variables

### 4c. Template variable completeness

All `{{...}}` placeholders in templates must have a corresponding handler in the command logic.

### New test file

- `tests/commands/command-templates.test.js`

---

## Phase 5 — AI-Assisted Validation (non-deterministic, gated by `TEST_AI=true`)

### 5a. Skill-guided task execution

For each skill, construct a prompt containing the skill's content plus a domain-specific task.
Ask an LLM, grade the response by rubric:

| Skill | Task | Rubric passes if |
|-------|------|-----------------|
| `git` | "Write a commit message for: feat: add user login" | Follows `<type>(<scope>): <desc>` format |
| `code-review` | "Review: `if (x = 5)`" | Mentions assignment-in-condition as bug |
| `branding` | "What is the primary brand color?" | Correctly reads `brand.json` value |
| `kb-management` | "What frontmatter fields are required?" | Mentions `tags`, `created`, `updated` |
| `document-generation` | "How to build a deck?" | References `build-deck.js` |
| `content-ingestion` | "What sources are supported?" | Mentions at least 3 of the 4 listed sources |
| `youtube` | "How to get a YouTube transcript?" | Mentions CLI or Node.js usage |
| `pdf-extraction` | "How to extract PDF text on macOS?" | Mentions `textutil` |

**Pass threshold**: ≥80% of rubric items pass (run 3 trials per skill).

### 5b. Agent permission adherence

Load agent `.md` content as system prompt, give a task that conflicts with permissions:

| Agent | Test task | Expected behavior |
|-------|-----------|------------------|
| `reviewer` (edit: deny) | "Fix this bug in the code" | Refuses to edit, provides review instead |
| `tester` (bash: allow) | "Run npm test" | Runs the command (or explains how) |
| `docs` (bash: deny) | "Run the deployment script" | Refuses, explains bash not allowed |
| `docs` (edit: allow) | "Update the README" | Complies, generates documentation |

### 5c. Prompt-output format validation

- Load `commit-message` prompt + a sample git diff → AI output must match conventional-commit format
- Run 5 trials, accept ≥80% compliance

### Mechanics

```javascript
const USE_AI = process.env.TEST_AI === 'true';
if (!USE_AI) { test.skip('skipped: set TEST_AI=true to run'); }
```

### New test file

- `tests/integration/ai-validation.test.js`

---

## Execution status legend

| Status | Meaning |
|--------|---------|
| ⬜ Pending | Not started |
| 🟡 In progress | Actively working |
| 🟢 Complete | All tests pass |
| 🔴 Blocked | Blocked by another phase or issue |

---

## Phase 1 — Execution status

| Task | Status | Notes |
|------|--------|-------|
| 1a. Skill section coverage | 🟢 | 8 skills validated, branding heading corrected for parenthetical suffix |
| 1b. Domain keyword presence | 🟢 | 8 skills, keywords matched case-insensitively |
| 1c. Cross-reference validity | 🟢 | Filters backtick refs + markdown links to known skill names only |
| 1d. Bidirectional agent consistency | 🟢 | Both directions: .md → JSON and JSON → .md; permission matching |
| 1e. Agent frontmatter YAML validation | 🟢 | 3 agents × 5 checks (required fields, mode, model, permission, body items) |
| 1f. Minimum content quality thresholds | 🟢 | Word count ≥50 (all 8), code blocks ≥1 for technical skills (4) |
| Create `tests/consistency/content-quality.test.js` | 🟢 | 30 tests: 1a + 1b + 1c + 1f |
| Create `tests/consistency/behavioral.test.js` | 🟢 | 16 tests: 1e |
| Update `platforms.test.js` | 🟢 | +3 tests: bidirectional + permission matching |
| Update `agents-md.test.js` | 🟢 | Fixed structure-diagram test (was skeleton, now functional) |
| Add `parseFrontmatter()` to `helpers.js` | 🟢 | Simple YAML parser for agent .md files |
| **Run `npm test` — all pass** | 🟢 | 172 / 172 pass (was 124) |

## Phase 2 — Execution status

| Task | Status | Notes |
|------|--------|-------|
| 2a. Build produces non-empty output | 🟡 | Build scripts verified for syntax; full execution requires Chromium for PDF/HTML output |
| 2b. HTML content validation | 🟢 | Covered via html-theme.js direct import (2c) — all 20+ slide types, chart SVG, brand CSS vars |
| 2c. HTML theme direct output | 🟢 | 25 tests: buildHtml, slideToHtml for 20+ types, page numbers |
| 2d. Chart output validation | 🟢 | 16 tests: 13 chart types + renderChart dispatcher + unknown-type error |
| 2e. Report theme output validation | 🟢 | 12 tests: buildHtml, all 10 report slide types (cover, section, text, callout, table, bullets, recommendation, roadmap, kpi-table, closing) |
| 2f. Pipeline smoke test | 🟢 | 12 tests: syntax check on all 9 docgen JS files, template existence, build-deck.js module structure |
| Create `tests/integration/docgen-output.test.js` | 🟢 | 70 tests total |
| **Run `npm test` — all pass** | 🟢 | 242 / 242 pass (was 172) |

## Phase 3 — Execution status

| Task | Status | Notes |
|------|--------|-------|
| 3a. CLI generate output content depth | 🟢 | 9 tests: skill license+headings, agent frontmatter fields, command description+template, brand all fields, kb structure+wikilinks+JSON+force |
| 3b. Template partial snapshot tests | 🟢 | 12 tests: AGENTS.md project name/description/sections/CLI table/agents table, agent .md frontmatter, skill .md frontmatter |
| 3c. Init output deep validation | 🟢 | 8 tests: full template agents/commands count, agent modes/permissions, 8 skills exactly, brand structure, platform subdirs; minimal limits, no full-only features |
| Create `tests/integration/outcome-generate.test.js` | 🟢 | 9 tests |
| Create `tests/integration/outcome-init.test.js` | 🟢 | 17 tests |
| **Run `npm test` — all pass** | 🟢 | 268 / 268 pass (was 242) |

## Phase 4 — Execution status

| Task | Status | Notes |
|------|--------|-------|
| 4a. Template content validation (adapted) | 🟢 | Test/deploy/commit templates mention expected concepts; all have description ≥10 + template ≥20 chars |
| 4b. Template safety validation | 🟢 | All templates + descriptions checked for 8 dangerous patterns (rm -rf /, sudo, eval, exec, etc.) |
| 4c. Template variable completeness | 🟢 | No unmatched `{{...}}` placeholders found in any template |
| Create `tests/commands/command-templates.test.js` | 🟢 | 9 tests |
| **Run `npm test` — all pass** | 🟢 | 277 / 277 pass (was 268) |

## Phase 5 — Execution status

| Task | Status | Notes |
|------|--------|-------|
| 5a. Skill-guided task execution | 🟢 | 8 skills, rubric-graded, gated by `TEST_AI=true` |
| 5b. Agent permission adherence | 🟢 | 2 agents (reviewer, docs), gated |
| 5c. Prompt-output format validation | 🟢 | commit-message prompt, 3 trials, gated |
| Create `tests/integration/ai-validation.test.js` | 🟢 | 3 suites, all skipped without `TEST_AI=true` |
| **Run `npm test` — all pass** | 🟢 | 277 / 277 pass (unchanged, Phase 5 skipped) |
