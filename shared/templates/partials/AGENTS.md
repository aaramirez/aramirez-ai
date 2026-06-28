# {{project_name}} — AI Agent Instructions

This repository is configured with the **aramirez-ai** multi-agent AI system for opencode, Claude Code, Cursor, and Codex.

## Structure

```
{{project_name}}/
├── shared/              Centralized reusable assets
│   ├── skills/          SKILL.md format (compatible with opencode + claude)
│   ├── prompts/         Reusable prompt fragments
│   └── rules/           Coding standards, architecture, documentation rules
├── platforms/           Per-agent configurations
│   ├── opencode/        opencode.json, agents, commands
│   ├── claude/          CLAUDE.md
│   ├── cursor/          .cursorrules + rules/
│   └── codex/           Codex config
└── transforms/          Transformation scripts (SKILL.md → target format)
```

## Key principles

- **Write once, use everywhere**: Skills live in `shared/skills/` and are consumed natively or transformed.
- **Cross-Platform Compatibility**: All code, scripts, and tools must run on both macOS and Windows.

## When working

- Follow the existing code style (see `shared/rules/code-style.md`)
- Use conventional commits (`<type>(<scope>): <description>`)
- Keep skills in SKILL.md format with YAML frontmatter
- After editing skills, run the transform to regenerate platform-specific formats
