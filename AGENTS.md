# aramirez-ai — AI Agent Instructions

{{project_description}}

This repository uses **arai** (open-code AI configuration manager) for multi-agent configuration.
Skills, scripts, and prompts are installed from the [aramirez-ai](https://github.com/aaramirez/aramirez-ai) repository.

## Repository structure

```
aramirez-ai/
  ├── .opencode/  OpenCode configuration
  │   ├── skills/
  │   ├── agents/
  │   ├── commands/
  │   └── scripts/
  ├── assets/  Brand logos, CSS templates, decks, images
  │   ├── decks/
  │   ├── docs/
  │   ├── images/
  │   └── templates/
  ├── repos/  Cloned reference repos (gitignored)
  ├── AGENTS.md
  ├── README.md
  ├── opencode.json
  ├── package.json
  └── repos.json
```

## Key principles

- **OpenCode only**: All agent configuration is managed through opencode (opencode.json).
- **Skills live in `.opencode/skills/<name>/SKILL.md`** with YAML frontmatter.
- **Cross-Platform Compatibility**: All code, scripts, and tools must run on both macOS and Windows.
- **Per-project installs**: `arai install` copies files locally — projects are self-contained.

## Available agents

| Agent | Mode | Permissions |
|-------|------|-------------|
| **build** (default) | primary | — |
| **docs** | subagent | bash: deny, edit: allow |
| **plan** | primary | edit: deny |
| **plan-arai** | primary | — |
| **reviewer** | subagent | edit: deny |
| **tester** | subagent | bash: allow |
| **new-harness** | primary | — |
| **config-creator** | subagent | — |
| **permission-creator** | subagent | — |
| **instructions-creator** | subagent | — |
| **mcp-creator** | subagent | — |
| **architecture-creator** | subagent | — |
| **flow-creator** | subagent | — |
| **plugin-creator** | subagent | — |
| **tool-creator** | subagent | — |
| **prompt-creator** | subagent | — |
| **rule-creator** | subagent | — |
| **reference-creator** | subagent | — |
| **command-creator** | subagent | — |
| **agent-creator** | subagent | — |
| **skill-creator** | subagent | — |
| **script-creator** | subagent | — |

## Available skills

| Skill | Description |
|-------|-------------|
| agent-creator | Create primary or subagent definitions with custom prompts, permissions, and model overrides. Use --preset for predefined profiles (reviewer, tester, docs, etc.). |
| architecture-creator | Create multi-agent architecture patterns — orchestrator, tiered, peer, or chain delegation models. |
| command-creator | Create custom opencode commands for repetitive tasks with templates and optional agent/model overrides. |
| config-creator | Create base opencode.json configuration with model, shell, compaction, and runtime settings. |
| distribution-pattern | Follow the four-layer distributable package pattern when creating new skills for shared/. |
| flow-creator | Create workflow sequences for agent collaboration — plan-first, TDD, hotfix, or custom stages. |
| harness-generator | Generate complete opencode harness configurations interactively via CLI commands. |
| instructions-creator | Create AGENTS.md with project instructions, workflow guidelines, and coding conventions. |
| mcp-creator | Create MCP server configurations — local processes, remote APIs, environment variables, and authentication. |
| permission-creator | Create permission rules for agents and tools — global defaults and per-agent overrides with glob patterns. |
| plugin-creator | Create plugin configurations — npm packages or local plugin directories extending opencode with custom tools and hooks. |
| prompt-creator | Create reusable prompt fragments for commit messages, review criteria, planning, and common patterns. |
| reference-creator | Create shared reference configurations for scripts, rules, and prompts across projects. |
| rule-creator | Create coding standards and architecture rule files for project consistency. |
| script-creator | Create reusable automation scripts in JavaScript (ESM), Python, or Bash with proper boilerplate. |
| skill-creator | Create reusable SKILL.md files with valid YAML frontmatter for agent skill discovery. |
| tool-creator | Create custom tool definitions with JSON Schema input validation for specialized agent capabilities. |

## Available scripts

| Script | Type |
|--------|------|
| .opencode/scripts/create-agent.js | file |
| .opencode/scripts/create-architecture.js | file |
| .opencode/scripts/create-base.js | file |
| .opencode/scripts/create-brand.js | file |
| .opencode/scripts/create-command.js | file |
| .opencode/scripts/create-config.js | file |
| .opencode/scripts/create-flow.js | file |
| .opencode/scripts/create-instructions.js | file |
| .opencode/scripts/create-mcp.js | file |
| .opencode/scripts/create-permission.js | file |
| .opencode/scripts/create-plugin.js | file |
| .opencode/scripts/create-prompt.js | file |
| .opencode/scripts/create-reference.js | file |
| .opencode/scripts/create-rule.js | file |
| .opencode/scripts/create-script.js | file |
| .opencode/scripts/create-skill.js | file |
| .opencode/scripts/create-tool.js | file |

## CLI quick reference

| Command | Description |
|---------|-------------|
| `arai init <dir>` | Scaffold new project (`--template minimal\|full`, `--description`) |
| `arai install` | Install opencode platform in project |
| `arai install <type> <name>` | Install component: skill, agent, script, prompt, rule |
| `arai uninstall` | Uninstall opencode platform from project |
| `arai uninstall <type> <name>` | Uninstall a specific component |
| `arai status` | Show installation status in current directory |
| `arai list skills\|agents\|scripts\|templates\|commands\|mcp` | List resources |

## When working

- Follow the existing code style (see `.opencode/rules/code-style.md`)
- Use conventional commits (`<type>(<scope>): <description>`)
- Keep skills in SKILL.md format with YAML frontmatter
- Add new skills as `.opencode/skills/<name>/SKILL.md`
