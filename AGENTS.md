# aramirez-ai — AI Agent Instructions

This repository is a **centralized multi-agent AI configuration manager** for opencode. It also powers a **document generation pipeline** (Node.js ESM) and a **project scaffolding CLI** (`arai init`).

## Repository structure

```
aramirez-ai/
├── shared/              Centralized reusable assets
│   ├── agents/          Agent definition files (.md)
│   ├── skills/          SKILL.md format skill definitions
│   ├── prompts/         Reusable prompt fragments
│   ├── scripts/         Executable scripts (Node.js)
│   │   └── docgen/      Document generation pipeline
│   ├── rules/           Coding standards, architecture, documentation rules
│   └── templates/       Project scaffolding templates (init command)
│       ├── minimal/     Minimal template (core skills + opencode)
│       ├── full/        Full template (all skills, assets, branding)
│       └── partials/    Template partials (AGENTS.md, opencode.json, etc.)
├── .opencode/           Source of truth — agents, commands, plugins, tui
│   ├── agents/          Agent .md files (docs, plan-arai, reviewer, tester)
│   ├── commands/        Command .md files (commit, deploy, email, test)
│   ├── plugins/         TUI plugins (custom-logo)
│   └── tui.json         TUI plugin configuration
├── opencode.json        Source of truth — full opencode configuration
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

Available skills: **branding**, **code-review**, **content-ingestion**, **document-generation**, **email**, **git**, **google-workspace**, **kb-management**, **m365**, **pdf-extraction**, **vault-pdf-export**, **youtube** (in `shared/skills/`), plus **15 creator skills** (`agent-creator`, `config-creator`, `skill-creator`, etc.) in `.opencode/skills/` that generate harness components programmatically.

### Skill de YouTube

El skill `youtube` permite obtener transcripciones de cualquier video de YouTube y usarlas para generar notas de curso, resúmenes o análisis.

```bash
node shared/scripts/youtube-transcript.js <video-id-or-url> --lang es
```

**Importante**: Cada vez que uses este skill, guarda la transcripción como referencia en el vault de Obsidian en `curso-ia/Transcripciones/<id> - <titulo>.md`. Esto mantiene un registro permanente del material fuente.

After creating or editing a skill, run `arai sync skill <name>` to sync it to the opencode skills directory.

### Harness Creator Scripts

16 Node.js scripts in `.opencode/scripts/` that generate harness components (agents, configs, skills, MCP servers, etc.):

```bash
node .opencode/scripts/create-agent.js --name my-agent --mode primary
node .opencode/scripts/create-agent.js --name reviewer --preset reviewer
node .opencode/scripts/create-config.js --model opencode/big-pickle
node .opencode/scripts/create-mcp.js --name my-mcp --type remote --url https://...
```

All creator scripts support `--dry-run` to preview output and `--help` for usage. See `docs/harness-course-plan.md` for the full reference.

## MCP Servers

Additional MCP servers configured in `opencode.json` (all disabled by default):

| Server | Type | Description |
|--------|------|-------------|
| **google-workspace** | local (`npx -y @google/mcp-workspace`) | Official Google MCP — Drive, Docs, Sheets, Slides, Calendar, Gmail |
| **m365** | local (`npx -y @softeria/ms-365-mcp-server`) | Microsoft 365 Graph API — OneDrive, SharePoint, Outlook, Teams, Calendar |
| **email** | local (`node shared/scripts/mcp-email.js`) | SMTP email — 3 interfaces: MCP server, `/email` command, `send-email.js` CLI |

Enable by setting `"enabled": true` in the server entry. Both google-workspace and m365 require one-time OAuth setup (documented in their respective skills).

## Agents (opencode.json)

| Agent | Mode | Permissions |
|-------|------|-------------|
| **build** (default) | primary | — |
| **plan** | primary | `edit: deny` |
| **plan-arai** | primary | Plan mode que documenta en `plans/` |
| **reviewer** | subagent | `edit: deny` |
| **tester** | subagent | `bash: allow` |
| **docs** | subagent | `edit: allow`, `bash: deny` |
| **new-harness** | primary | `edit: allow`, `bash: allow`, `read: allow` |
| **config-creator** | subagent | Genera `opencode.json` personalizado |
| **permission-creator** | subagent | Genera configuración de permisos |
| **instructions-creator** | subagent | Genera `AGENTS.md` personalizado |
| **mcp-creator** | subagent | Genera configuraciones MCP |
| **architecture-creator** | subagent | Genera documentación de arquitectura |
| **flow-creator** | subagent | Genera flujos de trabajo |
| **plugin-creator** | subagent | Genera plugins de TUI |
| **tool-creator** | subagent | Genera herramientas personalizadas |
| **prompt-creator** | subagent | Genera prompts reutilizables |
| **rule-creator** | subagent | Genera reglas de código |
| **reference-creator** | subagent | Genera referencias a repos |
| **command-creator** | subagent | Genera comandos personalizados |

All agents use model `opencode/big-pickle` by default. Agents are defined in `opencode.json` and configured with `.md` files in `.opencode/agents/`.

## OpenCode commands

4 commands defined in `opencode.json` and configured with `.md` files in `.opencode/commands/`:

| Command | Description |
|---------|-------------|
| `commit` | Generate a conventional commit message from staged changes |
| `deploy` | Deploy the project (run deployment scripts) |
| `email` | Send an email via SMTP (requires `.env` SMTP config) |
| `test` | Run the test suite |

Agents can invoke these via `/command` in conversation.

## TUI configuration

`opencode.json` and `.opencode/tui.json` + `.opencode/plugins/` configure the opencode terminal UI, including theme, keybindings, and plugin toolbars.

## Install behavior by type

| Type | Source | Destination | Auto-installs opencode? |
|------|--------|-------------|------------------------|
| platform | `.opencode/` + `opencode.json` | `.opencode/` + `opencode.json` | N/A |
| skill | `shared/skills/<name>/SKILL.md` | `.opencode/skills/<name>/SKILL.md` | Yes |
| agent | `.opencode/agents/<name>.md` | `.opencode/agents/<name>.md` + `opencode.json` entry | Yes |
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

Use `arai init <dir>` to scaffold a new project with the same AI-agent structure. The generated project gets the same `shared/` structure with `.opencode/` and `opencode.json`, pre-configured with aramirez-ai's reusable skills.

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
                               → components.js (reusable slide components)
                               → theme-utils.js (theme helpers)
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
node shared/scripts/docgen-vault.js <vault-dir>  # Export Obsidian vault to PDF
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

### Vault export

`shared/scripts/docgen-vault.js` exports an Obsidian vault to a professional PDF via the docgen pipeline:

```bash
node shared/scripts/docgen-vault.js <vault-dir>
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

