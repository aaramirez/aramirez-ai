# aramirez-ai — AI Agent Instructions

This repository is a **centralized multi-agent AI configuration manager** for opencode, Claude Code, Cursor, and Codex.

## Repository structure

```
aramirez-ai/
├── shared/           Centralized reusable assets
│   ├── skills/       SKILL.md format (compatible with opencode + claude)
│   ├── prompts/      Reusable prompt fragments
│   ├── scripts/      Executable scripts (bash/node/py)
│   └── rules/        Coding standards, architecture, documentation rules
├── platforms/        Per-agent configurations
│   ├── opencode/     opencode.json, agents, commands, plugins, mcp, skills
│   ├── claude/       CLAUDE.md
│   ├── cursor/       .cursorrules + rules/
│   └── codex/        Codex config
├── transforms/       Transformation scripts (SKILL.md → target format)
└── bin/arai.js       CLI multi-agent installer
```

## Key principles

- **Write once, use everywhere**: Skills live in `shared/skills/` and are consumed natively or transformed.
- **Agents are defined in `platforms/opencode/opencode.json`** and `platforms/opencode/agents/*.md`.
- **Commands** are in `platforms/opencode/commands/*.md`.
- **CLI tool** `arai` handles install, transform, and status.

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

## When working

- Follow the existing code style (see `shared/rules/code-style.md`)
- Use conventional commits
- Keep skills in SKILL.md format
- Update AGENTS.md if workflow changes
- **Proactive Skills**: Every time a new problem or workflow is resolved, consider and propose the creation of a new **skill** (and optional script) so that the solution becomes reusable across all agents.
- **Cross-Platform Compatibility**: All proposed code, scripts, configurations, and tools **must run on both macOS and Windows**. Avoid OS-specific shell commands unless wrapped in cross-platform scripts (e.g. Node.js or Python).
