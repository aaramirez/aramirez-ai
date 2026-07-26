# Plan 054: KB Creation & Installation System

## Objective

Create a system to initialize new knowledge bases from a template, track them in repos.json, and auto-install them in projects that need them.

## Context

Currently, KBs are created manually with no standardized way to:
1. Initialize a new KB from a template
2. Register it in repos.json for other projects to clone
3. Auto-reference it in AGENTS.md when installed

The existing `kb-management` skill only handles maintenance, not creation or installation.

## Architecture

### Two Operations

**1. `kb init <name>` — Create a new KB**
- Creates directory structure with standard files
- Initializes git repo
- Pushes to GitHub
- Adds entry to repos.json

**2. `kb install <name>` (via arai) — Install an existing KB**
- Clones from repos.json via repos-sync
- Adds reference to AGENTS.md
- Makes KB available for use

### Standard KB Structure

```
<name>-kb/
├── Index.md                    # Entry point with navigation
├── como-usar-este-kb.md        # Usage guide
├── <prefix>-glossary.md        # Glossary of terms
├── <prefix>-timeline.md        # Historical timeline
├── 01-<Section>/               # Numbered sections
│   ├── README.md               # Section overview
│   └── *.md                    # Content notes
├── 02-<Section>/
│   └── ...
└── references/                 # Source materials (PDFs, etc.)
```

### Frontmatter Standard

```yaml
---
title: "Note Title"
tags:
  - <kb-prefix>/<section>
  - type/concepto
  - difficulty/principiante
created: YYYY-MM-DD
updated: YYYY-MM-DD
category: "Section Name"
---
```

## Requirements

1. `kb init <name> --prefix <prefix> --description <desc>` command — priority: high
2. Template directory with standard files — priority: high
3. Auto-add to repos.json after creation — priority: high
4. `kb install <name>` integration with arai — priority: high
5. Auto-reference in AGENTS.md on install — priority: high
6. Support both educational and organizational KB types — priority: medium
7. Validation of KB structure — priority: medium

## Files to Create

- `shared/skills/kb-management/scripts/kb-init.js` — KB creation script
- `shared/templates/kb/` — Template directory with standard files
- `tests/commands/kb-init.test.js` — Tests

## Files to Modify

- `shared/commands/kb.md` — Add init/install subcommands
- `shared/skills/kb-management/SKILL.md` — Document creation workflow
- `repos.json` — Add new KBs as they're created

## TDD Flow

1. Write test for `kb init` creating directory structure → FAIL
2. Implement kb-init.js → PASS
3. Write test for repos.json update → FAIL
4. Implement repos.json integration → PASS
5. Write test for AGENTS.md reference → FAIL
6. Implement AGENTS.md update → PASS

## Verification

- [ ] `node shared/skills/kb-management/scripts/kb-init.js test-kb --prefix test` creates standard structure
- [ ] New entry added to repos.json
- [ ] `arai init` in another project + repos-sync clones the KB
- [ ] AGENTS.md references the new KB
- [ ] All tests pass