## Test suite

```bash
npm test                              # full suite (node:test)
node --test tests/consistency/        # consistency subset only
```

Full outcome-validation plan in [`docs/outcome-validation-plan.md`](docs/outcome-validation-plan.md) (5 phases, phases 1–4 deterministic in CI, phase 5 gated by `TEST_AI=true`).

## Document Templates

29 plantillas de documentos en `assets/templates/specs/` para el pipeline docgen. Cada template es un JSON que puedes editar y construir con:

```bash
npm run docgen:<nombre>   # genera PDF/HTML/PNG
```

Comunicación periódica (deck+report): weekly-status, weekly-slides, sprint, sprint-report, planning, planning-report, status, status-report, release, release-report.
Documentación técnica (deck+report): tech-design, tech-design-report, adr, adr-slides, api, api-report, architecture, architecture-report, runbook, runbook-report.
Gestión: sow, charter, decision-log.
Calidad: postmortem, test-report.
Métricas/Equipo: dashboard, team, minutes, team-member-profile.

Ver `docs/templates-plan.md` para el detalle completo.

## CI validation

```bash
node shared/scripts/ci-validate.js                    # project structure checks
node shared/scripts/ci-validate.js --strict           # warnings fail too
node shared/scripts/ci-validate.js --verbose          # show all checks
node shared/scripts/docgen/validate.js                # docgen pipeline checks
node shared/scripts/docgen/validate.js --quick        # syntax + templates only
```
