# aramirez-ai — AI Agent Instructions

This repository is a **centralized multi-agent AI configuration manager** for opencode, Claude Code, Cursor, and Codex. It also powers a **document generation pipeline** (Node.js ESM) and a **project scaffolding CLI** (`arai init`).

## Repository structure

```
aramirez-ai/
├── shared/           Centralized reusable assets
│   ├── skills/       SKILL.md format (compatible with opencode + claude)
│   ├── prompts/      Reusable prompt fragments
│   ├── scripts/      Executable scripts (Node.js, bash)
│   ├── rules/        Coding standards, architecture, documentation rules
│   └── templates/    Project scaffolding templates (init command)
├── platforms/        Per-agent configurations
│   ├── opencode/     opencode.json, agents, commands, plugins, mcp, skills
│   ├── claude/       CLAUDE.md
│   ├── cursor/       .cursorrules + rules/
│   └── codex/        Codex config
├── transforms/       Transformation scripts (SKILL.md → target format)
├── assets/           Brand logos, CSS templates, test decks, generated docs/images
│   ├── decks/        Test deck specs (JSON, MD)
│   ├── templates/    deck.css, report.css
│   └── docs/         Generated PDFs, HTML
├── repos/            Cloned reference repos (gitignored)
├── bin/arai.js       CLI multi-agent installer + scaffolder
├── AGENTS.md         This file
└── README.md         Full human documentation (Spanish)
```

## Key principles

- **Write once, use everywhere**: Skills live in `shared/skills/` and are consumed natively or transformed.
- **Agents are defined in `platforms/opencode/opencode.json`** and `platforms/opencode/agents/*.md`.
- **Commands** are in `platforms/opencode/commands/*.md`.
- **CLI tool** `arai` handles install, uninstall, init, generate, transform, sync, status, update.
- **Scaffolding**: Use `arai init <dir>` to generate the full AI-agent structure in any new project.
- **Templates** live in `shared/templates/<name>/template.json` and define what to include.
- **Custom templates** go in `~/.config/arai/templates/` — same format as built-in.
- **Docgen pipeline** lives in `shared/scripts/docgen/` — all Node.js ESM, zero external deps.

## CLI quick reference

| Command | Description |
|---------|-------------|
| `arai install <agent> --global` | Install agent globally (opencode, claude, cursor, codex) |
| `arai install <agent> --project .` | Install agent in project (env var mode) |
| `arai install <agent> --project . --copy` | Install agent in project (copy mode) |
| `arai uninstall <agent>` | Uninstall global config |
| `arai uninstall <agent> --project .` | Uninstall project config |
| `arai uninstall <agent> --project . --copy` | Remove copied files |
| `arai status` | Show all agent installation states |
| `arai update` | `git pull` + `npm install` |
| `arai sync [agent]` | Re-apply project config after update |
| `arai init <dir>` | Scaffold new project (`--template full\|minimal`, `--description`) |
| `arai template list` | List available scaffolding templates |
| `arai skills sync` | Sync skills to opencode (`--project .` for project) |
| `arai skills sync --skill <name>` | Sync a single skill |
| `arai list skills\|agents\|scripts\|templates\|commands\|mcp` | List resources |
| `arai kb install [dir]` | Create Obsidian vault (`--force` to overwrite) |
| `arai generate skill <name>` | Create skill (`--dir`, `--description`) |
| `arai generate agent <name>` | Create agent + register in opencode.json |
| `arai generate script <name>` | Create reusable script |
| `arai generate command <name>` | Create opencode command |
| `arai generate brand` | Set brand identity (colors, logos) |
| `arai transform skills` | Transform skills to platform formats (`--to cursor\|codex`, `--all`) |

Full detail for every command is in `README.md`.

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

After editing skills, run `arai transform skills --all` to regenerate platform-specific formats.

Sync a single skill to a project:
```bash
arai skills sync --skill pdf-extraction --project .
```

List available skills:
```bash
arai list skills
```

## Agents (opencode.json)

| Agent | Mode | Model | Permissions |
|-------|------|-------|-------------|
| **build** (default) | primary | `big-pickle` | — |
| **plan** | primary | `big-pickle` | `edit: deny` |
| **build-sonnet** | primary | `claude-sonnet-4-6` | — |
| **plan-sonnet** | primary | `claude-sonnet-4-6` | `edit: deny` |
| **reviewer** | subagent | `claude-sonnet-4-6` | `edit: deny` |
| **tester** | subagent | `claude-haiku-4-5` | `bash: allow` |
| **docs** | subagent | `claude-haiku-4-5` | `edit: allow`, `bash: deny` |

## When working

- Follow existing code style (see `shared/rules/code-style.md`)
- Use conventional commits
- Keep skills in SKILL.md format
- Update AGENTS.md if workflow changes
- **Proactive Skills**: Every time a new problem or workflow is resolved, consider and propose the creation of a new **skill** (and optional script) so that the solution becomes reusable across all agents.
- **Cross-Platform Compatibility**: All proposed code, scripts, configurations, and tools **must run on both macOS and Windows**. Avoid OS-specific shell commands unless wrapped in cross-platform scripts (e.g. Node.js or Python).

## aramirez-ai as base template for new projects

Use `arai init <dir>` to scaffold a new project with the same AI-agent structure (agents, skills, scripts, branding, CI). The generated project gets the same `shared/`, `platforms/`, `transforms/` structure, pre-configured with aramirez-ai's reusable skills.

```bash
arai init my-new-project                # minimal template (default)
arai init my-new-project --template full # complete structure
arai install opencode --project .        # add opencode to existing project
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
