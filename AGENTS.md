# aramirez-ai — AI Agent Instructions

This repository is a **centralized multi-agent AI configuration manager** for opencode, Claude Code, Cursor, and Codex.

## Repository structure

```
aramirez-ai/
├── shared/           Centralized reusable assets
│   ├── skills/       SKILL.md format (compatible with opencode + claude)
│   ├── prompts/      Reusable prompt fragments
│   ├── scripts/      Executable scripts (bash/node/py)
│   ├── rules/        Coding standards, architecture, documentation rules
│   └── templates/    Project scaffolding templates (init command)
├── platforms/        Per-agent configurations
│   ├── opencode/     opencode.json, agents, commands, plugins, mcp, skills
│   ├── claude/       CLAUDE.md
│   ├── cursor/       .cursorrules + rules/
│   └── codex/        Codex config
├── transforms/       Transformation scripts (SKILL.md → target format)
└── bin/arai.js       CLI multi-agent installer + scaffolder
```

## Key principles

- **Write once, use everywhere**: Skills live in `shared/skills/` and are consumed natively or transformed.
- **Agents are defined in `platforms/opencode/opencode.json`** and `platforms/opencode/agents/*.md`.
- **Commands** are in `platforms/opencode/commands/*.md`.
- **CLI tool** `arai` handles install, transform, status, and scaffolding.
- **Scaffolding**: Use `arai init <dir>` to generate the full AI-agent structure in any new project.
- **Templates** live in `shared/templates/<name>/template.json` and define what to include.
- **Custom templates** go in `~/.config/arai/templates/` — same format as built-in.

## Skills

Skills are in `shared/skills/<name>/SKILL.md` with frontmatter:
```yaml
---
name: <skill-name>
description: What this skill does
license: MIT
---
```

After editing skills, run `arai transform skills --all` to regenerate platform-specific formats.

## Installation

```bash
npm install && npm link
arai install opencode --global
arai status
```

## Scaffolding new projects

```bash
# Create a new project with full AI-agent structure
arai init my-new-project --template full

# Minimal setup (core skills + opencode only, default)
arai init my-new-project --template minimal

# List available templates
arai template list
```

Templates are JSON manifests in `shared/templates/<name>/template.json`.  
Create custom templates in `~/.config/arai/templates/` with the same format.

## Component generation

```bash
# Create a new skill
arai generate skill api-client

# Create a new agent (auto-registers in opencode.json)
arai generate agent security-reviewer --description "Security code review specialist"

# Create a reusable script
arai generate script data-migration --description "Database migration utility"

# Create an opencode command
arai generate command lint --description "Run linter and fix issues"
```

## Skills sync

```bash
# Sync shared/skills/ to global opencode config
arai skills sync

# Sync to project-level .opencode/skills/
arai skills sync --project .
```

## Knowledge base

```bash
# Create an Obsidian vault (kb/) in current directory
arai kb install

# Create in a specific location
arai kb install ~/my-vault

# Overwrite if exists
arai kb install --force
```

## CI validation

```bash
# Validate project structure and check for TODOs
node shared/scripts/ci-validate.js
node shared/scripts/ci-validate.js --strict   # warnings fail too
node shared/scripts/ci-validate.js --verbose  # show all checks
```

## Brand identity

```bash
# Configure brand colors and logo
arai generate brand --name "Mi Empresa" --primary "#1a365d" --secondary "#2b6cb0"

# Replace logo
arai generate brand --logo path/to/logo.svg --logo-white path/to/logo-white.svg
```

## When working

- Follow the existing code style (see `shared/rules/code-style.md`)
- Use conventional commits
- Keep skills in SKILL.md format
- Update AGENTS.md if workflow changes
- **Proactive Skills**: Every time a new problem or workflow is resolved, consider and propose the creation of a new **skill** (and optional script) so that the solution becomes reusable across all agents.
- **Cross-Platform Compatibility**: All proposed code, scripts, configurations, and tools **must run on both macOS and Windows**. Avoid OS-specific shell commands unless wrapped in cross-platform scripts (e.g. Node.js or Python).

## Reference repos

Reference repositories are cloned under `repos/` (gitignored). Use them as a source of patterns, scripts, examples, and configurations — but never modify them directly.

### Adding a new repo

1. Add an entry to `repos.json` (project root):
   ```json
   {
     "name": "owner/repo",
     "url": "https://github.com/owner/repo.git",
     "description": "What this repo is useful for"
   }
   ```
2. Run the sync script:
   ```bash
   node shared/scripts/repos-sync.js
   ```

### Available commands

```bash
# Sync all repos
node shared/scripts/repos-sync.js

# Sync a specific repo
node shared/scripts/repos-sync.js anthropics/skills

# List configured repos with clone status
node shared/scripts/repos-sync.js --list
```

### How to reference

When using code from a reference repo, always cite the source in comments or documentation:
```
// Adapted from repos/anthropics/skills/skills/mcp-builder/SKILL.md
```
