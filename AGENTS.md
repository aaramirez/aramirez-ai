# aramirez-ai — AI Agent Instructions

This repository is a **centralized multi-agent AI configuration manager** for opencode. It also powers a **document generation pipeline** (Node.js ESM) and a **project scaffolding CLI** (`arai init`).

## Repository structure

```
aramirez-ai/
├── shared/              Centralized reusable assets
│   ├── skills/          SKILL.md format skill definitions
│   ├── prompts/         Reusable prompt fragments
│   ├── scripts/         Executable scripts (Node.js)
│   │   └── docgen/      Document generation pipeline
│   ├── rules/           Coding standards, architecture, documentation rules
│   └── templates/       Project scaffolding templates (init command)
│       ├── minimal/     Minimal template (core skills + opencode)
│       ├── full/        Full template (all skills, assets, branding)
│       └── partials/    Template partials (AGENTS.md, opencode.json, etc.)
├── platforms/           Agent configurations
│   └── opencode/        opencode.json, agents, commands
├── assets/              Brand logos, CSS templates, test decks, generated docs
│   ├── decks/           Test deck specs (JSON, MD)
│   ├── templates/       deck.css, report.css
│   └── docs/            Generated PDFs, HTML
├── repos/               Cloned reference repos (gitignored)
├── tests/               Test suite (node:test)
│   ├── consistency/     File structure and content consistency tests
│   ├── commands/        CLI command tests
│   └── integration/     Full lifecycle integration tests
├── bin/arai.js          CLI installer + scaffolder
├── AGENTS.md            This file
└── README.md            Full human documentation (Spanish)
```

## Key principles

- **OpenCode only**: The system manages opencode configuration exclusively.
- **Per-project installs**: `arai install` copies files locally — projects are self-contained.
- **Always copy mode**: Files are copied, not symlinked or env-var based.
- **Skills live in `shared/skills/<name>/SKILL.md`** with YAML frontmatter. No transforms needed — opencode reads SKILL.md natively.
- **Test-driven**: Every change starts with a failing test. Run `npm test` before committing.
- **Cross-Platform Compatibility**: All code, scripts, and configurations must run on both macOS and Windows.

## CLI quick reference

| Command | Description |
|---------|-------------|
| `arai init <dir>` | Scaffold new project (`--template minimal\|full`, `--description`) |
| `arai install` | Install opencode platform in project |
| `arai install <type> <name>` | Install component: skill, agent, script, prompt, rule |
| `arai uninstall` | Uninstall opencode platform from project |
| `arai uninstall <type> <name>` | Uninstall a specific component |
| `arai status` | Show installation status in current directory |
| `arai update` | `git pull` + `npm install` |
| `arai sync` | Re-apply project-level opencode config |
| `arai list skills\|agents\|scripts\|templates\|commands\|mcp` | List resources |
| `arai generate skill <name>` | Create skill in `shared/skills/` |
| `arai generate agent <name>` | Create agent + register in opencode.json |
| `arai generate script <name>` | Create reusable script |
| `arai generate command <name>` | Create opencode command |
| `arai generate brand` | Set brand identity (colors, logos) |
| `arai sync [type] [name]` | Sync project or component (`skill <name>` to sync single skill) |
| `arai generate kb [dir]` | Create Obsidian vault (`--force` to overwrite) |

All install/uninstall commands accept `--project <dir>` (default: `.`).

## Skills

Skills are in `shared/skills/<name>/SKILL.md` with frontmatter:
```yaml
---
name: <skill-name>
description: What this skill does
license: MIT
---
```

Available skills: **branding**, **code-review**, **content-ingestion**, **document-generation**, **git**, **kb-management**, **pdf-extraction**, **youtube**.

After creating or editing a skill, run `arai sync skill <name>` to sync it to the opencode skills directory.

## Agents (opencode.json)

| Agent | Mode | Permissions |
|-------|------|-------------|
| **build** (default) | primary | — |
| **plan** | primary | `edit: deny` |
| **reviewer** | subagent | `edit: deny` |
| **tester** | subagent | `bash: allow` |
| **docs** | subagent | `edit: allow`, `bash: deny` |

