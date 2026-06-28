# {{project_name}} — AI Agent Instructions

{{project_description}}

This repository is configured with **aramirez-ai** — an opencode AI configuration manager.

## Repository structure

```
{{project_name}}/
├── shared/              Centralized reusable assets
│   ├── skills/          SKILL.md format skill definitions
│   ├── prompts/         Reusable prompt fragments
│   ├── scripts/         Reusable automation scripts
│   └── rules/           Coding standards, architecture, documentation rules
├── platforms/           Agent configurations
│   └── opencode/        opencode.json, agents, commands
└── assets/              Brand logos, CSS templates, decks, images
    ├── images/          Brand logo files
    └── templates/       CSS templates for deck/report generation
```

## Key principles

- **OpenCode only**: All agent configuration is managed through opencode (opencode.json).
- **All skills are SKILL.md**: Skills live in `shared/skills/<name>/SKILL.md` with YAML frontmatter.
- **Cross-Platform Compatibility**: All code, scripts, and tools must run on both macOS and Windows.
- **Per-project installs**: `arai install` copies files locally — projects are self-contained.

## Available agents

| Agent | Mode | Description |
|-------|------|-------------|
| **build** (default) | primary | Default build agent for coding tasks |
| **plan** | primary | Planning agent for architecture and design (edit: deny) |
| **reviewer** | subagent | Code review specialist |
| **tester** | subagent | Testing specialist (bash: allow) |
| **docs** | subagent | Documentation specialist (edit: allow, bash: deny) |

## Available skills

| Skill | Description |
|-------|-------------|
| branding | Brand identity management |
| code-review | Code review workflows |
| content-ingestion | Content ingestion pipeline |
| document-generation | Document generation pipeline |
| git | Git operations |
| kb-management | Knowledge base management |
| pdf-extraction | PDF extraction |
| youtube | YouTube transcript extraction |

## CLI quick reference

| Command | Description |
|---------|-------------|
| `arai init <dir>` | Scaffold a new project (`--template minimal\|full`, `--description`) |
| `arai install` | Install opencode platform in current project |
| `arai install <type> <name>` | Install a component: skill, agent, script, prompt, rule |
| `arai uninstall` | Uninstall opencode platform |
| `arai uninstall <type> <name>` | Uninstall a specific component |
| `arai status` | Show installation status |
| `arai update` | Pull latest changes and install dependencies |
| `arai sync [type] [name]` | Sync project or component (`skill <name>` to sync single skill) |
| `arai list skills\|agents\|scripts\|templates\|commands\|mcp` | List available resources |
| `arai generate skill\|agent\|script\|command <name>` | Generate new components |
| `arai generate brand` | Configure brand identity |
| `arai generate kb [dir]` | Create Obsidian vault (`--force` to overwrite) |

## When working

- Follow the existing code style (see `shared/rules/code-style.md`)
- Use conventional commits (`<type>(<scope>): <description>`)
- Keep skills in SKILL.md format with YAML frontmatter
- Add new skills as `shared/skills/<name>/SKILL.md`

## Adding new agents

Run `arai generate agent <name>` to create an agent definition in `shared/agents/` and register it in `platforms/opencode/opencode.json`.