All agents use model `opencode/big-pickle` by default. Agents are defined in `platforms/opencode/opencode.json` and configured with `.md` files in `platforms/opencode/agents/`.

## Install behavior by type

| Type | Source | Destination | Auto-installs opencode? |
|------|--------|-------------|------------------------|
| platform | `platforms/opencode/` | `.opencode/` + `opencode.json` | N/A |
| skill | `shared/skills/<name>/SKILL.md` | `.opencode/skills/<name>/SKILL.md` | Yes |
| agent | `platforms/opencode/agents/<name>.md` | `.opencode/agents/<name>.md` + `opencode.json` entry | Yes |
| script | `shared/scripts/<name>.js` | `shared/scripts/<name>.js` | No |
| prompt | `shared/prompts/<name>.md` | `shared/prompts/<name>.md` | No |
| rule | `shared/rules/<name>.md` | `shared/rules/<name>.md` | No |

## When working

- Follow existing code style (see `shared/rules/code-style.md`)
- Add tests for any new CLI behavior (see `tests/` for patterns)
- Keep skills in SKILL.md format with YAML frontmatter (`name:`, `description:`, `license: MIT`)
- After editing skills, sync with `arai sync skill`
- **Proactive Skills**: When a new problem or workflow is resolved, consider creating a new **skill** so the solution becomes reusable across all agents.

## aramirez-ai as base template for new projects

Use `arai init <dir>` to scaffold a new project with the same AI-agent structure. The generated project gets the same `shared/`, `platforms/` structure, pre-configured with aramirez-ai's reusable skills.

```bash
arai init my-new-project                 # minimal template (default)
arai init my-new-project --template full  # complete structure
arai install                              # add opencode to existing project
```

## Document generation pipeline

`shared/scripts/docgen/` builds presentation decks, executive reports, standalone images, web presentations, and PowerPoint files from JSON/Markdown specs.

### Architecture

```
spec.json/md → index.js (core) → charts.js (13 SVG chart types)
                               → html-theme.js (20+ slide layouts)
                               → report-theme.js (10 report layouts)
                               → SVG rendering (rsvg-convert / browser)
Builders: build-deck.js, build-report.js, build-image.js, build-web.js, build-pptx.js
```

### Usage

```bash
node shared/scripts/docgen/build-deck.js assets/decks/deck.json
node shared/scripts/docgen/build-report.js assets/decks/report.json
node shared/scripts/docgen/build-image.js assets/decks/slide.json --format png
node shared/scripts/docgen/build-web.js assets/decks/deck.json
node shared/scripts/docgen/build-pptx.js assets/decks/deck.json
node shared/scripts/docgen/validate.js
```

### npm scripts

```bash
npm run docgen:deck   assets/decks/deck.json
npm run docgen:report assets/decks/report.json
npm run docgen:image  assets/decks/slide.json -- --format png
npm run docgen:web    assets/decks/deck.json
npm run docgen:pptx   assets/decks/deck.json
npm run docgen:validate
```

### Outputs

All artifacts go to `assets/docs/` and `assets/images/` by default. Override with `--output <path>`. Test files in `assets/decks/` exercise every slide type and chart.

### Requirements

- **Required**: Node.js 18+
- **Optional**: `rsvg-convert` (librsvg), ImageMagick, Chromium for browser-based PDF, Python 3.6+ with `python-pptx` for PPTX

### Brand colors

Loaded from `shared/brand.json` at runtime and injected into CSS `:root` variables. Brand config managed via `arai generate brand`.

## Reference repos

Repos cloned under `repos/` (gitignored). Use as pattern/source but never modify directly. Managed via `repos.json` and `node shared/scripts/repos-sync.js`.

```bash
node shared/scripts/repos-sync.js              # sync all
node shared/scripts/repos-sync.js --list       # list status
```

When using code from a reference repo, always cite:
```
// Adapted from repos/anthropics/skills/skills/mcp-builder/SKILL.md
```

## CI validation

```bash
node shared/scripts/ci-validate.js                    # project structure checks
node shared/scripts/ci-validate.js --strict           # warnings fail too
node shared/scripts/ci-validate.js --verbose          # show all checks
node shared/scripts/docgen/validate.js                # docgen pipeline checks
node shared/scripts/docgen/validate.js --quick        # syntax + templates only
```
